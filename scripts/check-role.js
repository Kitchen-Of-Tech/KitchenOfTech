// Check user role
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRole() {
  try {
    console.log('Checking user role for sakib3046@gmail.com...\n');
    
    // Get user data
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role_id, role:roles(id, name, level)')
      .eq('email', 'sakib3046@gmail.com');

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (!users || users.length === 0) {
      console.log('No user found with that email');
      return;
    }

    console.log('User data:', JSON.stringify(users[0], null, 2));
    
    const user = users[0];
    if (user.role) {
      console.log('\n✓ Role found:');
      console.log('  - Name:', user.role.name);
      console.log('  - Level:', user.role.level);
      console.log('\nAccess checks:');
      console.log('  - Can access Testimonials (level ≤ 2):', user.role.level <= 2 ? '✓ YES' : '✗ NO');
      console.log('  - Can access Payment Methods (level === 1):', user.role.level === 1 ? '✓ YES' : '✗ NO');
    } else {
      console.log('\n✗ No role found for user!');
      console.log('  - role_id:', user.role_id);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkRole();
