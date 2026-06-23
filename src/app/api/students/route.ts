import { NextResponse } from 'next/server';
import { getStudents, addStudent } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const students = await getStudents();
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const student = await addStudent(name.trim());
    revalidateTag('leaderboard');
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    const e = error as { code?: string };
    // Prisma unique constraint violation
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Student already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}
