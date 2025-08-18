// Check admin setup in memory store
import { memoryStore } from "../lib/db/memory-store";

async function checkAdminSetup() {
  console.log('Checking admin setup...\n');

  // Check if admin user exists
  const adminUser = await memoryStore.getAdminByEmail('admin@example.com');
  
  if (adminUser) {
    console.log('✅ Admin user found:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Name:', adminUser.name);
    console.log('   Password:', adminUser.password);
    console.log('   Role:', adminUser.role);
  } else {
    console.log('❌ Admin user not found in memory store');
  }

  // Check if admin exists as regular user
  console.log('\nChecking if admin exists as regular user...');
  const regularUser = await memoryStore.getUserByEmail('admin@example.com');
  
  if (regularUser) {
    console.log('✅ Admin exists as regular user:');
    console.log('   ID:', regularUser.id);
    console.log('   Email:', regularUser.email);
  } else {
    console.log('❌ Admin does not exist as regular user');
  }

  // List all admin users
  console.log('\nAll admin users:');
  const adminCount = memoryStore.adminUsers.size;
  console.log(`Total admin users: ${adminCount}`);
  
  for (const [id, admin] of memoryStore.adminUsers) {
    console.log(`- ${admin.email} (${admin.role})`);
  }

  // List regular users
  console.log('\nRegular users count:', memoryStore.users.size);
}

checkAdminSetup().catch(console.error);