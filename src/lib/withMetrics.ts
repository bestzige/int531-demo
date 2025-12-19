import { NextRequest, NextResponse } from 'next/server';
import {
  apiHttpRequestDurationSeconds,
  apiHttpRequestsErrorsTotal,
  apiHttpRequestsInFlight,
  apiHttpRequestsTotal,
} from './metrics';

const normalizeRoute = (req: NextRequest): string => {
  return req.nextUrl.pathname || 'unknown';
};

export const withMetrics =
  (handler: (req: NextRequest) => Promise<NextResponse>) =>
  async (req: NextRequest): Promise<NextResponse> => {
    const start = process.hrtime.bigint();
    apiHttpRequestsInFlight.inc();

    const method = req.method;
    const route = normalizeRoute(req);

    try {
      const res = await handler(req);

      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

      const labels = {
        method,
        route,
        status: String(res.status),
      };

      // Traffic
      apiHttpRequestsTotal.inc(labels);

      // Latency
      apiHttpRequestDurationSeconds.observe(labels, durationSeconds);

      // Errors
      if (res.status >= 500) {
        apiHttpRequestsErrorsTotal.inc(labels);
      }

      return res;
    } catch (err) {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

      const labels = {
        method,
        route,
        status: '500',
      };

      apiHttpRequestsTotal.inc(labels);
      apiHttpRequestDurationSeconds.observe(labels, durationSeconds);
      apiHttpRequestsErrorsTotal.inc(labels);

      throw err;
    } finally {
      apiHttpRequestsInFlight.dec();
    }
  };
