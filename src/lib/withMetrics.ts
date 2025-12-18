import { NextRequest, NextResponse } from 'next/server';
import {
  activeRequests,
  httpRequestDurationSeconds,
  httpRequestsErrorsTotal,
  httpRequestsTotal,
} from './metrics';

export const withMetrics =
  (handler: (req: NextRequest) => Promise<NextResponse>) =>
  async (req: NextRequest): Promise<NextResponse> => {
    const start = process.hrtime.bigint();
    activeRequests.inc();

    const method = req.method;
    const route = req.nextUrl.pathname;

    try {
      const res = await handler(req);

      const duration = Number(process.hrtime.bigint() - start) / 1e9;

      httpRequestsTotal.inc({
        method,
        route,
        status: res.status,
      });

      httpRequestDurationSeconds.observe(
        { method, route, status: res.status },
        duration
      );

      if (res.status >= 400) {
        httpRequestsErrorsTotal.inc({
          method,
          route,
          status: res.status,
        });
      }

      return res;
    } catch (err) {
      const duration = Number(process.hrtime.bigint() - start) / 1e9;

      httpRequestsTotal.inc({
        method,
        route,
        status: 500,
      });

      httpRequestDurationSeconds.observe(
        { method, route, status: 500 },
        duration
      );

      httpRequestsErrorsTotal.inc({
        method,
        route,
        status: 500,
      });

      throw err;
    } finally {
      activeRequests.dec();
    }
  };
