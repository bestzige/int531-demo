import { NextRequest, NextResponse } from 'next/server';

type Params = {
  statusCode: string;
};

const handler = async (req: NextRequest, { params }: { params: Params }) => {
  const code = Number(params.statusCode);

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

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
