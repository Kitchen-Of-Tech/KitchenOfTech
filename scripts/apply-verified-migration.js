/**
 * Apply the is_verified column migration to testimonials table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

async function applyMigration() {
  console.log('🚀 Applying is_verified column migration...\n');
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_add_testimonial_verified.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration SQL:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
  console.log('\n⚠️  Please apply this SQL in Supabase Dashboard:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project');
  console.log('   3. Click "SQL Editor"');
  console.log('   4. Copy and paste the above SQL');
  console.log('   5. Click "Run"\n');
}

applyMigration().catch(console.error);
