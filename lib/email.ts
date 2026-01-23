import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email would be sent:', {
      to: options.to,
      subject: options.subject,
    });
    return {
      success: false,
      error: 'Email service not configured. Add RESEND_API_KEY to environment variables.',
      data: options,
    };
  }

  try {
    const from = options.from || process.env.EMAIL_FROM || 'noreply@kitchenoftech.com';
    
    const data = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      attachments: options.attachments,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Generate invoice email HTML
 */
export function generateInvoiceEmailHTML(invoice: {
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
}): string {
  const lineItems = invoice.line_items || [];
  const lineItemsHTML = lineItems
    .map((item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">KitchenOfTech</h1>
      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">Payment Management System</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">Hi ${invoice.customer_name},</h2>
      <p style="margin: 0 0 20px 0; color: #4b5563; line-height: 1.6;">
        You have received a new invoice from KitchenOfTech. Please find the details below:
      </p>

      <!-- Invoice Info Card -->
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280; font-size: 14px;">Invoice Number:</span>
          <span style="color: #1f2937; font-weight: 600; font-size: 14px;">${invoice.invoice_number}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280; font-size: 14px;">Issue Date:</span>
          <span style="color: #1f2937; font-size: 14px;">${new Date(invoice.issue_date).toLocaleDateString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280; font-size: 14px;">Due Date:</span>
          <span style="color: #1f2937; font-weight: 600; font-size: 14px;">${new Date(invoice.due_date).toLocaleDateString()}</span>
        </div>
        <div style="border-top: 1px solid #e5e7eb; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between;">
          <span style="color: #1f2937; font-weight: 600; font-size: 18px;">Total Amount:</span>
          <span style="color: #667eea; font-weight: bold; font-size: 24px;">$${invoice.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Line Items Table -->
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Invoice Details</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">#</th>
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Description</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Price</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Subtotal:</span>
          <span style="color: #1f2937;">$${invoice.subtotal.toFixed(2)}</span>
        </div>
        ${invoice.tax_amount && invoice.tax_amount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Tax (${invoice.tax_rate || 0}%):</span>
          <span style="color: #1f2937;">$${invoice.tax_amount.toFixed(2)}</span>
        </div>
        ` : ''}
        ${invoice.discount_amount && invoice.discount_amount > 0 ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280;">Discount:</span>
          <span style="color: #1f2937;">-$${invoice.discount_amount.toFixed(2)}</span>
        </div>
        ` : ''}
        <div style="border-top: 2px solid #667eea; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between;">
          <span style="color: #1f2937; font-weight: bold; font-size: 18px;">Total:</span>
          <span style="color: #667eea; font-weight: bold; font-size: 24px;">$${invoice.total.toFixed(2)}</span>
        </div>
      </div>

      ${invoice.notes ? `
      <!-- Notes -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 30px;">
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
          <strong>Note:</strong> ${invoice.notes}
        </p>
      </div>
      ` : ''}

      <!-- Payment Instructions -->
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Payment Information</h3>
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
          Please make payment by the due date. If you have any questions about this invoice, feel free to contact us.
        </p>
      </div>

      <p style="margin: 0 0 10px 0; color: #4b5563; line-height: 1.6;">
        Thank you for your business!
      </p>
      <p style="margin: 0; color: #4b5563; line-height: 1.6;">
        Best regards,<br>
        <strong>${invoice.creator?.full_name || 'KitchenOfTech Team'}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px;">
        This is an automated email from KitchenOfTech Payment Management System
      </p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} KitchenOfTech. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text version of invoice email
 */
export function generateInvoiceEmailText(invoice: {
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
}): string {
  const lineItems = invoice.line_items || [];
  const lineItemsText = lineItems
    .map((item, index) => 
      `${index + 1}. ${item.description} - Qty: ${item.quantity}, Price: $${item.unit_price.toFixed(2)}, Total: $${item.amount.toFixed(2)}`
    )
    .join('\n');

  return `
Hi ${invoice.customer_name},

You have received a new invoice from KitchenOfTech.

Invoice Number: ${invoice.invoice_number}
Issue Date: ${new Date(invoice.issue_date).toLocaleDateString()}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

INVOICE DETAILS:
${lineItemsText}

SUMMARY:
Subtotal: $${invoice.subtotal.toFixed(2)}
${invoice.tax_amount && invoice.tax_amount > 0 ? `Tax (${invoice.tax_rate || 0}%): $${invoice.tax_amount.toFixed(2)}\n` : ''}${invoice.discount_amount && invoice.discount_amount > 0 ? `Discount: -$${invoice.discount_amount.toFixed(2)}\n` : ''}TOTAL: $${invoice.total.toFixed(2)}

${invoice.notes ? `\nNOTE: ${invoice.notes}\n` : ''}
Please make payment by the due date. If you have any questions about this invoice, feel free to contact us.

Thank you for your business!

Best regards,
KitchenOfTech Team

---
This is an automated email from KitchenOfTech Payment Management System
© ${new Date().getFullYear()} KitchenOfTech. All rights reserved.
  `.trim();
}
