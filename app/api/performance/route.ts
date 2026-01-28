import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit';

/**
 * @swagger
 * /api/performance:
 *   post:
 *     summary: Log performance metrics
 *     description: Endpoint for logging performance metrics and Core Web Vitals
 *     tags: [Performance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - metric
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [web-vital, custom]
 *               metric:
 *                 type: object
 *               url:
 *                 type: string
 *               timestamp:
 *                 type: number
 *     responses:
 *       200:
 *         description: Metric logged successfully
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimitMiddleware(request, 'mutations');
    if (rateLimitResult) {
      // Rate limit exceeded, return the error response
      return rateLimitResult;
    }

    const data = await request.json();

    // Validate required fields
    if (!data.type || !data.metric) {
      return NextResponse.json(
        { error: 'Type and metric are required' },
        { status: 400 }
      );
    }

    // In production, you would:
    // 1. Store metrics in a time-series database (e.g., TimescaleDB, InfluxDB)
    // 2. Send to a monitoring service (e.g., Datadog, New Relic)
    // 3. Aggregate for dashboards

    if (process.env.NODE_ENV === 'production') {
      console.log('[Performance Metric]', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data,
      }));

      // Example: Store in Supabase
      // await supabase.from('performance_metrics').insert([{
      //   metric_type: data.type,
      //   metric_data: data.metric,
      //   url: data.url,
      //   created_at: new Date().toISOString(),
      // }]);

      // Example: Send to Datadog
      // await fetch('https://api.datadoghq.com/api/v1/series', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'DD-API-KEY': process.env.DATADOG_API_KEY!,
      //   },
      //   body: JSON.stringify({
      //     series: [{
      //       metric: `web.${data.type}.${data.metric.name}`,
      //       points: [[Math.floor(Date.now() / 1000), data.metric.value]],
      //       type: 'gauge',
      //       tags: [`url:${data.url}`],
      //     }],
      //   }),
      // });
    }

    return NextResponse.json(
      { success: true, message: 'Metric logged' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Failed to log metric' },
      { status: 500 }
    );
  }
}
