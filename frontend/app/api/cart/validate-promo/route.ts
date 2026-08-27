import { NextResponse } from 'next/server';

const PROMO_CODES: Record<string, any> = {
  "SHOPMIND10": { code: "SHOPMIND10", discount_percent: 10, description: "10% off entire order" },
  "AIWELCOME": { code: "AIWELCOME", flat_discount: 1000, description: "₹1,000 off new user discount" },
  "FREESHIP": { code: "FREESHIP", free_shipping: true, description: "Free Express Delivery" }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = (body.code || '').trim().toUpperCase();
    if (PROMO_CODES[code]) {
      return NextResponse.json(PROMO_CODES[code]);
    }
    return NextResponse.json({ detail: "Invalid or expired promo code." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }
}
