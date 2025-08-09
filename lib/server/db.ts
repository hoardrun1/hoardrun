'use server';

// This file contains server-only code and will never be bundled with client code
import { PrismaClient } from '@prisma/client';

// Extend global type to include prisma
declare global {
  var prisma: PrismaClient | undefined
}

// Initialize Prisma
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, use a global variable to prevent multiple instances during hot reloading
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
