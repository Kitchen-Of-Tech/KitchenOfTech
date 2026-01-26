import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { cachedJsonResponse, CACHE_PRESETS } from '@/lib/http-cache';

// GET - Fetch all service categories
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    // Check if user is authenticated for inactive categories
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user;
    
    const adminClient = createAdminClient();
    let query = adminClient
      .from('service_categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    // Non-authenticated users can only see active categories
    if (!isAuthenticated || !includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data: categories, error } = await query;
    
    if (error) throw error;
    
    // Cache public category data for 1 hour with 15-minute SWR
    return cachedJsonResponse({
      success: true,
      categories: categories || [],
    }, CACHE_PRESETS.STATIC);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service categories' },
      { status: 500 }
    );
  }
}

// POST - Create new service category (CEO/Manager only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is CEO or Manager
    const adminClient = createAdminClient();
    const { data: userData } = await adminClient
      .from('users')
      .select('role:roles(level)')
      .eq('id', user.id)
      .single();
    
    const roleLevel = (userData?.role as { level: number } | undefined)?.level ?? 999;
    if (roleLevel > 2) {
      return NextResponse.json(
        { error: 'Forbidden - CEO or Manager access only' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, description, display_order, is_active } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    const { data: category, error } = await adminClient
      .from('service_categories')
      .insert({
        name,
        description: description || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
        created_by: user.id,
      })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      category,
      message: 'Service category created successfully',
    });
  } catch (error) {
    console.error('Error creating service category:', error);
    return NextResponse.json(
      { error: 'Failed to create service category' },
      { status: 500 }
    );
  }
}

// PUT - Update service category (CEO/Manager only)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is CEO or Manager
    const adminClient = createAdminClient();
    const { data: userData } = await adminClient
      .from('users')
      .select('role:roles(level)')
      .eq('id', user.id)
      .single();
    
    const roleLevel = (userData?.role as { level: number } | undefined)?.level ?? 999;
    if (roleLevel > 2) {
      return NextResponse.json(
        { error: 'Forbidden - CEO or Manager access only' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { id, name, description, display_order, is_active } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    const { data: category, error } = await adminClient
      .from('service_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      category,
      message: 'Service category updated successfully',
    });
  } catch (error) {
    console.error('Error updating service category:', error);
    return NextResponse.json(
      { error: 'Failed to update service category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete service category (CEO/Manager only)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is CEO or Manager
    const adminClient = createAdminClient();
    const { data: userData } = await adminClient
      .from('users')
      .select('role:roles(level)')
      .eq('id', user.id)
      .single();
    
    const roleLevel = (userData?.role as { level: number } | undefined)?.level ?? 999;
    if (roleLevel > 2) {
      return NextResponse.json(
        { error: 'Forbidden - CEO or Manager access only' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }
    
    // Check if category is being used by any testimonials
    const { data: testimonials } = await adminClient
      .from('testimonials')
      .select('id')
      .eq('service_name', id)
      .limit(1);
    
    if (testimonials && testimonials.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by testimonials. Please deactivate it instead.' },
        { status: 409 }
      );
    }
    
    const { error } = await adminClient
      .from('service_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: 'Service category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return NextResponse.json(
      { error: 'Failed to delete service category' },
      { status: 500 }
    );
  }
}
