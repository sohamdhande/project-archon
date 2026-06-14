import { NextResponse } from 'next/server';
import { getAttendance } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const attendance = await getAttendance();
    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
