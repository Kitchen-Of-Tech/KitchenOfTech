// Quick script to check if migration is needed
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMigration() {
  console.log('🔍 Checking if migration is needed...\n');
  
  // Try to select with payment_transaction_id to see if column exists
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id, payment_transaction_id')
    .limit(1);
  
  if (error) {
    if (error.message.includes('payment_transaction_id')) {
      console.log('❌ Migration NOT applied: payment_transaction_id column does not exist');
      console.log('\n📝 Please apply the migration using one of these methods:');
      console.log('   1. Copy SQL from supabase/migrations/20260201_add_payment_to_enrollments.sql');
      console.log('   2. Paste into Supabase Dashboard > SQL Editor');
      console.log('   3. Run the query');
      console.log('\nOr see MIGRATION_GUIDE.md for detailed instructions.');
    } else {
      console.log('❌ Error checking migration:', error.message);
    }
  } else {
    console.log('✅ Migration ALREADY applied: payment_transaction_id column exists');
    console.log('\n📊 Sample data:');
    console.log(data);
  }
}

checkMigration();
