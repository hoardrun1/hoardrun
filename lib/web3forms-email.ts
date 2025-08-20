interface EmailData {
  to: string
  name: string
  subject: string
  message: string
  verificationLink?: string
}

interface Web3FormsResponse {
  success: boolean
  message: string
}

/**
 * Send email using Web3Forms
 */
export async function sendEmailWithWeb3Forms(emailData: EmailData): Promise<Web3FormsResponse> {
  try {
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

    console.log('Web3Forms: Sending email to:', emailData.to)
    console.log('Web3Forms: Access key configured:', !!accessKey)

    if (!accessKey) {
      throw new Error('Web3Forms access key not configured')
    }

    const formData = new FormData()
    formData.append('access_key', accessKey)
    formData.append('email', emailData.to)
    formData.append('name', emailData.name)
    formData.append('subject', emailData.subject)
    formData.append('message', emailData.message)

    // Add custom fields for better email formatting
    formData.append('from_name', 'HoardRun')
    formData.append('from_email', 'noreply@hoardruns.vercel.app')

    console.log('Web3Forms: Submitting to API...')

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    console.log('Web3Forms: Response status:', response.status)
    console.log('Web3Forms: Response data:', result)

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return {
      success: true,
      message: 'Email sent successfully'
    }

  } catch (error) {
    console.error('Web3Forms email error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
}

/**
 * Send email verification using Web3Forms
 */
export async function sendVerificationEmail(email: string, name: string, verificationLink: string): Promise<Web3FormsResponse> {
  const emailData: EmailData = {
    to: email,
    name: name,
    subject: '🔐 Verify Your HoardRun Account',
    message: `
Hi ${name},

Welcome to HoardRun! 🎉

Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours for security reasons.

If you didn't create an account with HoardRun, please ignore this email.

Best regards,
The HoardRun Team

---
HoardRun - Your Financial Journey Starts Here
https://hoardruns.vercel.app
    `.trim(),
    verificationLink
  }

  return sendEmailWithWeb3Forms(emailData)
}

/**
 * Send welcome email using Web3Forms
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<Web3FormsResponse> {
  const emailData: EmailData = {
    to: email,
    name: name,
    subject: '🎉 Welcome to HoardRun!',
    message: `
Hi ${name},

Welcome to HoardRun! 🚀

Your account has been successfully created and verified. You can now:

✅ Track your finances
✅ Manage your investments  
✅ Send and receive money
✅ Build your savings goals

Get started by exploring your dashboard:
https://hoardruns.vercel.app/dashboard

If you have any questions, feel free to reach out to our support team.

Best regards,
The HoardRun Team

---
HoardRun - Your Financial Journey Starts Here
https://hoardruns.vercel.app
    `.trim()
  }

  return sendEmailWithWeb3Forms(emailData)
}

/**
 * Generate verification link
 */
export function generateVerificationLink(email: string, token: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://hoardruns.vercel.app'
  
  return `${baseUrl}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`
}

/**
 * Generate verification token (simple implementation)
 */
export function generateVerificationToken(email: string): string {
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2, 15)
  const emailHash = btoa(email).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
  
  return `${emailHash}_${timestamp}_${randomString}`
}
