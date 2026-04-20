import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    provider: string;
  }>;
}

/**
 * WEBHOOK ENDPOINT - DEPRECATED
 * 
 * Kitchen of Tech uses MANUAL PAYMENT APPROVAL workflow:
 * 1. Customer submits payment details via /api/payment/submit endpoint
 * 2. Admin reviews and approves/rejects in Payment Management dashboard
 * 3. No automatic webhook processing
 * 
 * This endpoint is not used and returns 501 Not Implemented.
 */

// POST /api/payment/webhooks/[provider] - DEPRECATED
export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  
  return NextResponse.json(
    {
      error: 'Webhook endpoint not implemented',
      message: 'Kitchen of Tech uses manual payment approval workflow. Webhooks are not supported.',
      provider,
      documentation: 'Use POST /api/payment/submit for manual payment submission',
    },
    { status: 501 } // 501 Not Implemented
  );
}
