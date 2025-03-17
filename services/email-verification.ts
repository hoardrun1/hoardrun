// Remove the direct toast import since we'll handle notifications in the components
export class EmailVerificationService {
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
  private static readonly VERIFICATION_ENDPOINT = '/api/verify-email'
  private static readonly CHECK_EMAIL_ENDPOINT = '/api/check-email'

  static validateEmailFormat(email: string): boolean {
    return this.EMAIL_REGEX.test(email)
  }

  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const response = await fetch(this.CHECK_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      })

      if (!response.ok) throw new Error('Failed to check email availability')
      const data = await response.json()
      return !data.exists
    } catch (error) {
      console.error('Email check error:', error)
      throw error
    }
  }

  static async sendVerificationEmail(email: string): Promise<void> {
    try {
      const response = await fetch(this.VERIFICATION_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      })

      if (!response.ok) {
        throw new Error('Failed to send verification email')
      }
    } catch (error) {
      console.error('Verification email error:', error)
      throw error
    }
  }
} 