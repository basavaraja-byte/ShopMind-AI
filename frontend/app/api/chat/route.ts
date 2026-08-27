import { NextResponse } from 'next/server';
import { processChatMessage } from '@/lib/backendEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const conversationId = body.conversation_id;
    const result = processChatMessage(message, conversationId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
