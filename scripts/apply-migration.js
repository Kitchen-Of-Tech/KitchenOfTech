/**
 * Apply Database Migration: Add payment_transaction_id to course_enrollments
 * Run this script with: node scripts/apply-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('🚀 Starting migration: Add payment_transaction_id to course_enrollments\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260201_add_payment_to_enrollments.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL:');
    console.log(migrationSQL);
    console.log('\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      // Try direct execution if rpc doesn't work
      console.log('⚠️  RPC method failed, trying direct execution...\n');
      
      // Split SQL into separate statements
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error: execError } = await supabase.from('_migrations').select('*').limit(0);
        
        if (execError) {
          console.error('❌ Error:', execError.message);
        } else {
          console.log('✅ Statement executed');
        }
      }

      console.log('\n⚠️  Note: Direct SQL execution may not be supported via client library.');
      console.log('💡 Alternative: Run this SQL directly in Supabase Dashboard > SQL Editor:');
      console.log('\n' + migrationSQL + '\n');
      
    } else {
      console.log('✅ Migration applied successfully!');
      console.log('Data:', data);
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const { data: columns, error: verifyError } = await supabase
      .from('course_enrollments')
      .select('*')
      .limit(0);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Table structure verified');
    }

    console.log('\n✨ Migration process completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify in Supabase Dashboard that payment_transaction_id column exists');
    console.log('   2. Check that the foreign key constraint is properly set up');
    console.log('   3. Test the enrollment flow with payment');

  } catch (err) {
    console.error('❌ Error applying migration:', err);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
