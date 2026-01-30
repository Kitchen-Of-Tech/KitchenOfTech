// Test Sanity Write API Connection
const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

console.log('\n=== SANITY CONNECTION TEST ===\n');
console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET);
console.log('Token exists:', !!process.env.SANITY_API_TOKEN);
console.log('Token length:', process.env.SANITY_API_TOKEN?.length || 0);

async function testConnection() {
  try {
    console.log('\n1. Testing basic query...');
    const result = await client.fetch('*[_type == "testimonial"][0...1]');
    console.log('✓ Query successful. Found', result.length, 'testimonials');

    console.log('\n2. Testing create operation...');
    const testDoc = await client.create({
      _type: 'testimonial',
      clientName: 'Test User',
      email: 'test@example.com',
      testimonial: 'This is a test testimonial to verify write permissions are working correctly.',
      rating: 5,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    });
    console.log('✓ Create successful. Document ID:', testDoc._id);

    console.log('\n3. Cleaning up test document...');
    await client.delete(testDoc._id);
    console.log('✓ Delete successful');

    console.log('\n=== ALL TESTS PASSED ===\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    console.error('\nFull error:', error);
  }
}

testConnection();
