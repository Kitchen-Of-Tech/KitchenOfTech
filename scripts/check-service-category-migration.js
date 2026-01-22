// Check and apply service category migration
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMigration() {
  try {
    console.log('🔍 Checking if service_name column exists...\n');
    
    // Try to select with service_name column
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, service_name')
      .limit(1);
    
    if (error) {
      if (error.message.includes('service_name') || error.code === '42703') {
        console.log('❌ service_name column does NOT exist');
        console.log('\n📝 Please run this SQL in your Supabase Dashboard SQL Editor:\n');
        console.log('----------------------------------------');
        console.log('ALTER TABLE public.testimonials');
        console.log('ADD COLUMN service_name TEXT;');
        console.log('');
        console.log('CREATE INDEX idx_testimonials_service_name ON public.testimonials(service_name);');
        console.log('');
        console.log("COMMENT ON COLUMN public.testimonials.service_name IS 'Service category assigned when testimonial is approved';");
        console.log('----------------------------------------\n');
        console.log('After running the SQL, run this script again to verify.\n');
        return false;
      } else {
        console.error('Error checking column:', error);
        return false;
      }
    }
    
    console.log('✅ service_name column exists!');
    console.log('Migration is already applied.\n');
    return true;
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

checkMigration();
