import { NextResponse } from 'next/server';
import { getAssignments, addAssignment } from '@/lib/db';

export async function GET() {
  try {
    const assignments = await getAssignments();
    return NextResponse.json(assignments);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, due_date } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Valid description is required' }, { status: 400 });
    }
    if (!due_date || typeof due_date !== 'string' || isNaN(Date.parse(due_date))) {
      return NextResponse.json({ error: 'Valid due_date is required' }, { status: 400 });
    }

    const assignment = await addAssignment(title.trim(), description.trim(), due_date);
    return NextResponse.json(assignment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create assignment' }, { status: 500 });
  }
}
