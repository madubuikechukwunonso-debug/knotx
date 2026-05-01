import { NextResponse } from 'next/server';
import { listProducts } from '@/modules/products/products.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Existing filters (backward compatible)
  const category = searchParams.get('category') || undefined;
  const featured = searchParams.get('featured') === '1' || undefined;
  
  // NEW: Filter by ProductCategory (from AdminProductsSection)
  const categoryId = searchParams.get('categoryId');
  const productCategoryId = categoryId ? parseInt(categoryId) : undefined;

  const products = await listProducts({ 
    category, 
    featured,
    productCategoryId,  // ← NEW: Support for product categories
  });

  return NextResponse.json({ ok: true, products });
}
