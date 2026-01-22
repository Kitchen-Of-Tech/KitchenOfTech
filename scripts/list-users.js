// List all users
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listUsers() {
  try {
    console.log('Fetching all users...\n');
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role_id, role:roles(id, name, level)')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    console.log(`Found ${users.length} users:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Role ID: ${user.role_id}`);
      if (user.role) {
        console.log(`   Role: ${user.role.name} (Level ${user.role.level})`);
      } else {
        console.log(`   Role: ✗ NOT FOUND`);
      }
      console.log('');
    });
    
  } catch (err) {
    console.error('Error:', err);
  }
}

listUsers();
