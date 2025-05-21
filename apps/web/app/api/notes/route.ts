import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get both owned and shared notes
    const [ownedNotes, sharedNotes] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      prisma.sharedNote.findMany({
        where: {
          userId: user.id,
        },
        include: {
          note: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }),
    ]);

    // Add a flag to distinguish between owned and shared notes
    const notes = [
      ...ownedNotes.map(note => ({ ...note, isShared: false })),
      ...sharedNotes.map(sharedNote => ({ 
        ...sharedNote.note, 
        isShared: true,
        user: sharedNote.note.user,
      })),
    ];
    
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
    console.log('Received POST request to create note');
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Finding user:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { title, content } = await req.json();
    console.log('Creating note for user:', user.id);
    
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.id,
      },
    });
    
    console.log('Note created successfully:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Failed to create note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 