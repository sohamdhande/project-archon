import { NextResponse } from 'next/server';
import { removeStudent, updateStudentPoints } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await removeStudent(params.id);
    revalidateTag('leaderboard');
    return NextResponse.json({ success: true });
  } catch (error) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { points } = await request.json();

    if (typeof points !== 'number' || !Number.isInteger(points)) {
      return NextResponse.json({ error: 'Points must be an integer' }, { status: 400 });
    }

    const student = await updateStudentPoints(params.id, points);
    revalidateTag('leaderboard');
    return NextResponse.json(student);
  } catch (error) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update points' }, { status: 500 });
  }
}
