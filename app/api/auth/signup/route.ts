import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function GET() {
  return NextResponse.json({
    message: 'Signup API endpoint is working',
    timestamp: new Date().toISOString()
  })
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signupSchema.parse(body)

    // In a real application, you would:
    // 1. Check if user already exists in database
    // 2. Hash the password
    // 3. Save user to database
    // 4. Send verification email

    // For now, we'll just simulate the process
    console.log('Creating user:', {
      name: validatedData.name,
      email: validatedData.email,
      // Don't log the actual password
    })

    // Hash password (for demonstration)
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Simulate checking if user exists
    // In real app: const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } })

    // Simulate user creation
    // In real app: const user = await prisma.user.create({ data: { ... } })

    // For development, we'll just return success
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        name: validatedData.name,
        email: validatedData.email,
        // Don't return password or hash
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: "Validation failed",
        errors: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: "Internal server error"
    }, { status: 500 })
  }
}
