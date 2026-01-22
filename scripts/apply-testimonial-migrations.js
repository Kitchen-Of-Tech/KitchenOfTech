// Script to check and guide you through applying testimonial-related migrations
// Run with: node scripts/apply-testimonial-migrations.js

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
  console.log('🔍 Checking testimonial migrations status...\n');

  let needsMigrations = [];

  // Check 1: service_name column in testimonials table
  console.log('1️⃣ Checking testimonials.service_name column...');
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('service_name')
      .limit(1);

    if (error) {
      if (error.message.includes("Could not find the 'service_name' column")) {
        console.log('   ❌ service_name column does NOT exist\n');
        needsMigrations.push({
          order: 1,
          name: '005_add_testimonial_service_category.sql',
          description: 'Adds service_name column to testimonials table'
        });
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ service_name column exists\n');
    }
  } catch (err) {
    console.error('   ⚠️  Error checking column:', err.message, '\n');
  }

  // Check 2: service_categories table
  console.log('2️⃣ Checking service_categories table...');
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.service_categories" does not exist')) {
        console.log('   ❌ service_categories table does NOT exist\n');
        needsMigrations.push({
          order: 2,
          name: '006_service_categories_table.sql',
          description: 'Creates service_categories table for dynamic category management'
        });
      } else {
        throw error;
      }
    } else {
      console.log('   ✅ service_categories table exists\n');
    }
  } catch (err) {
    console.error('   ⚠️  Error checking table:', err.message, '\n');
  }

  // Summary
  console.log('━'.repeat(80));
  if (needsMigrations.length === 0) {
    console.log('\n✨ All migrations are applied! Your database is up to date.\n');
  } else {
    console.log('\n⚠️  MIGRATIONS NEEDED\n');
    console.log('You need to apply the following migrations in Supabase Dashboard:\n');
    
    needsMigrations.forEach(migration => {
      console.log(`${migration.order}. ${migration.name}`);
      console.log(`   ${migration.description}\n`);
    });

    console.log('📋 HOW TO APPLY:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the left sidebar');
    console.log('4. Click "New Query"\n');
    
    needsMigrations.forEach(migration => {
      console.log(`5. Open file: supabase/migrations/${migration.name}`);
      console.log('6. Copy ALL the contents');
      console.log('7. Paste into Supabase SQL Editor');
      console.log('8. Click "Run" (or press Ctrl+Enter)');
      console.log('9. Wait for success message\n');
    });

    console.log('10. After applying all migrations, run this script again to verify\n');
    console.log('━'.repeat(80));
  }
}

checkMigrations();
