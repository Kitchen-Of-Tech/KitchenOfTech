import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { sendEmail, generateInvoiceEmailHTML, generateInvoiceEmailText } from '@/lib/email';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/payment/invoices/[id]/send - Send invoice via email (Admin only)
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabaseServer = await createClient(cookieStore);
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role (CEO=100 or Manager=90)
    const { data: userData } = await supabaseServer
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level < 90) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const supabase = await createAdminClient();

    // Fetch invoice with all related data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*),
        creator:users!invoices_created_by_id_fkey(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      console.error('Invoice not found:', error);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Validate customer email
    if (!invoice.customer_email) {
      return NextResponse.json({ error: 'Invoice has no customer email' }, { status: 400 });
    }

    // Parse optional request body for custom message
    let customMessage = '';
    try {
      const body = await request.json();
      customMessage = body.message || '';
    } catch {
      // Body is optional
    }

    // Send invoice email using Resend
    const invoiceData = invoice as {
      invoice_number: string;
      customer_name: string;
      issue_date: string;
      due_date: string;
      total: number;
      subtotal: number;
      tax_amount?: number;
      tax_rate?: number;
      discount_amount?: number;
      notes?: string;
      line_items?: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
      }>;
      creator?: {
        full_name?: string;
        email?: string;
      };
    };
    
    const html = generateInvoiceEmailHTML(invoiceData);
    const text = generateInvoiceEmailText(invoiceData);
    
    const emailResult = await sendEmail({
      to: String(invoice.customer_email),
      subject: `Invoice ${invoice.invoice_number} from KitchenOfTech`,
      html: customMessage ? `<p><em>${customMessage}</em></p><hr>${html}` : html,
      text: customMessage ? `${customMessage}\n\n---\n\n${text}` : text,
    });

    if (!emailResult.success) {
      // Email service not configured or failed
      console.log('Email not sent:', emailResult.error);
      
      // Still update status if it was draft, but inform user about email
      if (invoice.status === 'draft') {
        await supabase
          .from('invoices')
          .update({ status: 'sent', updated_at: new Date().toISOString() })
          .eq('id', id);
      }

      return NextResponse.json({
        message: 'Invoice status updated, but email not sent',
        error: emailResult.error,
        note: 'Configure RESEND_API_KEY in environment variables to enable email sending.',
      }, { status: 207 }); // 207 Multi-Status
    }

    // Update invoice status to 'sent' if it was 'draft'
    if (invoice.status === 'draft') {
      await supabase
        .from('invoices')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', id);
    }

    return NextResponse.json({
      message: 'Invoice email sent successfully',
      email: {
        to: invoice.customer_email,
        subject: `Invoice ${invoice.invoice_number} from KitchenOfTech`,
      },
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
