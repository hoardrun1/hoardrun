// Simple email service without nodemailer dependency
const logEmail = (to: string, subject: string, content: string) => {
  console.log('------------------');
  console.log('Email Details:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', content);
  console.log('------------------');
};

export async function sendVerificationEmail(to: string, code: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Hoardrun';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@hoardrun.com';

  // Log the verification code for development
  console.log('Verification code for', to, ':', code);

  // In development, we'll just log the email
  const emailContent = `
    Welcome to ${appName}!
    
    Your verification code is: ${code}
    
    This code will expire in 30 minutes.
    
    If you didn't request this verification, please ignore this email.
    
    For support, contact us at ${supportEmail}
  `;

  logEmail(
    to,
    `Verify your ${appName} account`,
    emailContent
  );

  return true;
}

export async function sendPasswordResetEmail(to: string, code: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Hoardrun';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@hoardrun.com';

  // Log the reset code for development
  console.log('Password reset code for', to, ':', code);

  // In development, we'll just log the email
  const emailContent = `
    Hello!
    
    Your password reset code is: ${code}
    
    This code will expire in 30 minutes.
    
    If you didn't request this password reset, please ignore this email.
    
    For support, contact us at ${supportEmail}
  `;

  logEmail(
    to,
    `Reset your ${appName} password`,
    emailContent
  );

  return true;
} 