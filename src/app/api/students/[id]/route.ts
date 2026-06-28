import { NextResponse } from 'next/server';
import { removeStudent, updateStudentPoints } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Database is read-only. Please make edits directly in the Google Spreadsheet.' },
    { status: 405 }
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Database is read-only. Please make edits directly in the Google Spreadsheet.' },
    { status: 405 }
  );
}
