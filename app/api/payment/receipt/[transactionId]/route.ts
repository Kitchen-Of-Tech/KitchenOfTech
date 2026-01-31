import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface RouteContext {
  params: Promise<{
    transactionId: string;
  }>;
}

// GET /api/payment/receipt/[transactionId] - Generate receipt PDF
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { transactionId } = await context.params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf'; // pdf or json

    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();

    const supabaseAdmin = await createAdminClient();

    // Fetch transaction with all related data
    const { data: transaction, error } = await supabaseAdmin
      .from('payment_transactions')
      .select(`
        *,
        user:users(id, full_name, email, phone),
        payment_method:payment_methods(provider, account_name, account_number),
        invoice:invoices(invoice_number)
      `)
      .eq('transaction_id', transactionId)
      .single();

    if (error || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Authorization check - user can view their own receipts, admins can view all
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role:roles(*)')
        .eq('id', user.id)
        .single();

      const role = Array.isArray(userData?.role) ? userData.role[0] : userData?.role;
      const isAdmin = role && role.level >= 90;
      const isOwner = transaction.user_id === user.id;

      if (!isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Only approved transactions can have receipts
    if (transaction.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Receipt not available',
        message: 'Receipts are only available for approved transactions'
      }, { status: 400 });
    }

    // Return JSON format if requested
    if (format === 'json') {
      return NextResponse.json({
        receipt: {
          receipt_number: `RCP-${transaction.transaction_id}`,
          transaction_id: transaction.transaction_id,
          date: transaction.approved_at || transaction.created_at,
          amount: transaction.amount,
          currency: transaction.currency || 'BDT',
          payment_method: transaction.payment_method?.provider || 'Unknown',
          purpose: transaction.purpose || 'Payment',
          customer: {
            name: transaction.user?.full_name || 'N/A',
            email: transaction.user?.email || 'N/A',
            phone: transaction.user?.phone || 'N/A',
          },
          invoice_number: transaction.invoice?.invoice_number || null,
        },
      });
    }

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(transaction);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${transaction.transaction_id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate receipt',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Generate PDF receipt
async function generateReceiptPDF(transaction: any): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Company branding
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KITCHEN OF TECH', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Receipt', pageWidth / 2, 30, { align: 'center' });

  // Receipt details box
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, 50, pageWidth - 30, 40);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Receipt Information', 20, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const receiptNumber = `RCP-${transaction.transaction_id}`;
  const receiptDate = new Date(transaction.approved_at || transaction.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.text(`Receipt Number: ${receiptNumber}`, 20, 70);
  doc.text(`Date: ${receiptDate}`, 20, 78);
  doc.text(`Transaction ID: ${transaction.transaction_id}`, 20, 86);

  // Customer information
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, 100, pageWidth - 30, 35);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 20, 110);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${transaction.user?.full_name || 'N/A'}`, 20, 120);
  doc.text(`Email: ${transaction.user?.email || 'N/A'}`, 20, 128);

  // Payment details
  doc.rect(15, 145, pageWidth - 30, 55);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', 20, 155);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount: ${transaction.currency || 'BDT'} ${transaction.amount.toLocaleString()}`, 20, 165);
  doc.text(`Payment Method: ${transaction.payment_method?.provider || 'N/A'}`, 20, 173);
  doc.text(`Account: ${transaction.payment_method?.account_name || 'N/A'}`, 20, 181);
  doc.text(`Purpose: ${transaction.purpose || 'Payment'}`, 20, 189);
  
  if (transaction.invoice?.invoice_number) {
    doc.text(`Invoice: ${transaction.invoice.invoice_number}`, 20, 197);
  }

  // Amount summary box (highlighted)
  const summaryY = 210;
  doc.setFillColor(240, 248, 255);
  doc.rect(15, summaryY, pageWidth - 30, 25, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(1);
  doc.rect(15, summaryY, pageWidth - 30, 25);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('Total Amount Paid:', 20, summaryY + 10);
  doc.text(`${transaction.currency || 'BDT'} ${transaction.amount.toLocaleString()}`, pageWidth - 20, summaryY + 10, { align: 'right' });

  if (transaction.refund_status && transaction.refunded_amount > 0) {
    doc.setFontSize(10);
    doc.setTextColor(220, 53, 69);
    doc.text(`Refunded: ${transaction.currency || 'BDT'} ${transaction.refunded_amount.toLocaleString()}`, 20, summaryY + 20);
  }

  // Generate QR code for verification
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kitchenoftech.com'}/api/payment/verify/${transaction.transaction_id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 100, margin: 1 });
    
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 45, summaryY + 35, 30, 30);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Scan to verify', pageWidth - 30, summaryY + 70, { align: 'center' });
  } catch (qrError) {
    console.error('QR code generation error:', qrError);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, pageHeight - 25, { align: 'center' });
  doc.text('For support, contact: support@kitchenoftech.com', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Thank you message
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for your payment!', pageWidth / 2, pageHeight - 35, { align: 'center' });

  // Status indicator
  doc.setFontSize(10);
  if (transaction.refund_status === 'refunded') {
    doc.setTextColor(220, 53, 69);
    doc.text('STATUS: REFUNDED', pageWidth / 2, summaryY + 50, { align: 'center' });
  } else if (transaction.refund_status === 'partial_refund') {
    doc.setTextColor(255, 193, 7);
    doc.text('STATUS: PARTIALLY REFUNDED', pageWidth / 2, summaryY + 50, { align: 'center' });
  } else {
    doc.setTextColor(40, 167, 69);
    doc.text('STATUS: PAID', pageWidth / 2, summaryY + 50, { align: 'center' });
  }

  // Convert to buffer
  const pdfOutput = doc.output('arraybuffer');
  return Buffer.from(pdfOutput);
}
