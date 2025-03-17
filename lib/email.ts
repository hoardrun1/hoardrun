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
