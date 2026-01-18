// Delete CEO User Script
// Run this to completely remove CEO user: node scripts/delete-ceo.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function deleteCEO() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🗑️  Deleting CEO user...\n');

  try {
    // 1. Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      return;
    }

    const ceoUser = users.find(u => u.email === 'sakib3046@kitchenoftech.com');

    if (!ceoUser) {
      console.log('✅ No CEO user found in auth. Ready to create new one!');
      return;
    }

    console.log('📋 Found CEO user in auth:', ceoUser.id);

    // 2. Delete from users table (if exists)
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', ceoUser.id);

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      console.warn('⚠️  Profile delete warning:', profileError.message);
    } else {
      console.log('✅ Deleted user profile (if existed)');
    }

    // 3. Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(ceoUser.id);

    if (authError) {
      console.error('❌ Failed to delete auth user:', authError.message);
      return;
    }

    console.log('✅ Deleted auth user');
    console.log('\n🎉 CEO user completely deleted!');
    console.log('💡 Now you can run: node scripts/setup-ceo.js');

  } catch (error) {
    console.error('❌ Delete failed:', error);
  }
}

deleteCEO();
