// Script to check payment system migration status
// Run with: node scripts/check-payment-migration.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkMigrations() {
  console.log('🔍 Checking payment system migration status...\n');

  let needsMigration = false;

  // Check 1: payment_links table
  console.log('1️⃣ Checking payment_links table...');
  try {
    const { error } = await supabase.from('payment_links').select('id').limit(1);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ❌ payment_links table does NOT exist\n');
        needsMigration = true;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ payment_links table exists\n');
    }
  } catch (err) {
    console.error('   ⚠️ Error:', err.message, '\n');
    needsMigration = true;
  }

  // Check 2: invoices table
  console.log('2️⃣ Checking invoices table...');
  try {
    const { error } = await supabase.from('invoices').select('id').limit(1);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ❌ invoices table does NOT exist\n');
        needsMigration = true;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ invoices table exists\n');
    }
  } catch (err) {
    console.error('   ⚠️ Error:', err.message, '\n');
    needsMigration = true;
  }

  // Check 3: accounting_entries table
  console.log('3️⃣ Checking accounting_entries table...');
  try {
    const { error } = await supabase.from('accounting_entries').select('id').limit(1);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ❌ accounting_entries table does NOT exist\n');
        needsMigration = true;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ accounting_entries table exists\n');
    }
  } catch (err) {
    console.error('   ⚠️ Error:', err.message, '\n');
    needsMigration = true;
  }

  // Check 4: api_keys table
  console.log('4️⃣ Checking api_keys table...');
  try {
    const { error } = await supabase.from('api_keys').select('id').limit(1);
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('   ❌ api_keys table does NOT exist\n');
        needsMigration = true;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ api_keys table exists\n');
    }
  } catch (err) {
    console.error('   ⚠️ Error:', err.message, '\n');
    needsMigration = true;
  }

  // Check 5: metadata column in payment_transactions
  console.log('5️⃣ Checking payment_transactions.metadata column...');
  try {
    const { error } = await supabase.from('payment_transactions').select('metadata').limit(1);
    if (error) {
      if (error.message.includes('metadata')) {
        console.log('   ❌ metadata column does NOT exist\n');
        needsMigration = true;
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ metadata column exists\n');
    }
  } catch (err) {
    console.error('   ⚠️ Error:', err.message, '\n');
    needsMigration = true;
  }

  // Summary
  console.log('━'.repeat(80));
  if (!needsMigration) {
    console.log('\n✨ All payment system tables exist! Migration already applied.\n');
  } else {
    console.log('\n⚠️  MIGRATION NEEDED\n');
    console.log('📋 TO APPLY THE MIGRATION:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"\n');
    console.log('5. Open file: supabase/migrations/007_payment_system_enhancements.sql');
    console.log('6. Copy ALL the contents (it\'s a large file)');
    console.log('7. Paste into Supabase SQL Editor');
    console.log('8. Click "Run" (or press Ctrl+Enter)');
    console.log('9. Wait for success message (may take 10-15 seconds)\n');
    console.log('10. Run this script again to verify\n');
    console.log('━'.repeat(80));
  }
}

checkMigrations();
