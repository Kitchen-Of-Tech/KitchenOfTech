// Apply migration using Supabase Management API
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Extract project ref from URL
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];

console.log('🚀 Applying migration to Supabase project:', projectRef);
console.log('\n📄 Reading migration file...\n');

// Read the migration SQL
const migrationPath = path.join(__dirname, '../supabase/migrations/20260201_add_payment_to_enrollments.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('SQL to execute:');
console.log('─'.repeat(50));
console.log(migrationSQL);
console.log('─'.repeat(50));
console.log('\n⚡ Executing via Supabase REST API...\n');

// Prepare the request
const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  hostname: `${projectRef}.supabase.co`,
  port: 443,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Migration applied successfully!');
      console.log('\n📊 Response:', data || 'No data returned');
      console.log('\n🎉 Database schema updated!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify in Supabase Dashboard');
      console.log('   2. Run: node scripts/check-migration.js');
      console.log('   3. Test the enrollment flow');
    } else {
      console.error('❌ Migration failed with status:', res.statusCode);
      console.error('Response:', data);
      console.log('\n💡 Alternative: Apply manually via Supabase Dashboard');
      console.log('   See MIGRATION_GUIDE.md for instructions');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error executing migration:', error.message);
  console.log('\n💡 Manual Application Required:');
  console.log('   1. Open Supabase Dashboard');
  console.log('   2. Go to SQL Editor');
  console.log('   3. Copy and paste this SQL:');
  console.log('\n' + migrationSQL);
  console.log('\n   4. Click Run');
});

req.write(postData);
req.end();
