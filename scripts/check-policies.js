// Check RLS policies
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPolicies() {
  try {
    // Get policies for users table
    const { data: policies, error } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE tablename = 'users'
          ORDER BY policyname;
        `
      });

    if (error) {
      console.error('Error:', error);
      
      // Try alternative method
      console.log('\nTrying alternative method...\n');
      const { data: tables } = await supabase
        .from('users')
        .select('*')
        .limit(0);
      
      console.log('Users table accessible');
      return;
    }

    console.log('RLS Policies on users table:');
    console.log(JSON.stringify(policies, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkPolicies();
