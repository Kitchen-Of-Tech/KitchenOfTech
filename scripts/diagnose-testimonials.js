/**
 * Diagnose Testimonial System Issues
 * Checks user role, database tables, and API connectivity
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
  console.log('🔍 Testimonial System Diagnostics\n');
  console.log('='.repeat(60));
  
  // 1. Check Tables
  console.log('\n📊 DATABASE TABLES:');
  console.log('-'.repeat(60));
  
  const tables = ['testimonials', 'testimonial_links'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`  ❌ ${table}: Error`);
    }
  }
  
  // 2. Check is_verified column
  console.log('\n🔍 CHECKING is_verified COLUMN:');
  console.log('-'.repeat(60));
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, is_verified')
      .limit(1);
    
    if (error) {
      if (error.message.includes('is_verified')) {
        console.log('  ❌ is_verified column NOT FOUND');
        console.log('  ⚠️  Please apply migration 004:');
        console.log('     node scripts/apply-verified-migration.js');
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
    } else {
      console.log('  ✅ is_verified column exists');
    }
  } catch (err) {
    console.log('  ❌ Error checking column');
  }
  
  // 3. List all users with their roles
  console.log('\n👥 USERS & ROLES:');
  console.log('-'.repeat(60));
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, role:roles(name, level)')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.log(`  ❌ Error fetching users: ${error.message}`);
    } else if (users && users.length > 0) {
      users.forEach((user, index) => {
        const roleInfo = user.role ? `${user.role.name} (level ${user.role.level})` : 'No role';
        const canAccess = user.role && user.role.level <= 2 ? '✅ CAN ACCESS' : '❌ BLOCKED';
        console.log(`\n  ${index + 1}. ${user.full_name || user.username || 'Unknown'}`);
        console.log(`     Email: ${user.email || 'N/A'}`);
        console.log(`     Role: ${roleInfo}`);
        console.log(`     Testimonials Dashboard: ${canAccess}`);
      });
    } else {
      console.log('  ⚠️  No users found');
    }
  } catch (err) {
    console.log('  ❌ Error fetching users');
  }
  
  // 4. Count testimonials by status
  console.log('\n\n📈 TESTIMONIALS STATISTICS:');
  console.log('-'.repeat(60));
  try {
    const statuses = ['pending', 'approved', 'rejected'];
    for (const status of statuses) {
      const { data, error, count } = await supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      if (!error) {
        console.log(`  ${status.toUpperCase().padEnd(10)}: ${count || 0} testimonials`);
      }
    }
    
    // Total count
    const { count: total } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });
    
    console.log(`  ${'TOTAL'.padEnd(10)}: ${total || 0} testimonials`);
  } catch (err) {
    console.log('  ❌ Error fetching statistics');
  }
  
  // 5. Check RLS Policies
  console.log('\n\n🔐 RLS POLICIES STATUS:');
  console.log('-'.repeat(60));
  try {
    const { data: policies } = await supabase
      .rpc('pg_policies')
      .select('*')
      .in('tablename', ['testimonials', 'testimonial_links']);
    
    console.log('  ℹ️  RLS policies check requires admin privileges');
    console.log('  ℹ️  Please verify in Supabase Dashboard > Authentication > Policies');
  } catch (err) {
    console.log('  ℹ️  Cannot check RLS policies via client');
  }
  
  // 6. Recommendations
  console.log('\n\n💡 RECOMMENDATIONS:');
  console.log('='.repeat(60));
  
  try {
    const { data: users } = await supabase
      .from('users')
      .select('role:roles(level)');
    
    const hasAdmin = users && users.some(u => u.role && u.role.level <= 2);
    
    if (!hasAdmin) {
      console.log('\n  ⚠️  NO ADMIN USER FOUND!');
      console.log('  → Create a CEO user:');
      console.log('     node scripts/setup-ceo.js\n');
    } else {
      console.log('\n  ✅ Admin users exist\n');
    }
  } catch (err) {
    // Ignore
  }
  
  console.log('  📚 For detailed guide, see: TESTIMONIAL_SYSTEM_GUIDE.md');
  console.log('  🔧 To apply missing migrations, run:');
  console.log('     node scripts/apply-verified-migration.js\n');
  console.log('='.repeat(60));
}

diagnose().catch(error => {
  console.error('\n❌ Diagnostic failed:', error.message);
  process.exit(1);
});
