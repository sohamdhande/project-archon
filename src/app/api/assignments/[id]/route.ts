import { NextResponse } from 'next/server';
import { removeAssignment, updateAssignment } from '@/lib/db';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await removeAssignment(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const e = error as { code?: string };
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, due_date, status } = await request.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Valid title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'Valid description is required' }, { status: 400 });
    }
    if (!due_date || typeof due_date !== 'string' || isNaN(Date.parse(due_date))) {
      return NextResponse.json({ error: 'Valid due_date is required' }, { status: 400 });
    }
    if (status !== 'ACTIVE' && status !== 'ARCHIVED') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const assignment = await updateAssignment(params.id, title.trim(), description.trim(), due_date, status);
    return NextResponse.json(assignment, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update assignment' }, { status: 500 });
  }
}
