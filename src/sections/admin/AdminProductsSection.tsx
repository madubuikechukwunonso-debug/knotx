// src/sections/admin/AdminProductsSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminProductTable from './AdminProductTable';
import fs from 'fs/promises';
import path from 'path';
import { getStripe } from '@/lib/stripe';   // ← Stripe client

const prisma = new PrismaClient();

// ====================== IMAGE UPLOAD HELPER ======================
async function uploadProductImage(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  await fs.mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  return `/uploads/products/${filename}`;
}

// ====================== SLUG GENERATOR ======================
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ====================== STRIPE SYNC HELPERS ======================
async function syncToStripe(
  name: string,
  description: string | undefined,
  imageUrl: string | undefined,
  priceInCents: number,
  existingStripeProductId?: string | null
) {
  const stripe = getStripe();

  // 1. Create or update Stripe Product
  let stripeProductId = existingStripeProductId;

  if (!stripeProductId) {
    const product = await stripe.products.create({
      name,
      description: description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
      active: true,
    });
    stripeProductId = product.id;
  } else {
    await stripe.products.update(stripeProductId, {
      name,
      description: description || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    });
  }

  // 2. Create new Price (prices are immutable in Stripe)
  const price = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: priceInCents,
    currency: 'cad',
  });

  return { stripeProductId, stripePriceId: price.id };
}

// ====================== SERVER ACTIONS ======================
async function createProduct(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || generateSlug(name);
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const category = (formData.get('category') as string) || 'general';
  const inventory = parseInt(formData.get('inventory') as string) || 0;
  const imageFile = formData.get('image') as File | null;
  const featured = formData.get('featured') === 'on';

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile);
  }

  // Sync to Stripe
  const { stripeProductId, stripePriceId } = await syncToStripe(
    name,
    description,
    imageUrl,
    price
  );

  await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      category,
      inventory,
      image: imageUrl,
      featured,
      active: true,
      stripeProductId,
      stripePriceId,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/shop'); // optional – refresh shop page too
}

async function updateProduct(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || generateSlug(name);
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const category = (formData.get('category') as string) || 'general';
  const inventory = parseInt(formData.get('inventory') as string) || 0;
  const imageFile = formData.get('image') as File | null;
  const currentImage = formData.get('currentImage') as string | null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  let imageUrl = currentImage || undefined;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadProductImage(imageFile);
  }

  // Get current product to know existing Stripe IDs
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { stripeProductId: true },
  });

  // Sync to Stripe (new price is always created)
  const { stripeProductId, stripePriceId } = await syncToStripe(
    name,
    description,
    imageUrl,
    price,
    existingProduct?.stripeProductId || undefined
  );

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      category,
      inventory,
      image: imageUrl,
      featured,
      active,
      stripeProductId,
      stripePriceId,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/shop');
}

async function deleteProduct(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin');
}

async function toggleProductActive(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const currentActive = formData.get('active') === 'true';

  await prisma.product.update({
    where: { id },
    data: { active: !currentActive },
  });

  revalidatePath('/admin');
}

export default async function AdminProductsSection() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      priceCurrency: true,
      image: true,
      category: true,
      inventory: true,
      featured: true,
      active: true,
      sortOrder: true,
      stripeProductId: true,
      stripePriceId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Products</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} • Shop catalog
          </p>
        </div>
      </div>

      <AdminProductTable
        products={products}
        onCreate={createProduct}
        onUpdate={updateProduct}
        onDelete={deleteProduct}
        onToggleActive={toggleProductActive}
      />
    </div>
  );
}
