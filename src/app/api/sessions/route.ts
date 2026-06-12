import { NextResponse } from 'next/server';
import { getSessions, addSession } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, datetime, meetLink } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 });
    }
    if (!datetime || typeof datetime !== 'string' || isNaN(Date.parse(datetime))) {
      return NextResponse.json({ error: 'Valid datetime is required' }, { status: 400 });
    }
    let safeLink = '';
    if (meetLink && typeof meetLink === 'string' && meetLink.trim()) {
      try {
        const url = new URL(meetLink.trim());
        safeLink = url.toString();
      } catch {
        return NextResponse.json({ error: 'Invalid meet link URL' }, { status: 400 });
      }
    }

    const session = await addSession(title.trim(), datetime, safeLink);
    return NextResponse.json(session, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
