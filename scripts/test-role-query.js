// Test role query
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testRoleQuery() {
  const userId = '595c6c33-a00c-4b0a-a24f-f41d057fb6b5';
  
  console.log('Testing role query for user:', userId);
  console.log('');
  
  // Test the exact query used in the page
  const { data: userData, error } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Query result:');
  console.log(JSON.stringify(userData, null, 2));
  console.log('');
  console.log('Role check:');
  console.log('  - userData.role exists:', !!userData.role);
  console.log('  - userData.role.level:', userData.role?.level);
  console.log('  - Can access testimonials (level ≤ 2):', userData.role && userData.role.level <= 2 ? 'YES' : 'NO');
  console.log('  - Can access payment methods (level === 1):', userData.role && userData.role.level === 1 ? 'YES' : 'NO');
}

testRoleQuery();
