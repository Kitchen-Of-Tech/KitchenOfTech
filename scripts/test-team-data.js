/**
 * Test script to check team members data from Sanity
 * Run with: node scripts/test-team-data.js
 */

const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// Load environment variables
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
  } catch {
    console.warn('Warning: Could not load .env.local file');
  }
}

loadEnvFile();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

const TEAM_MEMBERS_QUERY = `
  *[_type == "team"] | order(order asc, name asc) {
    _id,
    name,
    slug,
    designation,
    image,
    shortDescription,
    available,
    featured,
    order,
    yearsOfExperience,
    technologies,
    socialLinks[] {
      platform,
      url
    }
  }
`;

async function testTeamData() {
  console.log('\n🔍 Testing Team Members Data from Sanity...\n');
  
  try {
    console.log('📊 Sanity Config:');
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}\n`);
    
    console.log('🔄 Fetching team members...\n');
    const teamMembers = await client.fetch(TEAM_MEMBERS_QUERY);
    
    console.log(`✅ Found ${teamMembers.length} team member(s)\n`);
    
    if (teamMembers.length === 0) {
      console.log('❌ NO TEAM MEMBERS FOUND!');
      console.log('\n💡 Possible issues:');
      console.log('   1. No team members created in Sanity Studio');
      console.log('   2. Team members not published');
      console.log('   3. Wrong dataset selected');
      console.log('   4. Schema type name mismatch');
      console.log('\n📝 To fix:');
      console.log('   1. Go to http://localhost:3000/studio');
      console.log('   2. Create team members under "Team Members"');
      console.log('   3. Fill in all required fields');
      console.log('   4. Click "Publish"');
    } else {
      console.log('📋 Team Members Data:\n');
      teamMembers.forEach((member, idx) => {
        console.log(`${idx + 1}. ${member.name}`);
        console.log(`   ID: ${member._id}`);
        console.log(`   Slug: ${member.slug?.current || 'No slug'}`);
        console.log(`   Designation: ${member.designation || 'No designation'}`);
        console.log(`   Featured: ${member.featured ? 'Yes' : 'No'}`);
        console.log(`   Available: ${member.available ? 'Yes' : 'No'}`);
        console.log(`   Order: ${member.order || 0}`);
        console.log(`   Image: ${member.image ? '✓' : '✗'}`);
        console.log(`   Short Description: ${member.shortDescription ? '✓' : '✗'}`);
        console.log(`   Technologies: ${member.technologies?.length || 0}`);
        console.log(`   Years Experience: ${member.yearsOfExperience || 'Not set'}`);
        console.log('');
      });
      
      // Summary
      const featuredCount = teamMembers.filter(m => m.featured).length;
      const availableCount = teamMembers.filter(m => m.available).length;
      const withImages = teamMembers.filter(m => m.image).length;
      const withSlugs = teamMembers.filter(m => m.slug?.current).length;
      
      console.log('📊 Summary:');
      console.log(`   Total Members: ${teamMembers.length}`);
      console.log(`   Featured: ${featuredCount}`);
      console.log(`   Available: ${availableCount}`);
      console.log(`   With Images: ${withImages}`);
      console.log(`   With Slugs: ${withSlugs}`);
      
      // Issues
      const issues = [];
      if (withSlugs < teamMembers.length) {
        issues.push(`${teamMembers.length - withSlugs} member(s) missing slug`);
      }
      if (withImages < teamMembers.length) {
        issues.push(`${teamMembers.length - withImages} member(s) missing image`);
      }
      
      if (issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log('\n   Fix these in Sanity Studio!');
      } else {
        console.log('\n✅ All team members have required fields!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fetching team members:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env.local file');
    console.error('   2. Verify Sanity credentials');
    console.error('   3. Check network connection');
    console.error('   4. Verify Sanity project is active');
  }
  
  console.log('\n' + '═'.repeat(60) + '\n');
}

testTeamData();
