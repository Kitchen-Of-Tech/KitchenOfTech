import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Facebook Conversions API has been removed. Use Google Tag Manager.' },
    { status: 410 }
  );
}
