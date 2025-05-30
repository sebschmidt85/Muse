import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { nodes as basicNodes, marks as basicMarks } from '@tiptap/pm/schema-basic';
import { AICommandBlock } from '@/components/tailwind/ai-command-block';
import { AuthorMark } from '@/components/tailwind/extensions/author-mark';

const schema = new Schema({
  nodes: {
    ...basicNodes,
    aiCommandBlock: {
      group: 'block',
      content: 'text*',
      defining: true,
      toDOM: () => ['div', { 'data-type': 'ai-command-block' }, 0],
      parseDOM: [
        { tag: 'div[data-type="ai-command-block"]' },
      ],
    },
  },
  marks: {
    ...basicMarks,
    author: AuthorMark,
  },
});

function proseMirrorJsonToPlainText(json: any): string {
  try {
    if (!json) return '';
    const node = ProseMirrorNode.fromJSON(schema, json);
    return node.textBetween(0, node.content.size, '\n');
  } catch (e) {
    console.error('[search] Error converting ProseMirror JSON:', e);
    return '';
  }
}

function findRelevantMatches(content: string, query: string): string[] {
  console.log('[search] Finding matches for query:', query);
  console.log('[search] Content length:', content.length);
  
  if (!content) {
    console.log('[search] Empty content received');
    return [];
  }
  
  const matches: string[] = [];
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  
  console.log('[search] Number of lines to search:', lines.length);
  
  for (const line of lines) {
    if (line.toLowerCase().includes(queryLower)) {
      const lineIndex = lines.indexOf(line);
      const context = [
        lineIndex > 0 ? lines[lineIndex - 1] : '',
        line,
        lineIndex < lines.length - 1 ? lines[lineIndex + 1] : ''
      ].filter(Boolean).join('\n');
      
      console.log('[search] Found match:', {
        line: line.substring(0, 100) + '...',
        context: context.substring(0, 100) + '...'
      });
      matches.push(context);
    }
  }
  
  console.log('[search] Total matches found:', matches.length);
  return matches;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }
    // Get all owned notes
    const ownedNotes = await prisma.note.findMany({ 
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });
    // Convert all notes to plain text and concatenate
    const allContent = ownedNotes.map(note => proseMirrorJsonToPlainText(note.content)).join('\n---\n');
    // Build correct base URL for internal fetch
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    // Call the LLM API with the user's query and all note content
    const aiResponse = await fetch(`${baseUrl}/api/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: query,
        context: allContent,
      }),
    });
    if (!aiResponse.ok) {
      return NextResponse.json({ error: 'Failed to get LLM response' }, { status: 500 });
    }
    const aiData = await aiResponse.json();
    return NextResponse.json({
      answer: aiData.response,
      totalNotes: ownedNotes.length,
    });
  } catch (error) {
    console.error('[search] Failed to process search:', error);
    return NextResponse.json({ error: 'Failed to process search' }, { status: 500 });
  }
} 