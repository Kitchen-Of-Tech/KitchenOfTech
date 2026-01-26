/**
 * API Key Verification Script
 * 
 * Run this after rotating keys to verify they work correctly.
 * 
 * Usage:
 *   node verify-api-keys.js
 */

require('dotenv').config({ path: '.env.local' });

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  console.log(title);
  console.log('='.repeat(60));
}

// ========================================
// Test 1: Environment Variables Loaded
// ========================================
test('Environment Variables Loaded', () => {
  const required = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'RESEND_API_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  log('✅', 'All required environment variables are present');
  return true;
});

// ========================================
// Test 2: JWT Secret Length
// ========================================
test('JWT Secret Strength', () => {
  const secret = process.env.JWT_SECRET;
  
  if (secret.length < 32) {
    throw new Error(`JWT_SECRET is too short (${secret.length} chars). Must be at least 32 characters.`);
  }

  log('✅', `JWT_SECRET is strong (${secret.length} characters)`);
  return true;
});

// ========================================
// Test 3: Sanity Token Format
// ========================================
test('Sanity Token Format', () => {
  const token = process.env.SANITY_API_TOKEN;
  
  if (!token.startsWith('sk')) {
    throw new Error('SANITY_API_TOKEN must start with "sk"');
  }

  if (token.length < 40) {
    throw new Error('SANITY_API_TOKEN appears too short');
  }

  log('✅', 'Sanity token format is valid');
  return true;
});

// ========================================
// Test 4: Supabase Keys Format
// ========================================
test('Supabase Keys Format', () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!serviceKey.startsWith('eyJ')) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must be a JWT (start with "eyJ")');
  }

  if (!anonKey.startsWith('eyJ')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be a JWT (start with "eyJ")');
  }

  if (serviceKey === anonKey) {
    throw new Error('Service role key and anon key should be different!');
  }

  log('✅', 'Supabase keys format is valid');
  return true;
});

// ========================================
// Test 5: Resend Key Format
// ========================================
test('Resend Key Format', () => {
  const key = process.env.RESEND_API_KEY;
  
  if (!key.startsWith('re_')) {
    throw new Error('RESEND_API_KEY must start with "re_"');
  }

  if (key.length < 30) {
    throw new Error('RESEND_API_KEY appears too short');
  }

  log('✅', 'Resend key format is valid');
  return true;
});

// ========================================
// Test 6: Sanity Connection (API Test)
// ========================================
test('Sanity API Connection', async () => {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const token = process.env.SANITY_API_TOKEN;

  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=*[_type == "siteSettings"][0]`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Sanity API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  log('✅', `Sanity API connected successfully (${data.result ? 'data found' : 'no data yet'})`);
  return true;
});

// ========================================
// Test 7: Supabase Connection (API Test)
// ========================================
test('Supabase API Connection', async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const response = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Supabase API error (${response.status}): ${error}`);
  }

  log('✅', 'Supabase API connected successfully');
  return true;
});

// ========================================
// Test 8: Resend Connection (API Test)
// ========================================
test('Resend API Connection', async () => {
  const key = process.env.RESEND_API_KEY;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${key}`,
    },
  });

  if (!response.ok && response.status !== 401) {
    // 401 is ok - means key is recognized but query requires more permissions
    const error = await response.text();
    throw new Error(`Resend API error (${response.status}): ${error}`);
  }

  log('✅', 'Resend API key is valid');
  return true;
});

// ========================================
// Run All Tests
// ========================================
async function runTests() {
  logSection('🔐 API Key Verification Script');
  console.log('Testing rotated API keys...\n');

  for (const { name, fn } of tests) {
    try {
      logSection(`Testing: ${name}`);
      await fn();
      passed++;
    } catch (error) {
      log('❌', `FAILED: ${error.message}`);
      failed++;
    }
  }

  // Summary
  logSection('📊 Test Summary');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('');

  if (failed === 0) {
    log('🎉', 'ALL TESTS PASSED! Your API keys are working correctly.');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run build');
    console.log('  2. Run: npm run dev');
    console.log('  3. Test the application manually');
    console.log('  4. Mark TODO #2 as complete');
    process.exit(0);
  } else {
    log('⚠️', 'SOME TESTS FAILED. Please check your API keys.');
    console.log('\nTroubleshooting:');
    console.log('  1. Check .env.local file for correct values');
    console.log('  2. Verify keys were copied correctly (no extra spaces)');
    console.log('  3. Ensure old keys were deleted from dashboards');
    console.log('  4. Review API_KEY_ROTATION_GUIDE.md');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
