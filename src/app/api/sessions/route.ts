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
  try {
    const { title, lecture_start, lecture_end, meetLink } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 });
    }
    if (!lecture_start || !lecture_end || isNaN(Date.parse(lecture_start)) || isNaN(Date.parse(lecture_end))) {
      return NextResponse.json({ error: 'Valid lecture_start and lecture_end are required' }, { status: 400 });
    }
    
    const start = new Date(lecture_start);
    const end = new Date(lecture_end);

    if (start >= end) {
      return NextResponse.json({ error: 'lecture_start must be before lecture_end' }, { status: 400 });
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

    const session = await addSession(title.trim(), lecture_start, lecture_end, safeLink);
    revalidateTag('leaderboard');
    return NextResponse.json(session, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to create session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
