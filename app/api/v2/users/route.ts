// Next.js API Route using Clean Architecture
// Integration point between Next.js and our clean architecture

import { NextRequest } from 'next/server'
import { createUserHandler } from '../../../../src/presentation/api/users/CreateUserController'
import { registerServices } from '../../../../src/infrastructure/di/ServiceRegistration'
import { container } from '../../../../src/infrastructure/di/Container'

// Initialize dependencies
registerServices(container)

// Export handlers
export const POST = createUserHandler()
