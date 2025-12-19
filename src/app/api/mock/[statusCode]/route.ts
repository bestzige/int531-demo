import { withMetrics } from '@/lib/withMetrics';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  statusCode: string;
};

const handler = async (
  req: NextRequest,
  { params }: { params: Promise<Params> }
) => {
  const { statusCode } = await params;
  const code = Number(statusCode);

  if (!Number.isInteger(code) || code < 100 || code > 599) {
    return NextResponse.json({ error: 'Invalid status code' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const message = searchParams.get('message');

  return NextResponse.json(
    {
      status: code,
      message: message ?? 'mock response',
      method: req.method,
      timestamp: new Date().toISOString(),
    },
    { status: code }
  );
};

export const GET = withMetrics(handler);
export const POST = withMetrics(handler);
export const PUT = withMetrics(handler);
export const PATCH = withMetrics(handler);
export const DELETE = withMetrics(handler);
