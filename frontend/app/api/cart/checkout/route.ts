import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items || [];
    if (!items || items.length === 0) {
      return NextResponse.json({ detail: "Cart cannot be empty." }, { status: 400 });
    }

    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const price = item.final_price || item.price || 0;
      const qty = item.quantity || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;
      return {
        product_id: item.id,
        name: item.name,
        brand: item.brand || "",
        unit_price: price,
        quantity: qty,
        line_total: lineTotal
      };
    });

    let discountAmount = 0;
    const promoCode = (body.promo_code || '').toUpperCase();
    let shippingFee = subtotal >= 50000 ? 0 : 150;

    if (promoCode === "SHOPMIND10") {
      discountAmount = (subtotal * 10) / 100;
    } else if (promoCode === "AIWELCOME") {
      discountAmount = Math.min(subtotal, 1000);
    } else if (promoCode === "FREESHIP") {
      shippingFee = 0;
    }

    const tax = Math.round((subtotal - discountAmount) * 0.18);
    const totalPayable = Math.max(0, subtotal - discountAmount + shippingFee + tax);

    const order = {
      order_id: orderId,
      status: "Confirmed",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      items: processedItems,
      shipping_address: body.shipping_address || {},
      payment_method: body.payment_method || "Credit Card",
      subtotal: Math.round(subtotal),
      discount: Math.round(discountAmount),
      shipping_fee: shippingFee,
      tax: tax,
      total_payable: totalPayable,
      estimated_delivery: "2-3 Business Days",
      promo_applied: promoCode || null
    };

    return NextResponse.json(order);
  } catch (err: any) {
    return NextResponse.json({ detail: "Checkout failed" }, { status: 400 });
  }
}
