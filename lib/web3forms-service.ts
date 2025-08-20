// Web3Forms email service for sending verification emails
export class Web3FormsService {
  private static readonly ACCESS_KEY = '01ba0925-f1bd-40a7-bc04-f33fb72e964c';
  private static readonly API_URL = 'https://api.web3forms.com/submit';

  /**
   * Send email verification link to user
   */
  static async sendVerificationEmail(
    userEmail: string, 
    userName: string, 
    verificationToken: string,
    baseUrl: string = window.location.origin
  ): Promise<{ success: boolean; message: string }> {
    try {
      const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`;
      
      const emailContent = this.generateVerificationEmailHTML(userName, verificationLink);
      
      const formData = new FormData();
      formData.append('access_key', this.ACCESS_KEY);
      formData.append('subject', 'Verify Your HoardRun Account');
      formData.append('from_name', 'HoardRun Team');
      formData.append('to', userEmail);
      formData.append('message', emailContent);
      formData.append('content_type', 'text/html');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'Verification email sent successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Web3Forms email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send verification email'
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string,
    baseUrl: string = window.location.origin
  ): Promise<{ success: boolean; message: string }> {
    try {
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
      
      const emailContent = this.generatePasswordResetEmailHTML(userName, resetLink);
      
      const formData = new FormData();
      formData.append('access_key', this.ACCESS_KEY);
      formData.append('subject', 'Reset Your HoardRun Password');
      formData.append('from_name', 'HoardRun Team');
      formData.append('to', userEmail);
      formData.append('message', emailContent);
      formData.append('content_type', 'text/html');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'Password reset email sent successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Web3Forms email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send password reset email'
      };
    }
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(
    userEmail: string,
    userName: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emailContent = this.generateWelcomeEmailHTML(userName);
      
      const formData = new FormData();
      formData.append('access_key', this.ACCESS_KEY);
      formData.append('subject', 'Welcome to HoardRun! 🎉');
      formData.append('from_name', 'HoardRun Team');
      formData.append('to', userEmail);
      formData.append('message', emailContent);
      formData.append('content_type', 'text/html');
      
      const response = await fetch(this.API_URL, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          message: 'Welcome email sent successfully'
        };
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Web3Forms email error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send welcome email'
      };
    }
  }

  /**
   * Generate HTML content for verification email
   */
  private static generateVerificationEmailHTML(userName: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your HoardRun Account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏦 HoardRun</div>
          <h1>Verify Your Account</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Thank you for signing up for HoardRun! We're excited to have you join our community.</p>
          <p>To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify My Email</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${verificationLink}
          </p>
          
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          
          <p>If you didn't create an account with HoardRun, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The HoardRun Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HoardRun. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for password reset email
   */
  private static generatePasswordResetEmailHTML(userName: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your HoardRun Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏦 HoardRun</div>
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We received a request to reset your HoardRun account password.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset My Password</a>
          </div>
          
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px; font-family: monospace;">
            ${resetLink}
          </p>
          
          <p><strong>This password reset link will expire in 1 hour.</strong></p>
          
          <p>For your security, this link can only be used once. If you need to reset your password again, please request a new reset link.</p>
          
          <p>Best regards,<br>The HoardRun Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HoardRun. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML content for welcome email
   */
  private static generateWelcomeEmailHTML(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HoardRun!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏦 HoardRun</div>
          <h1>Welcome to HoardRun! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Congratulations! Your email has been verified and your HoardRun account is now active.</p>
          
          <p>You're now ready to start your financial journey with HoardRun. Here's what you can do:</p>
          
          <div class="feature">
            <h3>💳 Manage Your Cards</h3>
            <p>Add, organize, and track all your financial cards in one secure place.</p>
          </div>
          
          <div class="feature">
            <h3>📊 Track Your Finances</h3>
            <p>Monitor your spending, savings, and financial goals with our intuitive dashboard.</p>
          </div>
          
          <div class="feature">
            <h3>🔒 Secure & Private</h3>
            <p>Your data is encrypted and protected with industry-standard security measures.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.com'}/dashboard" class="button">Go to Dashboard</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Welcome aboard!</p>
          <p>The HoardRun Team</p>
        </div>
        <div class="footer">
          <p>© 2024 HoardRun. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </body>
      </html>
    `;
  }
}
