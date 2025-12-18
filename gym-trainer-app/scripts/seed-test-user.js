/**
 * Quick script to create a test user for development
 * Run with: node scripts/seed-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

// Use service role key if available, otherwise use anon key (limited functionality)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Supabase key not found. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY to .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER = {
  email: 'test@gymble.com',
  password: 'test123456',
  name: 'Test Trainer'
};

async function createTestUser() {
  console.log('🔧 Creating test user...\n');

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === TEST_USER.email);

    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log(`📧 Email: ${TEST_USER.email}`);
      console.log(`🔑 Password: ${TEST_USER.password}\n`);
      console.log('You can log in with these credentials.');
      return;
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      // If admin API not available, try regular signup
      if (authError.message.includes('admin') || authError.message.includes('service_role')) {
        console.log('⚠️  Service role key not available. Using regular signup...');
        console.log('📝 Please sign up manually with:');
        console.log(`   Email: ${TEST_USER.email}`);
        console.log(`   Password: ${TEST_USER.password}\n`);
        console.log('Or add SUPABASE_SERVICE_ROLE_KEY to .env.local for automatic creation.');
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed');
    }

    // Create trainer record
    const { error: trainerError } = await supabase
      .from('trainers')
      .insert([
        {
          user_id: authData.user.id,
          email: TEST_USER.email,
          name: TEST_USER.name,
        },
      ]);

    if (trainerError) {
      console.error('⚠️  User created but trainer record failed:', trainerError.message);
      console.log('You can still log in, but you may need to create the trainer record manually.');
    }

    console.log('✅ Test user created successfully!');
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}\n`);
    console.log('You can now log in with these credentials.');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    console.log('\n💡 Alternative: Use the signup page with:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
  }
}

createTestUser();


