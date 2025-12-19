'use client';

import { useEffect } from 'react';
import { Metric, onCLS, onINP, onLCP, onTTFB } from 'web-vitals';

const WebVitals = () => {
  useEffect(() => {
    const sendMetric = (metric: Metric) => {
      navigator.sendBeacon(
        '/api/frontend-metrics',
        JSON.stringify({
          kind: 'web_vital',
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          page: window.location.pathname,
          success: metric.rating !== 'poor',
        })
      );
    };

    onCLS(sendMetric);
    onLCP(sendMetric);
    onINP(sendMetric);
    onTTFB(sendMetric);
  }, []);

  return null;
};

export default WebVitals;
