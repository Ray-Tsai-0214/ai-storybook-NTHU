import { PrismaClient, Prisma, Category } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

// Re-export Prisma types for convenience
export { Prisma, Category }

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma