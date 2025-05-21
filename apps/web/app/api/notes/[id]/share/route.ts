import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the note and verify ownership
    const note = await prisma.note.findFirst({
      where: { 
        id: params.id,
        userId: currentUser.id,
      },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or you do not have permission to share it' },
        { status: 404 }
      );
    }

    // Find the user to share with
    const userToShareWith = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToShareWith) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if note is already shared with this user
    const existingShare = await prisma.$queryRaw`
      SELECT * FROM "SharedNote"
      WHERE "noteId" = ${note.id}
      AND "userId" = ${userToShareWith.id}
    `;

    if (existingShare && Array.isArray(existingShare) && existingShare.length > 0) {
      return NextResponse.json(
        { error: 'Note is already shared with this user' },
        { status: 400 }
      );
    }

    // Create the share
    const sharedNote = await prisma.$executeRaw`
      INSERT INTO "SharedNote" ("id", "noteId", "userId", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${note.id}, ${userToShareWith.id}, NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to share note:', error);
    return NextResponse.json(
      { error: 'Failed to share note' },
      { status: 500 }
    );
  }
} 