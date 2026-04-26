import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const app = await prisma.application.findUnique({
    where: { id: 'cmofewhwu0002mwipg1e75v01' }
  });
  
  if (app) {
    const data = app.data as Record<string, any>;
    data.photo = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop';
    
    await prisma.application.update({
      where: { id: app.id },
      data: { data }
    });
    
    return NextResponse.json({ success: true, newPhoto: data.photo });
  }
  return NextResponse.json({ error: 'not found' });
}
