import { db } from '@/db';
import { students } from '@/db/schema';
import { withMetrics } from '@/lib/withMetrics';
import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

const handler = async (req: NextRequest, id: string): Promise<NextResponse> => {
  if (req.method === 'GET') {
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    if (!student)
      return NextResponse.json({ error: 'ไม่พบนักศึกษา' }, { status: 404 });
    return NextResponse.json(student);
  }

  if (req.method === 'PATCH') {
    const { firstName, lastName } = await req.json();
    const [existing] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    if (!existing)
      return NextResponse.json({ error: 'ไม่พบนักศึกษา' }, { status: 404 });

    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    await db
      .update(students)
      .set({ name, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(students.id, id));

    const [updated] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    return NextResponse.json(updated);
  }

  if (req.method === 'DELETE') {
    const [existing] = await db
      .select()
      .from(students)
      .where(eq(students.id, id));
    if (!existing)
      return NextResponse.json({ error: 'ไม่พบนักศึกษา' }, { status: 404 });

    await db.delete(students).where(eq(students.id, id));
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
};

export const GET = (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) =>
  withMetrics(async () => {
    const { id } = await ctx.params;
    return handler(req, id);
  })(req);
export const PATCH = (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) =>
  withMetrics(async () => {
    const { id } = await ctx.params;
    return handler(req, id);
  })(req);
export const DELETE = (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) =>
  withMetrics(async () => {
    const { id } = await ctx.params;
    return handler(req, id);
  })(req);
