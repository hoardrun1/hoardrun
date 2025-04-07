// Development email service for testing
// This service logs emails to the console and stores them in memory for retrieval

interface EmailMessage {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  sentAt: Date;
}

class DevEmailService {
  private emails: Map<string, EmailMessage[]> = new Map();
  
  async sendEmail(to: string, subject: string, html: string, text?: string): Promise<string> {
    const id = Math.random().toString(36).substring(2, 15);
    const email: EmailMessage = {
      id,
      to,
      subject,
      html,
      text,
      sentAt: new Date()
    };
    
    // Store the email
    if (!this.emails.has(to)) {
      this.emails.set(to, []);
    }
    this.emails.get(to)?.push(email);
    
    // Log the email to console
    console.log('\n==== DEV EMAIL SERVICE ====');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content: ${html.substring(0, 100)}...`);
    if (text) console.log(`Text Content: ${text.substring(0, 100)}...`);
    console.log('============================\n');
    
    return id;
  }
  
  getEmails(to: string): EmailMessage[] {
    return this.emails.get(to) || [];
  }
  
  getLatestEmail(to: string): EmailMessage | undefined {
    const emails = this.emails.get(to) || [];
    return emails.length > 0 ? emails[emails.length - 1] : undefined;
  }
  
  clearEmails(to: string): void {
    this.emails.delete(to);
  }
  
  clearAllEmails(): void {
    this.emails.clear();
  }
}

// Create a singleton instance
export const devEmailService = new DevEmailService();

// Helper function to send verification email
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
  
  // Send the email
  await devEmailService.sendEmail(
    email,
    'Verify Your Email Address',
    html
  );
  
  return verificationCode;
}
