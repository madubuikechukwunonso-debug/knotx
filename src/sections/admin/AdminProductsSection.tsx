// src/sections/admin/AdminProductsSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminProductTable from './AdminProductTable';

const prisma = new PrismaClient();

async function getProducts() {
  return prisma.product.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

// Server Actions
async function createProduct(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const category = formData.get('category') as string;
  const inventory = parseInt(formData.get('inventory') as string);
  const image = (formData.get('image') as string) || null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      priceCurrency: 'cad',
      image,
      category,
      inventory,
      featured,
      active,
      sortOrder: 0,
    },
  });

  revalidatePath('/admin/products');
}

async function updateProduct(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const category = formData.get('category') as string;
  const inventory = parseInt(formData.get('inventory') as string);
  const image = (formData.get('image') as string) || null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';
  const sortOrder = parseInt(formData.get('sortOrder') as string);

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      image,
      category,
      inventory,
      featured,
      active,
      sortOrder,
    },
  });

  revalidatePath('/admin/products');
}

async function deleteProduct(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}

async function toggleActive(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const active = formData.get('active') === 'true';
  await prisma.product.update({
    where: { id },
    data: { active: !active },
  });
  revalidatePath('/admin/products');
}

export default async function AdminProductsSection() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Products</h1>
          <p className="text-black/60">Manage your shop products and inventory</p>
        </div>
        <AdminProductTable
          products={products}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onToggleActive={toggleActive}
        />
      </div>
    </div>
  );
}
