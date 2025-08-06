/**
 * Client-side email utilities
 * 
 * This module provides browser-safe email functionality by calling API routes
 * instead of using Node.js-specific modules like nodemailer directly.
 */

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
  bypass?: boolean;
  error?: string;
  details?: string;
}

/**
 * Send email via API route (client-safe)
 */
export async function sendEmailViaAPI(emailData: EmailRequest): Promise<EmailResponse> {
  try {
    // Get auth token from storage
    const token = sessionStorage.getItem('token') || localStorage.getItem('auth_token');
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email');
    }

    return result;
  } catch (error) {
    console.error('Error sending email via API:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check email service status
 */
export async function checkEmailServiceStatus(): Promise<{
  status: 'available' | 'not_configured' | 'error';
  message: string;
  bypass?: boolean;
  config?: any;
}> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking email service status:', error);
    return {
      status: 'error',
      message: 'Failed to check email service status'
    };
  }
}

/**
 * Send verification email (client-safe)
 */
export async function sendVerificationEmailViaAPI(email: string, userId: string): Promise<{
  success: boolean;
  verificationCode?: string;
  message: string;
}> {
  try {
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create verification link
    const verificationLink = `${window.location.origin}/verify-email?code=${verificationCode}&userId=${userId}`;
    
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

    const result = await sendEmailViaAPI({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text
    });

    if (result.success) {
      return {
        success: true,
        verificationCode,
        message: 'Verification email sent successfully'
      };
    } else {
      return {
        success: false,
        message: result.error || 'Failed to send verification email'
      };
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send password reset email (client-safe)
 */
export async function sendPasswordResetEmailViaAPI(email: string, resetToken: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Password Reset</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">You requested a password reset. Click the link below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a6cf7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 16px; line-height: 1.5;">This link will expire in 1 hour.</p>
        <p style="color: #888; font-size: 14px; line-height: 1.5; text-align: center; margin-top: 30px;">
          If you didn't request this reset, please ignore this email.
        </p>
      </div>
    `;
    
    const text = `Password Reset: ${resetUrl}`;

    const result = await sendEmailViaAPI({
      to: email,
      subject: 'Password Reset Request',
      html,
      text
    });

    return {
      success: result.success,
      message: result.success ? 'Password reset email sent successfully' : (result.error || 'Failed to send password reset email')
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
