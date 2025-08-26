// test-email-config.js - Quick test for email configuration
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const nodemailer = require('nodemailer');

// Check if nodemailer is properly loaded
if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
  console.error('❌ Nodemailer not properly loaded. Available methods:', Object.keys(nodemailer));
  process.exit(1);
}

async function testEmailConfig() {
  console.log('🧪 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || '❌ Not set');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || '❌ Not set');
  console.log('SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not set');
  console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('SMTP_FROM:', process.env.SMTP_FROM || '❌ Not set');
  console.log('');

  // Check if we have the minimum required config
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('❌ Missing SMTP credentials. Please update your .env.local file with:');
    console.log('');
    console.log('SMTP_USER=your-email@gmail.com');
    console.log('SMTP_PASSWORD=your-gmail-app-password');
    console.log('');
    console.log('📖 To get Gmail App Password:');
    console.log('1. Go to myaccount.google.com');
    console.log('2. Security → 2-Step Verification → App Passwords');
    console.log('3. Generate password for "Mail"');
    console.log('4. Use the 16-character password (not your regular Gmail password)');
    return;
  }

  // Test SMTP connection
  console.log('🔌 Testing SMTP Connection...');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');

    // Test sending email (optional - uncomment to actually send)
    /*
    console.log('📧 Sending test email...');
    
    const testEmail = {
      from: process.env.SMTP_FROM || '"HoardRun Test" <noreply@hoardrun.com>',
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'HoardRun Email Test',
      html: `
        <h2>🎉 Email Configuration Test Successful!</h2>
        <p>This is a test email from your HoardRun application.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p>If you received this email, your email configuration is working correctly!</p>
      `,
      text: 'HoardRun email configuration test successful! Timestamp: ' + new Date().toISOString()
    };

    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('📬 Check your inbox at:', process.env.SMTP_USER);
    */

    console.log('');
    console.log('🎯 Email Configuration Status: ✅ READY');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Test the signup flow with a real email address');
    console.log('3. Check that verification emails are received');
    console.log('');
    console.log('💡 To send a test email, uncomment the test email section in this script');

  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check your Gmail App Password is correct');
    console.log('2. Ensure 2-Factor Authentication is enabled on Gmail');
    console.log('3. Verify the email address is correct');
    console.log('4. Try generating a new App Password');
    console.log('');
    console.log('📖 Gmail App Password Guide:');
    console.log('https://support.google.com/accounts/answer/185833');
  }
}

// Run the test
testEmailConfig().catch(console.error);
