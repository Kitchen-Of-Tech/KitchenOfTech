import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
async function sendEmailReminder(customer: any, transaction: any) {
  // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
  console.log(`Sending email reminder to ${customer.email} for transaction ${transaction.transaction_id}`);
  
  // Mock email sending
  // In production, use a service like:
  // await sendgrid.send({
  //   to: customer.email,
  //   from: 'payments@kitchenoftech.com',
  //   subject: 'Payment Reminder',
  //   html: `Dear ${customer.full_name}, your payment of ${transaction.amount} BDT is pending...`
  // });
  
  return Promise.resolve();
}

// Helper: Send SMS reminder
async function sendSMSReminder(customer: any, transaction: any) {
  // TODO: Integrate with your SMS service (Twilio, AWS SNS, etc.)
  console.log(`Sending SMS reminder to ${customer.phone} for transaction ${transaction.transaction_id}`);
  
  // Mock SMS sending
  // In production, use a service like:
  // await twilio.messages.create({
  //   to: customer.phone,
  //   from: '+1234567890',
  //   body: `Payment reminder: ${transaction.amount} BDT pending for ${transaction.purpose}`
  // });
  
  return Promise.resolve();
}
