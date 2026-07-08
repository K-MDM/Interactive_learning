import { getUsdToInrRate } from '@/lib/exchangeRate';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rate = await getUsdToInrRate();
    return NextResponse.json({ rate });
  } catch (error: any) {
    console.error('Exchange rate endpoint error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve exchange rate' },
      { status: 500 }
    );
  }
}
