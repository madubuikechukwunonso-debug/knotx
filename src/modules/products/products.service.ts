import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { products } from "../../../db/schema";
import type { Product } from "../../../db/schema";

type ProductFilter = {
  category?: string;
  featured?: boolean;
};

export async function listProducts(filter?: ProductFilter) {
  try {
    const rows: Product[] = await db()
      .select()
      .from(products)
      .orderBy(asc(products.sortOrder), asc(products.id));

    let filtered = rows.filter((p: Product) => Boolean(p.active));

    if (filter?.category) {
      filtered = filtered.filter(
        (p: Product) => p.category === filter.category,
      );
    }

    if (filter?.featured) {
      filtered = filtered.filter((p: Product) => p.featured === 1);
    }

    return filtered;
  } catch (error) {
    console.error("listProducts failed:", error);
    return [];
  }
}

export async function getProductById(id: number) {
  const rows: Product[] = await db()
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return rows[0] ?? null;
}
