// Quick script to check if service_categories table exists and has data
// Run with: node scripts/check-service-categories.js

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

async function checkServiceCategories() {
  console.log('🔍 Checking service_categories table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('display_order');

    if (error) {
      if (error.message.includes('relation "public.service_categories" does not exist')) {
        console.error('❌ Table does not exist!');
        console.log('\n📋 To fix this, run the migration in Supabase Dashboard:');
        console.log('   1. Go to: https://supabase.com/dashboard/project/[your-project]/editor');
        console.log('   2. Click "SQL Editor" in the left sidebar');
        console.log('   3. Click "New Query"');
        console.log('   4. Copy the contents of: supabase/migrations/006_service_categories_table.sql');
        console.log('   5. Paste and click "Run"\n');
        return;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('⚠️  Table exists but has no data!');
      console.log('Run the migration to insert default categories.\n');
      return;
    }

    console.log('✅ Table exists and has data!\n');
    console.log(`📊 Found ${data.length} categories:\n`);
    
    data.forEach((cat, index) => {
      const status = cat.is_active ? '✓ Active' : '✗ Inactive';
      console.log(`${index + 1}. ${cat.name} - ${status}`);
      if (cat.description) {
        console.log(`   ${cat.description}`);
      }
    });

    console.log('\n✨ Everything looks good! You can now use dynamic service categories.');
    
  } catch (error) {
    console.error('❌ Error checking table:', error.message);
  }
}

checkServiceCategories();
