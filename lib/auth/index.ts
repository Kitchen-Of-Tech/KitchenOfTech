import { createClient } from '@/lib/supabase/client';
import type { User, Role } from '@/types/auth';

export async function signIn(username: string, password: string) {
  const supabase = createClient();
  
  console.log('🔍 Attempting login for username:', username);
  
  // First, get the user's email from their username
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('email, is_active')
    .eq('username', username)
    .single() as { data: { email: string; is_active: boolean } | null; error: Error | null };

  console.log('📋 User profile lookup:', { userProfile, profileError });

  if (profileError || !userProfile) {
    console.error('❌ Profile lookup failed:', profileError);
    throw new Error('Invalid username or password');
  }

  if (!userProfile.is_active) {
    throw new Error('Your account has been deactivated. Please contact an administrator.');
  }

  console.log('✅ Found user email:', userProfile.email);
  
  // Now sign in with email and password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: userProfile.email,
    password,
  });

  console.log('🔐 Auth result:', { success: !!authData.user, error: authError?.message });

  if (authError) {
    console.error('❌ Auth failed:', authError);
    throw new Error('Invalid username or password');
  }

  if (!authData.user) {
    throw new Error('Authentication failed');
  }

  // Get user profile with role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(*)
    `)
    .eq('id', authData.user.id)
    .single();

  if (userError) {
    console.error('❌ Failed to fetch user profile:', userError);
    throw new Error('Failed to fetch user profile');
  }

  console.log('✅ Login successful for user:', userData);
  return { user: userData as User, session: authData.session };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(*)
    `)
    .eq('id', session.user.id)
    .single();

  if (userError || !userData) {
    return null;
  }

  return userData as User;
}

export async function createUser(data: {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role_id: string;
}) {
  const supabase = createClient();
  
  // Check if current user can create users
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level > 2) {
    throw new Error('Only CEO and Manager can create users');
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to create auth user');
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      username: data.username,
      full_name: data.full_name,
      email: data.email,
      role_id: data.role_id,
      is_active: true,
    });

  if (profileError) {
    // Rollback auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(profileError.message);
  }

  return authData.user;
}

export async function updateUserRole(userId: string, roleId: string) {
  const supabase = createClient();
  
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level > 2) {
    throw new Error('Only CEO and Manager can change user roles');
  }

  const { error } = await supabase
    .from('users')
    .update({ role_id: roleId })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const supabase = createClient();
  
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level > 2) {
    throw new Error('Only CEO and Manager can activate/deactivate users');
  }

  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteUser(userId: string) {
  const supabase = createClient();
  
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level !== 1) {
    throw new Error('Only CEO can delete users');
  }

  // Delete from auth (will cascade to users table)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = createClient();
  
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level > 2) {
    throw new Error('Only CEO and Manager can reset passwords');
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateUsername(userId: string, username: string) {
  const supabase = createClient();
  
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.role) {
    throw new Error('Unauthorized');
  }

  if (currentUser.role.level > 2) {
    throw new Error('Only CEO and Manager can change usernames');
  }

  const { error } = await supabase
    .from('users')
    .update({ username })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getAllRoles(): Promise<Role[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as Role[];
}

export async function checkPermission(
  userId: string,
  permissionType: string,
  targetId?: string
): Promise<boolean> {
  const supabase = createClient();
  
  // Get user with role
  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // CEO and Manager have all permissions
  if (user.role.level <= 2) return true;

  // Check specific permission
  const { data: permission } = await supabase
    .from('permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('permission_type', permissionType)
    .eq('target_id', targetId || '')
    .single();

  return !!permission;
}
