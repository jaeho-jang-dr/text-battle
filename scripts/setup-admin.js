const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    // Generate password hash for "1234"
    const passwordHash = await bcrypt.hash('1234', 10);
    console.log('Generated password hash for "1234"');

    // Check if admin user exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      // Update existing admin password
      const { error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', 'admin');

      if (error) {
        console.error('Error updating admin user:', error);
      } else {
        console.log('Admin user password updated successfully');
      }
    } else {
      // Create new admin user
      const { error } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          password_hash: passwordHash,
          is_guest: false,
          email: 'admin@textbattle.com'
        });

      if (error) {
        console.error('Error creating admin user:', error);
      } else {
        console.log('Admin user created successfully');
      }
    }

    // Create admin logs table if it doesn't exist
    console.log('\nSetting up admin logs table...');
    console.log('Please run the following SQL in your Supabase SQL editor:');
    console.log(`
-- Admin logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_id VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Function to get battles by hour (for statistics)
CREATE OR REPLACE FUNCTION get_battles_by_hour()
RETURNS TABLE(hour INTEGER, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        COUNT(*)::BIGINT as count
    FROM battles
    WHERE created_at >= NOW() - INTERVAL '24 hours'
    GROUP BY hour
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql;
    `);

    console.log('\nAdmin setup complete!');
    console.log('You can now login with:');
    console.log('Username: admin');
    console.log('Password: 1234');

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdmin();