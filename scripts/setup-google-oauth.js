#!/usr/bin/env node

/**
 * Google OAuth Setup Script for Team Development
 * 
 * This script helps team members set up Google OAuth credentials
 * for local development.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupGoogleOAuth() {
  console.log('🚀 Google OAuth Setup for HoardRun Development\n');
  
  console.log('Choose your setup option:');
  console.log('1. Use shared team credentials (recommended for team members)');
  console.log('2. Set up your own Google OAuth app');
  console.log('3. Skip Google OAuth setup (use email/password only)\n');
  
  const choice = await question('Enter your choice (1, 2, or 3): ');
  
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  switch (choice.trim()) {
    case '1':
      await setupSharedCredentials(envContent, envPath);
      break;
    case '2':
      await setupPersonalCredentials(envContent, envPath);
      break;
    case '3':
      await skipGoogleOAuth(envContent, envPath);
      break;
    default:
      console.log('Invalid choice. Exiting...');
      process.exit(1);
  }
  
  rl.close();
}

async function setupSharedCredentials(envContent, envPath) {
  console.log('\n📋 Setting up shared team credentials...\n');
  
  console.log('Please get the shared credentials from your team lead and enter them below:');
  const clientId = await question('Google Client ID: ');
  const clientSecret = await question('Google Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Both Client ID and Client Secret are required.');
    process.exit(1);
  }
  
  // Update environment variables
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_ID', clientId);
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_SECRET', clientSecret);
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', clientId);
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Shared credentials configured successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Ask your team lead to add your Gmail address as a test user');
  console.log('2. Start the dev server: npm run dev');
  console.log('3. Test Google login at: http://localhost:3004/signin');
  console.log('4. If you get "Access blocked", you need to be added as a test user');
}

async function setupPersonalCredentials(envContent, envPath) {
  console.log('\n🔧 Setting up your personal Google OAuth app...\n');
  
  console.log('Follow these steps to create your own OAuth app:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Create a new project or select existing');
  console.log('3. Enable Google+ API or Google Identity API');
  console.log('4. Go to "OAuth consent screen" and configure it');
  console.log('5. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"');
  console.log('6. Choose "Web application"');
  console.log('7. Add these redirect URIs:');
  console.log('   - http://localhost:3000/api/auth/callback/google');
  console.log('   - http://localhost:3001/api/auth/callback/google');
  console.log('   - http://localhost:3002/api/auth/callback/google');
  console.log('   - http://localhost:3003/api/auth/callback/google');
  console.log('   - http://localhost:3004/api/auth/callback/google');
  console.log('8. Copy the Client ID and Client Secret\n');
  
  const proceed = await question('Have you completed the setup? (y/n): ');
  if (proceed.toLowerCase() !== 'y') {
    console.log('Please complete the setup first, then run this script again.');
    process.exit(0);
  }
  
  const clientId = await question('Enter your Client ID: ');
  const clientSecret = await question('Enter your Client Secret: ');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Both Client ID and Client Secret are required.');
    process.exit(1);
  }
  
  // Update environment variables
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_ID', clientId);
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_SECRET', clientSecret);
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', clientId);
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Personal OAuth app configured successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Start the dev server: npm run dev');
  console.log('2. Test Google login at: http://localhost:3004/signin');
  console.log('3. You can sign in with any Google account (it\'s your app!)');
}

async function skipGoogleOAuth(envContent, envPath) {
  console.log('\n⏭️  Skipping Google OAuth setup...\n');
  
  // Set placeholder values
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_ID', 'not-configured');
  envContent = updateEnvVar(envContent, 'GOOGLE_CLIENT_SECRET', 'not-configured');
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'not-configured');
  
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Google OAuth disabled for development.');
  console.log('\n📝 You can still use:');
  console.log('1. Email/password authentication');
  console.log('2. All other app features');
  console.log('3. Set up Google OAuth later by running this script again');
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + `\n${newLine}`;
  }
}

// Run the setup
setupGoogleOAuth().catch(console.error);
