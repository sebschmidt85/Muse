import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    
    const note = await prisma.note.create({
      data: {
        title,
        content,
      },
    });
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 