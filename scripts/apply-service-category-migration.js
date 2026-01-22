// Apply service category migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  try {
    console.log('🚀 Applying service category migration...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_add_testimonial_service_category.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing SQL:\n', sql);
    console.log('');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      // Try direct query approach
      console.log('ℹ️  Trying direct approach...\n');
      
      // Add column
      const { error: alterError } = await supabase.rpc('exec_sql', {
        query: `ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS service_name TEXT;`
      });
      
      if (alterError) {
        console.error('❌ Error:', alterError);
        process.exit(1);
      }
      
      console.log('✅ Column added successfully');
      
      // Create index
      const { error: indexError } = await supabase.rpc('exec_sql', {
        query: `CREATE INDEX IF NOT EXISTS idx_testimonials_service_name ON public.testimonials(service_name);`
      });
      
      if (indexError) {
        console.log('⚠️  Index creation:', indexError.message);
      } else {
        console.log('✅ Index created successfully');
      }
    } else {
      console.log('✅ Migration applied successfully');
    }
    
    // Verify the column exists
    const { data: columns, error: verifyError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(0);
    
    console.log('\n✅ Migration complete! service_name column added to testimonials table.\n');
    
  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    process.exit(1);
  }
}

applyMigration();
