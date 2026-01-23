import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/payment/invoices/[id] - Get invoice details (Admin only)
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
        payment_link:payment_links(*),
        transaction:payment_transactions(*),
        creator:users!invoices_created_by_id_fkey(id, email, full_name)
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      console.error('Invoice not found:', error);
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/payment/invoices/[id] - Update invoice (Admin only)
export async function PATCH(request: NextRequest, context: RouteContext) {
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

    // Check if invoice exists
    const { data: existingInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, tax_rate, discount_amount, subtotal')
      .eq('id', id)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      issue_date,
      due_date,
      tax_rate,
      discount_amount,
      notes,
      status,
      line_items,
    } = body;

    // Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (customer_name !== undefined) updates.customer_name = customer_name;
    if (customer_email !== undefined) updates.customer_email = customer_email;
    if (customer_phone !== undefined) updates.customer_phone = customer_phone;
    if (customer_address !== undefined) updates.customer_address = customer_address;
    if (issue_date !== undefined) updates.issue_date = issue_date;
    if (due_date !== undefined) updates.due_date = due_date;
    if (notes !== undefined) updates.notes = notes;
    if (status !== undefined) updates.status = status;

    // If line items are updated, recalculate totals
    if (line_items && Array.isArray(line_items)) {
      // Delete existing line items
      await supabase.from('invoice_line_items').delete().eq('invoice_id', id);

      // Calculate new totals
      let subtotal = 0;
      const validatedLineItems = line_items.map((item: Record<string, unknown>, index: number) => {
        const quantity = parseFloat(String(item.quantity)) || 1;
        const unitPrice = parseFloat(String(item.unit_price)) || 0;
        const amount = quantity * unitPrice;
        subtotal += amount;

        return {
          invoice_id: id,
          description: item.description,
          quantity,
          unit_price: unitPrice,
          amount,
          item_type: item.item_type || null,
          item_id: item.item_id || null,
          display_order: item.display_order ?? index,
        };
      });

      const taxRateValue = parseFloat(tax_rate) ?? existingInvoice.tax_rate ?? 0;
      const discountValue = parseFloat(discount_amount) ?? existingInvoice.discount_amount ?? 0;
      const taxAmount = (subtotal * taxRateValue) / 100;
      const total = subtotal + taxAmount - discountValue;

      updates.subtotal = subtotal;
      updates.tax_rate = taxRateValue;
      updates.tax_amount = taxAmount;
      updates.discount_amount = discountValue;
      updates.total = total;

      // Insert new line items
      const { error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .insert(validatedLineItems);

      if (lineItemsError) {
        console.error('Failed to update line items:', lineItemsError);
        return NextResponse.json({ error: 'Failed to update invoice line items' }, { status: 500 });
      }
    } else if (tax_rate !== undefined || discount_amount !== undefined) {
      // Recalculate totals if tax or discount changed
      const { data: currentLineItems } = await supabase
        .from('invoice_line_items')
        .select('amount')
        .eq('invoice_id', id);

      const subtotal = currentLineItems?.reduce((sum, item) => sum + parseFloat(String(item.amount)), 0) || 0;
      const taxRateValue = tax_rate !== undefined ? parseFloat(tax_rate) : existingInvoice.tax_rate;
      const discountValue = discount_amount !== undefined ? parseFloat(discount_amount) : existingInvoice.discount_amount;
      const taxAmount = (subtotal * taxRateValue) / 100;
      const total = subtotal + taxAmount - discountValue;

      updates.tax_rate = taxRateValue;
      updates.tax_amount = taxAmount;
      updates.discount_amount = discountValue;
      updates.total = total;
    }

    // Update invoice
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        line_items:invoice_line_items(*)
      `)
      .single();

    if (updateError) {
      console.error('Failed to update invoice:', updateError);
      return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }

    return NextResponse.json({ invoice: updatedInvoice });
  } catch (error) {
    console.error('Invoice update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/payment/invoices/[id] - Delete invoice (Admin only, draft only)
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    // Check if invoice exists and is draft
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('id, status, payment_link_id, transaction_id')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Only allow deletion of draft invoices without payments
    if (invoice.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }

    if (invoice.payment_link_id || invoice.transaction_id) {
      return NextResponse.json(
        { error: 'Cannot delete invoice with associated payment link or transaction' },
        { status: 400 }
      );
    }

    // Delete line items first (cascade should handle this, but being explicit)
    await supabase.from('invoice_line_items').delete().eq('invoice_id', id);

    // Delete invoice
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete invoice:', deleteError);
      return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Invoice delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
