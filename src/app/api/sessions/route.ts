import { NextResponse } from 'next/server';
import { getSessions, addSession } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Database is read-only. Please make edits directly in the Google Spreadsheet.' },
    { status: 405 }
  );
}
