import { NextResponse } from 'next/server';
import { removeSession } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await removeSession(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
