import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/payment/invoices/[id]/pdf - Generate and download invoice PDF (Admin only)
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const supabaseServer = await createClient(cookieStore);
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    const { data: userData } = await supabaseServer
      .from('users')
      .select('role:roles(*)')
      .eq('id', user.id)
      .single();

    const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
    if (!role || role.level > 2) {
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

    // TODO: Implement PDF generation
    // For now, return a simple HTML-based PDF placeholder
    // In production, use a library like pdfkit, react-pdf, or puppeteer

    const html = generateInvoiceHTML(invoice);

    // Return HTML that can be printed as PDF
    // Client can use window.print() or browser's print-to-PDF
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoice_number}.html"`,
      },
    });

    // TODO: Replace with actual PDF generation
    /*
    const pdfBuffer = await generatePDF(invoice);
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
      },
    });
    */
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateInvoiceHTML(invoice: Record<string, unknown>): string {
  const lineItems = (invoice.line_items as Array<Record<string, unknown>>) || [];
  const creator = invoice.creator as Record<string, unknown> | null;
  
  const lineItemsHTML = lineItems
    .map((item, index) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unit_price) || 0;
      const amount = Number(item.amount) || 0;
      
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description || ''}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${quantity.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${amount.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const subtotal = Number(invoice.subtotal) || 0;
  const taxAmount = Number(invoice.tax_amount) || 0;
  const discountAmount = Number(invoice.discount_amount) || 0;
  const total = Number(invoice.total) || 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number || ''}</title>
  <style>
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .company-info h1 {
      margin: 0;
      color: #3b82f6;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-info h2 {
      margin: 0;
      color: #1f2937;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .party h3 {
      margin: 0 0 10px 0;
      color: #3b82f6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 10px;
      text-align: left;
    }
    .totals {
      margin-left: auto;
      width: 300px;
    }
    .totals table {
      margin-bottom: 0;
    }
    .totals td {
      padding: 5px;
      border: none;
    }
    .total-row {
      font-weight: bold;
      font-size: 1.2em;
      border-top: 2px solid #3b82f6;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f3f4f6;
      border-radius: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.9em;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    .print-button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>
  
  <div class="header">
    <div class="company-info">
      <h1>KitchenOfTech</h1>
      <p>Payment Management System</p>
    </div>
    <div class="invoice-info">
      <h2>INVOICE</h2>
      <p><strong>Invoice #:</strong> ${invoice.invoice_number || ''}</p>
      <p><strong>Status:</strong> <span style="text-transform: uppercase;">${invoice.status || 'draft'}</span></p>
      <p><strong>Issue Date:</strong> ${invoice.issue_date ? new Date(String(invoice.issue_date)).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(String(invoice.due_date)).toLocaleDateString() : 'N/A'}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h3>From:</h3>
      <p><strong>${creator?.full_name || 'N/A'}</strong></p>
      <p>${creator?.email || ''}</p>
    </div>
    <div class="party">
      <h3>Bill To:</h3>
      <p><strong>${invoice.customer_name || 'N/A'}</strong></p>
      <p>${invoice.customer_email || ''}</p>
      ${invoice.customer_phone ? `<p>${invoice.customer_phone}</p>` : ''}
      ${invoice.customer_address ? `<p>${invoice.customer_address}</p>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 50px;">#</th>
        <th>Description</th>
        <th style="width: 100px; text-align: right;">Quantity</th>
        <th style="width: 100px; text-align: right;">Unit Price</th>
        <th style="width: 100px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${lineItemsHTML}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal:</td>
        <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
      </tr>
      ${taxAmount > 0 ? `
      <tr>
        <td>Tax (${invoice.tax_rate || 0}%):</td>
        <td style="text-align: right;">$${taxAmount.toFixed(2)}</td>
      </tr>
      ` : ''}
      ${discountAmount > 0 ? `
      <tr>
        <td>Discount:</td>
        <td style="text-align: right;">-$${discountAmount.toFixed(2)}</td>
      </tr>
      ` : ''}
      <tr class="total-row">
        <td>Total:</td>
        <td style="text-align: right;">$${total.toFixed(2)}</td>
      </tr>
    </table>
  </div>

  ${invoice.notes ? `
  <div class="notes">
    <h3>Notes:</h3>
    <p>${invoice.notes}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>
</body>
</html>
  `;
}
