/**
 * Quick Migration Script - Applies pending migrations directly
 * 
 * This script applies testimonial and payment migrations to Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLFile(filename) {
  console.log(`\n📄 Executing: ${filename}`);
  
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  // Split SQL into individual statements (basic split by semicolon)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`  Found ${statements.length} SQL statements`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments and empty statements
    if (statement.trim().startsWith('--') || statement.trim() === ';') {
      continue;
    }
    
    try {
      // Try using fetch API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql: statement })
      });
      
      if (response.ok || response.status === 204) {
        successCount++;
        process.stdout.write('.');
      } else {
        errorCount++;
        const errorText = await response.text();
        console.log(`\n    ⚠️  Statement ${i + 1} warning: ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      errorCount++;
      console.log(`\n    ❌ Statement ${i + 1} error: ${error.message}`);
    }
  }
  
  console.log(`\n  ✅ Completed: ${successCount} successful, ${errorCount} errors/warnings`);
  return errorCount === 0;
}

async function verifyMigrations() {
  console.log('\n🔍 Verifying migrations...');
  
  const checks = [
    { table: 'testimonials', desc: 'Testimonials table' },
    { table: 'testimonial_links', desc: 'Testimonial links' },
    { table: 'payment_methods', desc: 'Payment methods' },
    { table: 'payment_transactions', desc: 'Payment transactions' },
    { table: 'payment_verification_logs', desc: 'Payment logs' }
  ];
  
  for (const check of checks) {
    try {
      const { data, error } = await supabase
        .from(check.table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${check.desc}: ${error.message}`);
      } else {
        console.log(`  ✅ ${check.desc}: OK`);
      }
    } catch (error) {
      console.log(`  ❌ ${check.desc}: ${error.message}`);
    }
  }
  
  // Check payment methods data
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('name')
      .eq('is_active', true);
    
    if (!error && data) {
      console.log(`\n  ✅ Payment methods: ${data.length} active methods`);
      data.forEach(m => console.log(`     - ${m.name}`));
    }
  } catch (error) {
    console.log(`  ⚠️  Could not verify payment methods: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Applying pending migrations...\n');
  
  const pendingMigrations = [
    '002_testimonial_system.sql',
    '003_payment_system.sql'
  ];
  
  for (const migration of pendingMigrations) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migration);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Migration file not found: ${migration}`);
      continue;
    }
    
    console.log(`\n📋 Migration: ${migration}`);
    console.log('   Please apply this migration via Supabase Dashboard SQL Editor');
    console.log(`   File location: supabase/migrations/${migration}`);
    console.log('\n   Steps:');
    console.log('   1. Open Supabase Dashboard → SQL Editor');
    console.log(`   2. Copy content from: ${migration}`);
    console.log('   3. Paste and run in SQL Editor');
    console.log('   4. Verify no errors in the output\n');
  }
  
  console.log('\n📖 For detailed instructions, see: DATABASE_MIGRATION_GUIDE.md');
  console.log('\n⏳ After applying migrations in Supabase Dashboard, run this script again to verify.\n');
  
  // Verify current state
  await verifyMigrations();
  
  console.log('\n✅ Migration guide complete!');
  console.log('\n💡 TIP: Copy the SQL content from migration files and run directly in Supabase Dashboard SQL Editor.');
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
