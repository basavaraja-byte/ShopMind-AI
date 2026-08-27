import { NextResponse } from 'next/server';
import { PRODUCTS_CATALOG } from '@/lib/backendEngine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  if (category) {
    const filtered = PRODUCTS_CATALOG.filter(p => p.category.toLowerCase() === category.toLowerCase());
    return NextResponse.json(filtered);
  }
  return NextResponse.json(PRODUCTS_CATALOG);
}
