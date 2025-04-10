import { PrismaClient } from '@prisma/client';

// PrismaClient singleton oluşturma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
};

// Development ortamında hot-reload sırasında çoklu bağlantıları önlemek için
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 