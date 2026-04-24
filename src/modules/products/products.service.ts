// src/modules/products/products.service.ts
import { prisma } from "@/lib/prisma";

export async function listProducts(input?: {
  category?: string;
  featured?: boolean;
}) {
  return prisma.product.findMany({
    where: {
      ...(input?.category ? { category: input.category } : {}),
      ...(input?.featured !== undefined ? { featured: input.featured } : {}),
      active: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
  });
}
