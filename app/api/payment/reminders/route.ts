import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

// GET /api/payment/reminders - List payment reminders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role (CEO=100 or Manager=90)
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level < 90) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = await createAdminClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('payment_reminders')
      .select(`
        *,
        transaction:payment_transactions(
          transaction_id,
          amount,
          purpose,
          user:users(full_name, email, phone)
        )
      `, { count: 'exact' })
      .order('scheduled_for', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: reminders, error, count } = await query;

    if (error) {
      console.error('Failed to fetch reminders:', error);
      throw error;
    }

    return NextResponse.json({
      reminders,
      pagination: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Reminders fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch reminders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/payment/reminders - Create payment reminder (Admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role (CEO=100 or Manager=90)
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level < 90) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { transaction_id, reminder_type = 'email', scheduled_for } = body;

    // Validation
    if (!transaction_id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!['email', 'sms', 'both'].includes(reminder_type)) {
      return NextResponse.json({ error: 'Invalid reminder type' }, { status: 400 });
    }

    const supabaseAdmin = await createAdminClient();

    // Verify transaction exists and is pending
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('payment_transactions')
      .select('id, status, user_id')
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Reminders can only be set for pending transactions',
        current_status: transaction.status 
      }, { status: 400 });
    }

    // Calculate scheduled time (default to 24 hours from now)
    const scheduledTime = scheduled_for 
      ? new Date(scheduled_for)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create reminder
    const { data: reminder, error: createError } = await supabaseAdmin
      .from('payment_reminders')
      .insert({
        transaction_id,
        reminder_type,
        scheduled_for: scheduledTime.toISOString(),
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create reminder:', createError);
      throw createError;
    }

    return NextResponse.json({
      success: true,
      reminder,
      message: 'Reminder scheduled successfully',
    });

  } catch (error) {
    console.error('Reminder creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create reminder',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PATCH /api/payment/reminders - Send pending reminders (System/Admin only)
export async function PATCH() {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role (CEO=100 or Manager=90)
    const { data: userData } = await supabase
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level < 90) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabaseAdmin = await createAdminClient();

    // Fetch due reminders
    const { data: reminders } = await supabaseAdmin
      .from('payment_reminders')
      .select(`
        *,
        transaction:payment_transactions(
          transaction_id,
          amount,
          purpose,
          user:users(id, full_name, email, phone)
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50); // Process max 50 reminders per call

    if (!reminders || reminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending reminders to send',
        sent: 0,
      });
    }

    const results = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const reminder of reminders) {
      try {
        const transaction = reminder.transaction;
        const customer = transaction?.user;

        if (!customer) {
          throw new Error('Customer information not found');
        }

        // Send reminder based on type
        if (reminder.reminder_type === 'email' || reminder.reminder_type === 'both') {
          await sendEmailReminder(customer, transaction);
        }

        if (reminder.reminder_type === 'sms' || reminder.reminder_type === 'both') {
          await sendSMSReminder(customer, transaction);
        }

        // Update reminder status
        await supabaseAdmin
          .from('payment_reminders')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', reminder.id);

        results.push({ id: reminder.id, status: 'success' });
        sentCount++;

      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        
        // Update reminder with error
        await supabaseAdmin
          .from('payment_reminders')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', reminder.id);

        results.push({ 
          id: reminder.id, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders, ${failedCount} failed`,
      sent: sentCount,
      failed: failedCount,
      results,
    });

  } catch (error) {
    console.error('Reminder sending error:', error);
    return NextResponse.json({ 
      error: 'Failed to send reminders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper: Send email reminder
async function sendEmailReminder(
  customer: { id: string; full_name?: string; email: string; phone?: string },
  transaction: { transaction_id: string; amount: number; purpose?: string }
) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0070f3;">Payment Reminder</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Dear ${customer.full_name || 'Customer'},</p>
          <p>This is a reminder that you have a pending payment:</p>
          
          <div style="background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0070f3;">
            <p><strong>Amount:</strong> ${transaction.amount} BDT</p>
            ${transaction.purpose ? `<p><strong>Purpose:</strong> ${transaction.purpose}</p>` : ''}
            <p><strong>Transaction ID:</strong> ${transaction.transaction_id}</p>
          </div>
          
          <p>Please complete your payment as soon as possible to avoid any disruptions.</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenoftech.org'}/dashboard" 
             style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Payment
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          If you've already made this payment, please disregard this reminder.
        </p>
      </div>
    `;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@kitchenoftech.org',
      to: customer.email,
      subject: `Payment Reminder: ${transaction.amount} BDT Pending`,
      html: emailHtml,
    });

    if (result.error) {
      throw new Error(`Resend error: ${result.error.message}`);
    }

    console.log(`✅ Email reminder sent to ${customer.email} for transaction ${transaction.transaction_id}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send email reminder:`, error);
    throw error;
  }
}

// Helper: Send SMS reminder
async function sendSMSReminder(
  customer: { id: string; full_name?: string; email: string; phone?: string },
  transaction: { transaction_id: string; amount: number; purpose?: string }
) {
  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`SMS reminder pending for ${customer.phone}: ${transaction.amount} BDT payment due`);
  
  // Example with Twilio (when integrated):
  // import twilio from 'twilio';
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   to: customer.phone,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   body: `Payment Reminder: ${transaction.amount} BDT pending for ${transaction.purpose || 'transaction'}`
  // });
  
  return Promise.resolve();
}
