// lib/email.ts - Complete version with 2FA support
import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendVerificationEmail(email: string, userId: string) {
  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Store the verification code in the database
  await prisma.verificationCode.create({
    data: {
      code: verificationCode,
      userId: userId,
      type: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    },
  })

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Your App" <noreply@yourapp.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 30 minutes.</p>
    `,
  })

  return verificationCode
}

export async function sendTwoFactorCode(email: string, code: string) {
  try {
    // Send the 2FA code via email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Your App" <noreply@yourapp.com>',
      to: email,
      subject: 'Two-Factor Authentication Code',
      html: `
        <h1>Two-Factor Authentication</h1>
        <p>Your authentication code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please secure your account immediately.</p>
      `,
    })
    
    console.log('2FA code sent successfully to:', email)
  } catch (error) {
    console.error('Error sending 2FA code:', error)
    throw new Error('Failed to send two-factor authentication code')
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Your App" <noreply@yourapp.com>',
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}" style="color: #007bff; text-decoration: none;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `,
  })
}

export async function sendSecurityAlert(email: string, alertType: string, details: any) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Your App" <noreply@yourapp.com>',
    to: email,
    subject: 'Security Alert - Suspicious Activity Detected',
    html: `
      <h1>Security Alert</h1>
      <p>We detected suspicious activity on your account:</p>
      <p><strong>Alert Type:</strong> ${alertType}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
      <p>If this was you, you can ignore this email. Otherwise, please secure your account immediately.</p>
    `,
  })
}