import { NextResponse } from 'next/server';
import { listProducts } from '@/modules/products/products.service';
export async function GET(request: Request) { const { searchParams } = new URL(request.url); const category = searchParams.get('category') || undefined; const featured = searchParams.get('featured') === '1' || undefined; const products = await listProducts({ category, featured }); return NextResponse.json({ ok: true, products }); }
