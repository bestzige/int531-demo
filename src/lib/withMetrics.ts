import { NextRequest, NextResponse } from 'next/server';
import {
  apiHttpRequestDurationSeconds,
  apiHttpRequestsErrorsTotal,
  apiHttpRequestsInFlight,
  apiHttpRequestsTotal,
} from './metrics';

export type AppRouteHandler<TCtx = unknown> = (
  req: NextRequest,
  ctx?: TCtx
) => Promise<NextResponse>;

const normalizeRoute = (req: NextRequest): string => {
  return req.nextUrl.pathname || 'unknown';
};

export const withMetrics =
  <TCtx = unknown>(handler: AppRouteHandler<TCtx>) =>
  async (req: NextRequest, ctx?: TCtx): Promise<NextResponse> => {
    const start = process.hrtime.bigint();
    apiHttpRequestsInFlight.inc();

    const method = req.method;
    const route = normalizeRoute(req);

    try {
      const res = await handler(req, ctx);

      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

      const labels = {
        method,
        route,
        status: String(res.status),
      };

      apiHttpRequestsTotal.inc(labels);
      apiHttpRequestDurationSeconds.observe(labels, durationSeconds);

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
