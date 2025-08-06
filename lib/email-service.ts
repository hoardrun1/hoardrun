// Browser-compatible email service
const isBrowser = typeof window !== 'undefined';

// Email transporter (server-side only)
let transporter: any = null;

if (!isBrowser) {
  try {
    const nodemailer = require('nodemailer');

    // Configure email transporter
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } catch (error) {
    console.warn('Nodemailer not available:', error);
  }
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    if (isBrowser) {
      // In browser, log the email attempt (could send to API endpoint instead)
      console.log('Email would be sent (browser mode):', { to, subject });
      return 'browser-mock-message-id';
    }

    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"HoardRun" <noreply@hoardrun.com>',
      to,
      subject,
      html,
      text,
    });

    console.log('Email sent:', info.messageId);
    return info.messageId;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendVerificationEmail(email: string, userId: string): Promise<string> {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Create verification link
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?code=${verificationCode}&userId=${userId}`;
  
  // Email content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">Thank you for signing up! Please verify your email address to continue.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${verificationCode}
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 10px;">Your verification code (valid for 30 minutes)</p>
      </div>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">Alternatively, you can click the button below to verify your email:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
      </div>
      <p style="color: #888; font-size: 14px; line-height: 1.5; text-align: center; margin-top: 30px;">
        If you didn't sign up for this account, you can safely ignore this email.
      </p>
    </div>
  `;
  
  const text = `
    Verify Your Email
    
    Thank you for signing up! Please verify your email address to continue.
    
    Your verification code: ${verificationCode}
    
    Or verify by visiting this link: ${verificationLink}
    
    If you didn't sign up for this account, you can safely ignore this email.
  `;
  
  // Send the email
  await sendEmail(email, 'Verify Your Email Address', html, text);
  
  return verificationCode;
}
