// Check Database - Verify CEO user exists
// Run this: node scripts/check-user.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkUser() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🔍 Checking database for CEO user...\n');

  try {
    // Check auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Failed to list auth users:', authError.message);
      return;
    }

    console.log('📋 Auth users found:', users.length);
    const ceoAuth = users.find(u => u.email === 'sakib3046@kitchenoftech.com');
    
    if (ceoAuth) {
      console.log('✅ CEO auth user exists:');
      console.log('   ID:', ceoAuth.id);
      console.log('   Email:', ceoAuth.email);
      console.log('   Created:', ceoAuth.created_at);
    } else {
      console.log('❌ CEO auth user NOT found');
    }

    console.log('\n---\n');

    // Check users table
    const { data: usersTable, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(10);

    if (tableError) {
      console.error('❌ Failed to query users table:', tableError);
      console.error('   Code:', tableError.code);
      console.error('   Message:', tableError.message);
      console.error('   Details:', tableError.details);
      console.error('   Hint:', tableError.hint);
      return;
    }

    console.log('📋 Users table records:', usersTable?.length || 0);
    
    if (usersTable && usersTable.length > 0) {
      usersTable.forEach(user => {
        console.log('\n   User:');
        console.log('   - ID:', user.id);
        console.log('   - Username:', user.username);
        console.log('   - Email:', user.email);
        console.log('   - Active:', user.is_active);
        console.log('   - Role ID:', user.role_id);
      });
    } else {
      console.log('❌ No users found in users table');
    }

    // Specifically check for sakib3046
    console.log('\n---\n');
    const { data: sakibUser, error: sakibError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'sakib3046')
      .single();

    if (sakibError) {
      console.error('❌ Failed to find sakib3046:', sakibError);
    } else if (sakibUser) {
      console.log('✅ Found sakib3046 in users table:');
      console.log('   ID:', sakibUser.id);
      console.log('   Username:', sakibUser.username);
      console.log('   Email:', sakibUser.email);
      console.log('   Active:', sakibUser.is_active);
      console.log('   Role ID:', sakibUser.role_id);
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkUser();
