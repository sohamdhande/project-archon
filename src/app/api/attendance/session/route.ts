import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sessionId, presentStudentIds } = await request.json();

    if (!sessionId || !Array.isArray(presentStudentIds)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Clear existing attendance for this session
      await tx.attendance.deleteMany({
        where: { sessionId }
      });

      // Insert new attendance
      if (presentStudentIds.length > 0) {
        await tx.attendance.createMany({
          data: presentStudentIds.map((studentId: string) => ({
            studentId,
            sessionId
          })),
          skipDuplicates: true
        });
      }
    });

    revalidateTag('leaderboard');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update session attendance' }, { status: 500 });
  }
}
