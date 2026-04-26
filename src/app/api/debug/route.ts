import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const apps = await prisma.application.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return NextResponse.json(apps);
}
