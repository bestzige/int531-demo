import {
  frontendErrors,
  frontendLatency,
  frontendRequests,
} from '@/lib/metrics';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { kind, name, value, success } = body;

    const typeLabel = `${kind}_${name}`;

    frontendRequests.inc({ type: typeLabel });

    if (typeof value === 'number') {
      frontendLatency.observe({ type: typeLabel }, value / 1000);
    }

    if (success === false) {
      frontendErrors.inc({ type: typeLabel });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    frontendErrors.inc({ type: 'frontend_metrics_handler' });
    return NextResponse.json({ ok: false }, { status: 400 });
  }
};
