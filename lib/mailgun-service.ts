import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { devEmailService } from './dev-email';

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

// Use the specific sandbox domain from your C# example
const domain = process.env.MAILGUN_DOMAIN || 'sandbox17bdad0471cf4e8a90689b5205641894.mailgun.org';
const from = process.env.MAILGUN_FROM || 'Mailgun Sandbox <postmaster@sandbox17bdad0471cf4e8a90689b5205641894.mailgun.org>';

/**
 * Send an email using Mailgun
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    // Check if we have the required configuration
    if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
      console.warn('Mailgun configuration missing, falling back to development email service');
      return devEmailService.sendEmail(to, subject, html);
    }

    // Send the email using Mailgun
    const result = await mg.messages.create(domain, {
      from,
      to,
      subject,
      html,
      text: text || '',
    });

    console.log('Email sent via Mailgun:', result.id);
    return result.id;
  } catch (error) {
    console.error('Error sending email via Mailgun:', error);

    // Fall back to development email service
    console.log('Falling back to development email service');
    return devEmailService.sendEmail(to, subject, html);
  }
}

/**
 * Send a verification email
 */
export async function sendVerificationEmail(email: string, userId: string): Promise<string> {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Create verification link
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-link?code=${verificationCode}&userId=${userId}`;

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

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetCode: string): Promise<string> {
  // Create reset link
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?code=${resetCode}`;

  // Email content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">We received a request to reset your password. If you didn't make this request, you can ignore this email.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${resetCode}
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 10px;">Your password reset code (valid for 30 minutes)</p>
      </div>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">Alternatively, you can click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
    </div>
  `;

  const text = `
    Reset Your Password

    We received a request to reset your password. If you didn't make this request, you can ignore this email.

    Your password reset code: ${resetCode}

    Or reset your password by visiting this link: ${resetLink}
  `;

  // Send the email
  await sendEmail(email, 'Reset Your Password', html, text);

  return resetCode;
}
