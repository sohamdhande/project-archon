import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  return NextResponse.json(
    { error: 'Database is read-only. Please make edits directly in the Google Spreadsheet.' },
    { status: 405 }
  );
}
