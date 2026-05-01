export async function listProducts(filters?: {
  category?: string;
  featured?: boolean;
  productCategoryId?: number;  // ← NEW
}) {
  return prisma.product.findMany({
    where: {
      active: true,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.featured !== undefined && { featured: filters.featured }),
      ...(filters?.productCategoryId && { 
        productCategoryId: filters.productCategoryId 
      }),
    },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      productCategoryId: true,
      productCategory: {
        select: { id: true, name: true },
      },
    },
  });
}
