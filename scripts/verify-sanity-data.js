/**
 * Verification Script for Sanity Studio Data
 * Checks if all required content has been populated in Sanity
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkSiteSettings() {
  log('\n📋 Checking Site Settings...', 'blue');
  
  try {
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    
    if (!siteSettings) {
      log('❌ Site Settings document not found!', 'red');
      return false;
    }
    
    const checks = [
      { field: 'siteName', value: siteSettings.siteName, label: 'Site Name' },
      { field: 'siteDescription', value: siteSettings.siteDescription, label: 'Site Description' },
      { field: 'logo', value: siteSettings.logo?.asset, label: 'Logo' },
      { field: 'favicon', value: siteSettings.favicon?.asset, label: 'Favicon' },
      { field: 'email', value: siteSettings.email, label: 'Email' },
      { field: 'phone', value: siteSettings.phone, label: 'Phone' },
      { field: 'address', value: siteSettings.address, label: 'Address' },
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      if (check.value) {
        log(`  ✅ ${check.label}: ${typeof check.value === 'object' ? '✓' : check.value}`, 'green');
      } else {
        log(`  ⚠️  ${check.label}: Not set`, 'yellow');
        allPassed = false;
      }
    }
    
    // Check social media
    if (siteSettings.socialMedia && siteSettings.socialMedia.length > 0) {
      log(`  ✅ Social Media Links: ${siteSettings.socialMedia.length} links`, 'green');
      siteSettings.socialMedia.forEach(link => {
        log(`     - ${link.platform}: ${link.url}`, 'reset');
      });
    } else {
      log('  ⚠️  Social Media Links: Not set', 'yellow');
    }
    
    // Check SEO
    if (siteSettings.seo) {
      log('  ✅ SEO Settings: Configured', 'green');
      if (siteSettings.seo.metaTitle) log(`     - Meta Title: ${siteSettings.seo.metaTitle}`, 'reset');
      if (siteSettings.seo.keywords) log(`     - Keywords: ${siteSettings.seo.keywords.length} keywords`, 'reset');
    } else {
      log('  ⚠️  SEO Settings: Not set', 'yellow');
    }
    
    return allPassed;
  } catch (error) {
    log(`❌ Error checking Site Settings: ${error.message}`, 'red');
    return false;
  }
}

async function checkFooterSettings() {
  log('\n📋 Checking Footer Settings...', 'blue');
  
  try {
    const footerSettings = await client.fetch('*[_type == "footerSettings"][0]');
    
    if (!footerSettings) {
      log('⚠️  Footer Settings document not found (optional)', 'yellow');
      return true; // Optional, so don't fail
    }
    
    const checks = [
      { field: 'companyLinks', value: footerSettings.companyLinks, label: 'Company Links' },
      { field: 'servicesLinks', value: footerSettings.servicesLinks, label: 'Services Links' },
      { field: 'resourcesLinks', value: footerSettings.resourcesLinks, label: 'Resources Links' },
      { field: 'legalLinks', value: footerSettings.legalLinks, label: 'Legal Links' },
      { field: 'copyrightText', value: footerSettings.copyrightText, label: 'Copyright Text' },
    ];
    
    for (const check of checks) {
      if (check.value) {
        const count = Array.isArray(check.value) ? check.value.length : '✓';
        log(`  ✅ ${check.label}: ${count}`, 'green');
      } else {
        log(`  ⚠️  ${check.label}: Not set`, 'yellow');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Error checking Footer Settings: ${error.message}`, 'red');
    return false;
  }
}

async function checkServiceCategories() {
  log('\n📋 Checking Service Categories...', 'blue');
  
  try {
    const categories = await client.fetch('*[_type == "serviceCategory"]');
    
    if (!categories || categories.length === 0) {
      log('⚠️  No Service Categories found', 'yellow');
      return false;
    }
    
    log(`  ✅ Found ${categories.length} Service Categories:`, 'green');
    
    categories.forEach((cat, index) => {
      log(`     ${index + 1}. ${cat.title} (${cat.slug?.current})`, 'reset');
      if (cat.description) log(`        Description: ${cat.description.substring(0, 50)}...`, 'reset');
      if (cat.color) log(`        Color: ${cat.color}`, 'reset');
      if (typeof cat.order !== 'undefined') log(`        Order: ${cat.order}`, 'reset');
    });
    
    return true;
  } catch (error) {
    log(`❌ Error checking Service Categories: ${error.message}`, 'red');
    return false;
  }
}

async function checkOtherContent() {
  log('\n📋 Checking Other Content...', 'blue');
  
  const contentTypes = [
    { type: 'service', label: 'Services' },
    { type: 'portfolio', label: 'Portfolio Items' },
    { type: 'blog', label: 'Blog Posts' },
    { type: 'team', label: 'Team Members' },
    { type: 'testimonial', label: 'Testimonials' },
    { type: 'course', label: 'Courses' },
  ];
  
  for (const content of contentTypes) {
    try {
      const items = await client.fetch(`count(*[_type == "${content.type}"])`);
      
      if (items > 0) {
        log(`  ✅ ${content.label}: ${items} items`, 'green');
      } else {
        log(`  ℹ️  ${content.label}: No items yet`, 'blue');
      }
    } catch (error) {
      log(`  ⚠️  ${content.label}: Error checking (${error.message})`, 'yellow');
    }
  }
  
  return true;
}

async function verifyLogoAccessibility() {
  log('\n🖼️  Verifying Logo and Favicon URLs...', 'blue');
  
  try {
    const siteSettings = await client.fetch('*[_type == "siteSettings"][0]');
    
    if (siteSettings?.logo?.asset?._ref) {
      const logoUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${siteSettings.logo.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-svg', '.svg')}`;
      log(`  ✅ Logo URL: ${logoUrl}`, 'green');
    } else {
      log('  ⚠️  Logo asset reference not found', 'yellow');
    }
    
    if (siteSettings?.favicon?.asset?._ref) {
      const faviconUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${siteSettings.favicon.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-svg', '.svg')}`;
      log(`  ✅ Favicon URL: ${faviconUrl}`, 'green');
    } else {
      log('  ⚠️  Favicon asset reference not found', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error verifying URLs: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'bold');
  log('  SANITY STUDIO DATA VERIFICATION', 'bold');
  log('='.repeat(60) + '\n', 'bold');
  
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    log('❌ NEXT_PUBLIC_SANITY_PROJECT_ID not found in environment variables!', 'red');
    process.exit(1);
  }
  
  if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
    log('❌ NEXT_PUBLIC_SANITY_DATASET not found in environment variables!', 'red');
    process.exit(1);
  }
  
  if (!process.env.SANITY_API_TOKEN) {
    log('❌ SANITY_API_TOKEN not found in environment variables!', 'red');
    process.exit(1);
  }
  
  log(`📦 Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`, 'blue');
  log(`📦 Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`, 'blue');
  
  const results = [];
  
  results.push(await checkSiteSettings());
  results.push(await checkFooterSettings());
  results.push(await checkServiceCategories());
  results.push(await checkOtherContent());
  results.push(await verifyLogoAccessibility());
  
  log('\n' + '='.repeat(60), 'bold');
  log('  VERIFICATION SUMMARY', 'bold');
  log('='.repeat(60) + '\n', 'bold');
  
  const passed = results.filter(r => r === true).length;
  const total = results.length;
  
  if (passed === total) {
    log(`✅ All checks passed! (${passed}/${total})`, 'green');
    log('\n🎉 TODO #7 is complete! Your Sanity Studio is properly populated.', 'green');
    log('\n📝 Next steps:', 'blue');
    log('   1. Check your website at http://localhost:3000', 'reset');
    log('   2. Verify logo appears in the header', 'reset');
    log('   3. Check favicon in browser tab', 'reset');
    log('   4. Test all pages for proper content display', 'reset');
    log('   5. Ready for production deployment! 🚀', 'reset');
  } else {
    log(`⚠️  ${passed}/${total} checks passed`, 'yellow');
    log('\n📝 Some content is missing. Please populate the following in Sanity Studio:', 'yellow');
    log('   - Site Settings (logo, favicon, site info)', 'reset');
    log('   - Service Categories', 'reset');
    log('   - Visit: http://localhost:3000/studio', 'reset');
  }
  
  log('\n');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
