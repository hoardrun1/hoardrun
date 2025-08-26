// Presentation: Create User Controller
// API controller following Clean Architecture principles

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { CreateUserUseCase, CreateUserRequest } from '../../../application/use-cases/CreateUserUseCase'
import { container, TOKENS } from '../../../infrastructure/di/Container'
import { Logger } from '../../../application/ports/Logger'

// Input validation schema
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  initialBalance: z.number().min(0).optional(),
  currency: z.string().length(3).optional()
})

export class CreateUserController {
  private readonly createUserUseCase: CreateUserUseCase
  private readonly logger: Logger

  constructor() {
    this.createUserUseCase = container.resolve<CreateUserUseCase>(TOKENS.CREATE_USER_USE_CASE)
    this.logger = container.resolve<Logger>(TOKENS.LOGGER)
  }

  async handle(request: NextRequest): Promise<NextResponse> {
    try {
      // Parse and validate input
      const body = await request.json()
      const validatedData = createUserSchema.parse(body)

      // Map to use case request
      const useCaseRequest: CreateUserRequest = {
        email: validatedData.email,
        name: validatedData.name,
        initialBalance: validatedData.initialBalance,
        currency: validatedData.currency
      }

      // Execute use case
      const result = await this.createUserUseCase.execute(useCaseRequest)

      // Return response
      if (result.success) {
        return NextResponse.json({
          success: true,
          data: {
            userId: result.userId,
            email: result.email,
            name: result.name
          },
          message: result.message
        }, { status: 201 })
      } else {
        return NextResponse.json({
          success: false,
          error: result.message
        }, { status: 400 })
      }

    } catch (error) {
      this.logger.error('CreateUserController error', { error })

      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 })
      }

      return NextResponse.json({
        success: false,
        error: 'Internal server error'
      }, { status: 500 })
    }
  }
}

// Factory function for Next.js API route
export function createUserHandler() {
  const controller = new CreateUserController()
  return (request: NextRequest) => controller.handle(request)
}
