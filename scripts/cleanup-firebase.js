/**
 * Firebase Cleanup Script
 * This script helps you clean up Firebase Authentication and Firestore data
 * Run with: node scripts/cleanup-firebase.js
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin (you'll need to set up service account)
// For now, this is a template - you'll need to add your service account key

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function cleanupFirebaseAuth() {
  try {
    console.log('🔥 Firebase Authentication Cleanup');
    console.log('=====================================');
    
    const confirm = await askQuestion('⚠️  This will delete ALL users from Firebase Auth. Are you sure? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled.');
      return;
    }

    // List all users
    console.log('📋 Fetching all users...');
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    console.log(`Found ${users.length} users to delete.`);
    
    if (users.length === 0) {
      console.log('✅ No users found. Database is already clean.');
      return;
    }

    // Delete users in batches
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const uids = batch.map(user => user.uid);
      
      console.log(`🗑️  Deleting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(users.length/batchSize)}...`);
      
      try {
        await admin.auth().deleteUsers(uids);
        console.log(`✅ Deleted ${uids.length} users`);
      } catch (error) {
        console.error(`❌ Error deleting batch:`, error.message);
      }
    }
    
    console.log('🎉 Firebase Auth cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

async function cleanupFirestore() {
  try {
    console.log('\n🔥 Firestore Database Cleanup');
    console.log('===============================');
    
    const confirm = await askQuestion('⚠️  This will delete ALL documents from Firestore. Are you sure? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Firestore cleanup cancelled.');
      return;
    }

    const db = admin.firestore();
    
    // Common collections to clean up
    const collections = ['users', 'profiles', 'sessions', 'tokens', 'requests'];
    
    for (const collectionName of collections) {
      console.log(`🗑️  Cleaning collection: ${collectionName}`);
      
      try {
        const snapshot = await db.collection(collectionName).get();
        
        if (snapshot.empty) {
          console.log(`✅ Collection '${collectionName}' is already empty`);
          continue;
        }
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`✅ Deleted ${snapshot.docs.length} documents from '${collectionName}'`);
        
      } catch (error) {
        console.log(`⚠️  Collection '${collectionName}' doesn't exist or error: ${error.message}`);
      }
    }
    
    console.log('🎉 Firestore cleanup completed!');
    
  } catch (error) {
    console.error('❌ Error during Firestore cleanup:', error.message);
  }
}

async function main() {
  console.log('🧹 Firebase Cleanup Utility');
  console.log('============================\n');
  
  // Check if Firebase Admin is initialized
  if (!admin.apps.length) {
    console.log('❌ Firebase Admin not initialized.');
    console.log('📝 To use this script, you need to:');
    console.log('   1. Download your Firebase service account key');
    console.log('   2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    console.log('   3. Or initialize admin.initializeApp() with your config');
    console.log('\n💡 Alternative: Use Firebase Console or CLI for cleanup');
    rl.close();
    return;
  }
  
  const choice = await askQuestion('What would you like to clean?\n1. Authentication only\n2. Firestore only\n3. Both\n4. Exit\nChoice (1-4): ');
  
  switch (choice) {
    case '1':
      await cleanupFirebaseAuth();
      break;
    case '2':
      await cleanupFirestore();
      break;
    case '3':
      await cleanupFirebaseAuth();
      await cleanupFirestore();
      break;
    case '4':
      console.log('👋 Goodbye!');
      break;
    default:
      console.log('❌ Invalid choice');
  }
  
  rl.close();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupFirebaseAuth, cleanupFirestore };
