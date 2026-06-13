import { NextResponse } from 'next/server';
import { removeSession, updateSession, getSessions, prisma } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendanceCount = await prisma.attendance.count({ where: { sessionId: params.id } });
    if (attendanceCount > 0) {
      return NextResponse.json({ error: 'Cannot delete session with attendance records' }, { status: 400 });
    }
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const session = await updateSession(params.id, title.trim(), lecture_start, lecture_end, safeLink);
    return NextResponse.json(session, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to update session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
