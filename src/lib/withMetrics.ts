import { NextRequest, NextResponse } from 'next/server';
import {
  activeRequests,
  httpRequestDurationSeconds,
  httpRequestsErrorsTotal,
  httpRequestsTotal,
} from './metrics';

export const withMetrics =
  (handler: (req: NextRequest) => Promise<NextResponse>) =>
  async (req: NextRequest) => {
    const start = process.hrtime.bigint();
    activeRequests.inc();

    try {
      const res = await handler(req);

      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

      const url = new URL(req.url);
      const route = url.pathname;

      const labels = {
        method: req.method,
        route,
        status: String(res.status),
      };

      httpRequestsTotal.inc(labels);
      httpRequestDurationSeconds.observe(labels, durationSeconds);

      if (res.status >= 500) {
        httpRequestsErrorsTotal.inc(labels);
      }

      return res;
    } finally {
      activeRequests.dec();
    }
  };
