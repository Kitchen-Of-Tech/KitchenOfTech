#!/usr/bin/env node

/**
 * Quick Test Script for Education Platform
 * 
 * This script performs basic validation of the platform setup
 * Run with: node scripts/quick-test.js
 */

// Load environment variables from .env.local
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Simple .env.local parser
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.warn('Warning: Could not load .env.local file');
  }
}

loadEnvFile();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Check environment variables
function checkEnvVariables() {
  log('\n📋 Checking Environment Variables...', 'blue');
  
  const requiredVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'RESEND_API_KEY',
  ];
  
  const optionalVars = [
    'STRIPE_SECRET_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET',
  ];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is MISSING`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logWarning(`${varName} is not set (optional)`);
    }
  });
  
  return allRequired;
}

// Test Supabase connection
async function testSupabase() {
  log('\n🗄️  Testing Supabase Connection...', 'blue');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    logError('Supabase URL not configured');
    return false;
  }
  
  try {
    const url = `${supabaseUrl}/rest/v1/`;
    const response = await fetch(url, {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    });
    
    if (response.ok || response.status === 404) {
      logSuccess('Supabase connection successful');
      return true;
    } else {
      logError(`Supabase connection failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Supabase connection error: ${error.message}`);
    return false;
  }
}

// Test Sanity connection
async function testSanity() {
  log('\n📝 Testing Sanity CMS Connection...', 'blue');
  
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  
  if (!projectId || !dataset) {
    logError('Sanity credentials not configured');
    return false;
  }
  
  try {
    const url = `https://${projectId}.api.sanity.io/v2021-10-21/data/query/${dataset}?query=*[_type == "course"][0...1]`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      logSuccess('Sanity connection successful');
      logInfo(`Found ${data.result?.length || 0} courses in Sanity`);
      return true;
    } else {
      logError(`Sanity connection failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Sanity connection error: ${error.message}`);
    return false;
  }
}

// Test Resend email service
async function testResend() {
  log('\n📧 Testing Resend Email Service...', 'blue');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    logError('RESEND_API_KEY not configured');
    return false;
  }
  
  try {
    // Just verify API key format
    if (apiKey.startsWith('re_')) {
      logSuccess('Resend API key format is valid');
      logInfo('Email service is configured and ready');
      return true;
    } else {
      logWarning('Resend API key format seems incorrect');
      return false;
    }
  } catch (error) {
    logError(`Resend validation error: ${error.message}`);
    return false;
  }
}

// Check if development server is running
async function checkDevServer() {
  log('\n🚀 Checking Development Server...', 'blue');
  
  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      logSuccess('Development server is running on http://localhost:3000');
      return true;
    } else {
      logWarning('Server responded but with status: ' + response.status);
      return false;
    }
  } catch {
    logWarning('Development server is not running');
    logInfo('Start it with: npm run dev');
    return false;
  }
}

// Check file structure
function checkFileStructure() {
  log('\n📁 Checking File Structure...', 'blue');
  
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs2 = require('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path2 = require('path');
  
  const criticalFiles = [
    'app/api/education/enroll/route.ts',
    'app/api/education/progress/route.ts',
    'app/api/education/certificate/generate/route.ts',
    'components/education/CoursePlayer.tsx',
    'lib/email/notifications.ts',
    'supabase/migrations/20260201_fix_certificate_eligibility.sql',
  ];
  
  let allExist = true;
  
  criticalFiles.forEach(file => {
    const filePath = path2.join(process.cwd(), file);
    if (fs2.existsSync(filePath)) {
      logSuccess(file);
    } else {
      logError(`${file} is MISSING`);
      allExist = false;
    }
  });
  
  return allExist;
}

// Main test execution
async function runTests() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   Education Platform - Quick Test     ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  const results = {
    env: false,
    files: false,
    supabase: false,
    sanity: false,
    resend: false,
    server: false,
  };
  
  // Run all tests
  results.env = checkEnvVariables();
  results.files = checkFileStructure();
  results.supabase = await testSupabase();
  results.sanity = await testSanity();
  results.resend = await testResend();
  results.server = await checkDevServer();
  
  // Summary
  log('\n' + '═'.repeat(50), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('═'.repeat(50), 'cyan');
  
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(Boolean).length;
  const failed = total - passed;
  
  log(`\nTotal Tests: ${total}`);
  logSuccess(`Passed: ${passed}`);
  if (failed > 0) {
    logError(`Failed: ${failed}`);
  }
  
  log('\nDetailed Results:', 'yellow');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`  ${status} - ${test.toUpperCase()}`, color);
  });
  
  // Recommendations
  log('\n💡 RECOMMENDATIONS:', 'yellow');
  
  if (!results.env) {
    log('  • Check your .env.local file for missing environment variables');
  }
  
  if (!results.files) {
    log('  • Some critical files are missing. Check your project structure.');
  }
  
  if (!results.supabase) {
    log('  • Verify Supabase credentials in .env.local');
    log('  • Check if your Supabase project is active');
  }
  
  if (!results.sanity) {
    log('  • Verify Sanity credentials in .env.local');
    log('  • Check if your Sanity project has courses published');
  }
  
  if (!results.resend) {
    log('  • Verify RESEND_API_KEY in .env.local');
    log('  • Get API key from https://resend.com');
  }
  
  if (!results.server) {
    log('  • Start development server: npm run dev');
    log('  • Then run this test again');
  }
  
  if (passed === total) {
    log('\n🎉 All tests passed! Your platform is ready for testing.', 'green');
    log('\nNext Steps:', 'cyan');
    log('  1. Create demo courses in Sanity Studio (see DEMO_COURSE_CREATION_GUIDE.md)');
    log('  2. Follow TESTING_CHECKLIST.md for comprehensive testing');
    log('  3. Test enrollment, learning, and certificate flows');
  } else {
    log('\n⚠️  Some tests failed. Please fix the issues above before proceeding.', 'yellow');
  }
  
  log('\n' + '═'.repeat(50) + '\n', 'cyan');
}

// Run the tests
runTests().catch(error => {
  logError(`Test execution failed: ${error.message}`);
  process.exit(1);
});
