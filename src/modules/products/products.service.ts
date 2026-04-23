import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { products } from '../../../../db/schema';

const fallbackProducts = [
  { id: 1, name: 'Botanical Hair Growth Oil', price: 3499, image: '/images/products/hair-oil.jpg', category: 'hair-care', featured: 1, active: 1, sortOrder: 0 },
  { id: 2, name: 'Noire Velour Edge Control', price: 1899, image: '/images/products/edge-control.jpg', category: 'styling', featured: 1, active: 1, sortOrder: 1 },
  { id: 3, name: 'Silk Satin Bonnet', price: 2499, image: '/images/products/satin-bonnet.jpg', category: 'accessories', featured: 1, active: 1, sortOrder: 2 },
  { id: 4, name: 'Aurum Nourish Leave-In Conditioner', price: 2899, image: '/images/products/leave-in.jpg', category: 'hair-care', featured: 1, active: 1, sortOrder: 3 },
];

export async function listProducts(filter?: { category?: string; featured?: boolean }) {
  try {
    const rows = await db().select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
    let filtered = rows.filter((p) => Boolean(p.active));
    if (filter?.category) filtered = filtered.filter((p) => p.category === filter.category);
    if (filter?.featured) filtered = filtered.filter((p) => p.featured === 1);
    return filtered;
  } catch {
    let filtered = fallbackProducts.filter((p) => Boolean(p.active));
    if (filter?.category) filtered = filtered.filter((p) => p.category === filter.category);
    if (filter?.featured) filtered = filtered.filter((p) => p.featured === 1);
    return filtered;
  }
}

export async function getProductById(id: number) {
  try {
    const [row] = await db().select().from(products).where(eq(products.id, id)).limit(1);
    return row ?? null;
  } catch {
    return fallbackProducts.find((p) => p.id === id) ?? null;
  }
}
