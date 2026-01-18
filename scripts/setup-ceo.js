// Setup Script - Create CEO User
// Run this after migration: node scripts/setup-ceo.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function setupCEO() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key for admin functions
  );

  console.log('🚀 Setting up CEO user...\n');

  try {
    // 1. Get CEO role ID
    const { data: ceoRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'CEO')
      .single();

    if (roleError || !ceoRole) {
      console.error('❌ Failed to find CEO role');
      return;
    }

    console.log('✅ Found CEO role:', ceoRole.id);

    // 2. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'sakib3046@kitchenoftech.com', // Using username as email prefix
      password: '12344321',
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Failed to create auth user:', authError.message);
      return;
    }

    console.log('✅ Created auth user:', authData.user.id);

    // 3. Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username: 'sakib3046',
        full_name: 'Sakib (CEO)',
        email: 'sakib3046@kitchenoftech.com',
        role_id: ceoRole.id,
        is_active: true,
      });

    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError.message);
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log('✅ Created user profile');
    console.log('\n🎉 CEO user created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Username: sakib3046');
    console.log('   Password: 12344321');
    console.log('\n💡 Login with your username (not email) at /login');
    console.log('🔐 Please change the password after first login!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupCEO();
