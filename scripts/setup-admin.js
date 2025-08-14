const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = path.join(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'serviceAccountKey.json');
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function setupAdmin() {
  try {
    // Generate password hash for "1234"
    const passwordHash = await bcrypt.hash('1234', 10);
    console.log('Generated password hash for "1234"');

    // Check if admin user exists
    const usersRef = db.collection('users');
    const adminQuery = await usersRef.where('username', '==', 'admin').limit(1).get();

    if (!adminQuery.empty) {
      // Update existing admin password
      const adminDoc = adminQuery.docs[0];
      await adminDoc.ref.update({
        passwordHash: passwordHash,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Admin user password updated successfully');
    } else {
      // Create new admin user
      const newAdminData = {
        username: 'admin',
        passwordHash: passwordHash,
        isGuest: false,
        email: 'admin@textbattle.com',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await usersRef.add(newAdminData);
      console.log('Admin user created successfully');
    }

    // Create sample admin log entry
    console.log('\nCreating sample admin log entry...');
    const adminLogsRef = db.collection('adminLogs');
    await adminLogsRef.add({
      adminId: 'admin',
      action: 'SETUP',
      targetId: null,
      details: {
        message: 'Admin account created/updated',
        timestamp: new Date().toISOString()
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Sample admin log created');

    // Create Firestore indexes info
    console.log('\nFirestore Indexes Information:');
    console.log('Firestore will automatically create indexes for simple queries.');
    console.log('For complex queries, you may need to create composite indexes.');
    console.log('\nRecommended indexes for this application:');
    console.log('1. battles collection: createdAt (DESC) for recent battles');
    console.log('2. adminLogs collection: createdAt (DESC) for audit trail');
    console.log('3. characters collection: eloScore (DESC) for leaderboard');
    console.log('\nThese can be created through the Firebase Console or by following');
    console.log('the links in error messages when queries require them.');

    console.log('\nAdmin setup complete!');
    console.log('You can now login with:');
    console.log('Username: admin');
    console.log('Password: 1234');

  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupAdmin();