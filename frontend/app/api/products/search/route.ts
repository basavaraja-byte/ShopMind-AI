import { NextResponse } from 'next/server';
import { PRODUCTS_CATALOG } from '@/lib/backendEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = (body.query || '').toLowerCase();
    const category = (body.category || '').toLowerCase();
    const maxBudget = body.max_budget;
    const minRating = body.min_rating || 0;

    let items = PRODUCTS_CATALOG;
    if (category) items = items.filter(p => p.category.toLowerCase() === category);
    if (maxBudget) items = items.filter(p => p.final_price <= maxBudget);
    if (minRating) items = items.filter(p => p.rating >= minRating);
    if (query) items = items.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error searching products' }, { status: 400 });
  }
}
