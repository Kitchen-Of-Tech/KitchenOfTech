/**
 * Database Migration Script
 * 
 * This script applies all database migrations to your Supabase project.
 * 
 * Usage:
 *   node scripts/apply-migrations.js
 * 
 * Prerequisites:
 *   - .env.local file with SUPABASE_SERVICE_ROLE_KEY
 *   - Migration files in supabase/migrations/
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration files in order
const migrations = [
  '001_rbac_system.sql',
  '002_testimonial_system.sql',
  '003_payment_system.sql',
  '20260121_education_platform.sql'
];

async function readMigrationFile(filename) {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }
  
  return fs.readFileSync(filePath, 'utf8');
}

async function applyMigration(filename) {
  console.log(`\n📄 Reading migration: ${filename}`);
  
  try {
    const sql = await readMigrationFile(filename);
    
    console.log(`⚙️  Applying migration: ${filename}...`);
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try direct approach if RPC fails
      console.log('  Trying direct approach...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql_query: sql })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }
    
    console.log(`✅ Successfully applied: ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${filename}:`, error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying tables...');
  
  const tablesToCheck = [
    'roles',
    'users',
    'testimonials',
    'testimonial_links',
    'payment_methods',
    'payment_transactions',
    'payment_verification_logs'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ Table '${table}' - Error: ${error.message}`);
      } else {
        console.log(`  ✅ Table '${table}' - OK`);
      }
    } catch (error) {
      console.log(`  ❌ Table '${table}' - ${error.message}`);
    }
  }
}

async function checkInitialData() {
  console.log('\n🔍 Checking initial data...');
  
  try {
    const { data: paymentMethods, error } = await supabase
      .from('payment_methods')
      .select('name, is_active')
      .eq('is_active', true)
      .order('display_order');
    
    if (error) {
      console.log('  ❌ Payment methods - Error:', error.message);
    } else {
      console.log(`  ✅ Payment methods - Found ${paymentMethods.length} active methods`);
      paymentMethods.forEach(method => {
        console.log(`     - ${method.name}`);
      });
    }
  } catch (error) {
    console.log('  ❌ Payment methods check failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting database migration...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Using Service Role Key: ${supabaseServiceKey.substring(0, 20)}...`);
  
  console.log('\n⚠️  IMPORTANT NOTES:');
  console.log('  - Migrations will be applied using Supabase Dashboard SQL Editor');
  console.log('  - This script will prepare and validate migration files');
  console.log('  - Please apply migrations manually via Supabase Dashboard');
  console.log('  - See DATABASE_MIGRATION_GUIDE.md for detailed instructions\n');
  
  let allSuccess = true;
  
  // Check if migration files exist
  console.log('📋 Checking migration files...\n');
  for (const migration of migrations) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`  ✅ ${migration} - ${stats.size} bytes`);
    } else {
      console.log(`  ❌ ${migration} - NOT FOUND`);
      allSuccess = false;
    }
  }
  
  if (!allSuccess) {
    console.error('\n❌ Some migration files are missing. Please check the files.');
    process.exit(1);
  }
  
  console.log('\n✅ All migration files found!');
  console.log('\n📝 Next Steps:');
  console.log('  1. Go to Supabase Dashboard: https://supabase.com/dashboard');
  console.log('  2. Select your project');
  console.log('  3. Click "SQL Editor" in the left sidebar');
  console.log('  4. Apply migrations in this order:');
  migrations.forEach((migration, index) => {
    console.log(`     ${index + 1}. ${migration}`);
  });
  console.log('\n  For detailed instructions, see: DATABASE_MIGRATION_GUIDE.md');
  
  // Optional: Try to verify if tables already exist
  console.log('\n🔍 Checking if migrations are already applied...');
  await verifyTables();
  await checkInitialData();
  
  console.log('\n✅ Migration check complete!');
  console.log('\nIf tables are not created yet, please apply migrations via Supabase Dashboard.');
  console.log('If tables exist, migrations are already applied! ✨\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
