import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

// Singleton pattern para Prisma Client
class PrismaService {
  private static instance: PrismaClient;
  private static isConnected = false;

  public static async getInstance(): Promise<PrismaClient> {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty',
      });
    }

    if (!this.isConnected) {
      try {
        await this.instance.$connect();
        this.isConnected = true;
        console.log('✅ Prisma connected successfully');
      } catch (error) {
        console.error('❌ Failed to connect to database:', error);
        throw error;
      }
    }

    return this.instance;
  }

  public static async disconnect(): Promise<void> {
    if (this.instance && this.isConnected) {
      await this.instance.$disconnect();
      this.isConnected = false;
      console.log('🔌 Prisma disconnected');
    }
  }
}

// Wrapper para endpoints que necesitan Prisma
export function withPrisma(
  handler: (req: NextRequest, prisma: PrismaClient) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const prisma = await PrismaService.getInstance();
      return await handler(req, prisma);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
  };
}

export { PrismaService };