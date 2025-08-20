// Verification token management for email verification
import { randomBytes, createHash } from 'crypto';

export interface VerificationToken {
  token: string;
  hashedToken: string;
  email: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
}

export class VerificationTokenService {
  // In-memory storage for demo (in production, use a database)
  private static tokens: Map<string, VerificationToken> = new Map();

  /**
   * Generate a new verification token
   */
  static generateToken(
    email: string, 
    type: 'email_verification' | 'password_reset' = 'email_verification'
  ): { token: string; hashedToken: string } {
    // Generate a random token
    const token = randomBytes(32).toString('hex');
    
    // Hash the token for storage
    const hashedToken = createHash('sha256').update(token).digest('hex');
    
    // Set expiration (24 hours for email verification, 1 hour for password reset)
    const expirationHours = type === 'email_verification' ? 24 : 1;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
    
    // Store the token
    const verificationToken: VerificationToken = {
      token,
      hashedToken,
      email: email.toLowerCase(),
      type,
      expiresAt,
      createdAt: new Date()
    };
    
    this.tokens.set(hashedToken, verificationToken);
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return { token, hashedToken };
  }

  /**
   * Verify a token
   */
  static verifyToken(token: string, email: string): {
    valid: boolean;
    expired?: boolean;
    type?: 'email_verification' | 'password_reset';
    message: string;
  } {
    try {
      // Hash the provided token
      const hashedToken = createHash('sha256').update(token).digest('hex');
      
      // Find the token
      const storedToken = this.tokens.get(hashedToken);
      
      if (!storedToken) {
        return {
          valid: false,
          message: 'Invalid verification token'
        };
      }
      
      // Check if email matches
      if (storedToken.email !== email.toLowerCase()) {
        return {
          valid: false,
          message: 'Token does not match the provided email'
        };
      }
      
      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        // Remove expired token
        this.tokens.delete(hashedToken);
        return {
          valid: false,
          expired: true,
          type: storedToken.type,
          message: 'Verification token has expired'
        };
      }
      
      return {
        valid: true,
        type: storedToken.type,
        message: 'Token is valid'
      };
    } catch (error) {
      return {
        valid: false,
        message: 'Error verifying token'
      };
    }
  }

  /**
   * Consume a token (mark as used by removing it)
   */
  static consumeToken(token: string, email: string): boolean {
    try {
      const hashedToken = createHash('sha256').update(token).digest('hex');
      const storedToken = this.tokens.get(hashedToken);
      
      if (storedToken && storedToken.email === email.toLowerCase() && new Date() <= storedToken.expiresAt) {
        this.tokens.delete(hashedToken);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clean up expired tokens
   */
  static cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [hashedToken, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        this.tokens.delete(hashedToken);
      }
    }
  }

  /**
   * Get all tokens for an email (for debugging/admin purposes)
   */
  static getTokensForEmail(email: string): VerificationToken[] {
    const tokens: VerificationToken[] = [];
    for (const token of this.tokens.values()) {
      if (token.email === email.toLowerCase()) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  /**
   * Revoke all tokens for an email
   */
  static revokeTokensForEmail(email: string): number {
    let revokedCount = 0;
    const emailLower = email.toLowerCase();
    
    for (const [hashedToken, token] of this.tokens.entries()) {
      if (token.email === emailLower) {
        this.tokens.delete(hashedToken);
        revokedCount++;
      }
    }
    
    return revokedCount;
  }

  /**
   * Get token statistics
   */
  static getStats(): {
    totalTokens: number;
    emailVerificationTokens: number;
    passwordResetTokens: number;
    expiredTokens: number;
  } {
    const now = new Date();
    let emailVerificationTokens = 0;
    let passwordResetTokens = 0;
    let expiredTokens = 0;

    for (const token of this.tokens.values()) {
      if (now > token.expiresAt) {
        expiredTokens++;
      } else if (token.type === 'email_verification') {
        emailVerificationTokens++;
      } else if (token.type === 'password_reset') {
        passwordResetTokens++;
      }
    }

    return {
      totalTokens: this.tokens.size,
      emailVerificationTokens,
      passwordResetTokens,
      expiredTokens
    };
  }
}

// Auto-cleanup expired tokens every hour
if (typeof window === 'undefined') { // Only run on server-side
  setInterval(() => {
    VerificationTokenService.cleanupExpiredTokens();
  }, 60 * 60 * 1000); // 1 hour
}
