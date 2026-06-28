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
  return NextResponse.json(
    { error: 'Database is read-only. Please make edits directly in the Google Spreadsheet.' },
    { status: 405 }
  );
}
