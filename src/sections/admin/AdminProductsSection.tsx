// src/sections/admin/AdminProductsSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminProductTable from './AdminProductTable';
import { put } from '@vercel/blob';
import { getStripe } from '@/lib/stripe';

const prisma = new PrismaClient();

// ====================== IMAGE UPLOAD ======================
async function uploadProductImage(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;
  const blob = await put(`products/${filename}`, file, { access: 'public' });
  return blob.url;
}

// ====================== SLUG GENERATOR ======================
function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

// ====================== STRIPE SYNC ======================
async function syncToStripe(name: string, description: string | undefined, imageUrl: string | undefined, priceInCents: number, existingStripeProductId?: string | null) {
  const stripe = getStripe();
  let stripeProductId = existingStripeProductId;

  if (!stripeProductId) {
    const product = await stripe.products.create({ name, description: description || undefined, images: imageUrl ? [imageUrl] : undefined, active: true });
    stripeProductId = product.id;
  } else {
    await stripe.products.update(stripeProductId, { name, description: description || undefined, images: imageUrl ? [imageUrl] : undefined });
  }

  const price = await stripe.prices.create({ product: stripeProductId, unit_amount: priceInCents, currency: 'cad' });
  return { stripeProductId, stripePriceId: price.id };
}

// ====================== SERVER ACTIONS ======================
async function createProduct(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || generateSlug(name);
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const productCategoryId = formData.get('productCategoryId') ? parseInt(formData.get('productCategoryId') as string) : null;
  const inventory = parseInt(formData.get('inventory') as string) || 0;
  const imageFile = formData.get('image') as File | null;
  const featured = formData.get('featured') === 'on';

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) imageUrl = await uploadProductImage(imageFile);

  const { stripeProductId, stripePriceId } = await syncToStripe(name, description, imageUrl, price);

  await prisma.product.create({
    data: {
      name, slug, description, price, category: 'general',
      productCategoryId: productCategoryId || undefined,
      inventory, image: imageUrl, featured, active: true,
      stripeProductId, stripePriceId,
    },
  });
  revalidatePath('/admin');
  revalidatePath('/shop');
}

async function updateProduct(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || generateSlug(name);
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const productCategoryId = formData.get('productCategoryId') ? parseInt(formData.get('productCategoryId') as string) : null;
  const inventory = parseInt(formData.get('inventory') as string) || 0;
  const imageFile = formData.get('image') as File | null;
  const currentImage = formData.get('currentImage') as string | null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  let imageUrl = currentImage || undefined;
  if (imageFile && imageFile.size > 0) imageUrl = await uploadProductImage(imageFile);

  const existingProduct = await prisma.product.findUnique({ where: { id }, select: { stripeProductId: true } });
  const { stripeProductId, stripePriceId } = await syncToStripe(name, description, imageUrl, price, existingProduct?.stripeProductId || undefined);

  await prisma.product.update({
    where: { id },
    data: {
      name, slug, description, price, category: 'general',
      productCategoryId: productCategoryId || undefined,
      inventory, image: imageUrl, featured, active,
      stripeProductId, stripePriceId,
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
  await prisma.product.update({ where: { id }, data: { active: !currentActive } });
  revalidatePath('/admin');
}

// ====================== PRODUCT CATEGORIES ======================
async function createProductCategory(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  await prisma.productCategory.create({ data: { name, slug } });
  revalidatePath('/admin');
}

async function deleteProductCategory(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.product.updateMany({ where: { productCategoryId: id }, data: { productCategoryId: null } });
  await prisma.productCategory.delete({ where: { id } });
  revalidatePath('/admin');
}

export default async function AdminProductsSection() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, slug: true, description: true, price: true,
      priceCurrency: true, image: true, category: true,
      productCategoryId: true,
      productCategory: { select: { id: true, name: true } },
      inventory: true, featured: true, active: true, sortOrder: true,
      stripeProductId: true, stripePriceId: true, createdAt: true, updatedAt: true,
    },
  });

  const productCategories = await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const productsByCategory = productCategories.map(cat => ({
    ...cat,
    products: products.filter(p => p.productCategoryId === cat.id),
  }));

  const uncategorizedProducts = products.filter(p => !p.productCategoryId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* PRODUCTS TABLE */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-emerald-950">Products</h1>
            <p className="text-emerald-600 text-sm mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} • Shop catalog
            </p>
          </div>
        </div>

        <AdminProductTable
          products={products}
          productCategories={productCategories}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onToggleActive={toggleProductActive}
        />
      </div>

      {/* PRODUCT CATEGORIES */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-serif text-emerald-950">Shop Categories</h2>
          <p className="text-sm text-emerald-600">Categories for shop products only (separate from booking services)</p>
        </div>

        <form action={createProductCategory} className="mb-8 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">New Category Name</label>
            <input
              type="text"
              name="name"
              placeholder="Hair Accessories"
              className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
          >
            Create Category
          </button>
        </form>

        <div>
          <h3 className="font-semibold mb-3 text-lg">Existing ({productCategories.length})</h3>
          {productCategories.length > 0 ? (
            <div className="space-y-3">
              {productCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between bg-emerald-50 px-4 py-4 rounded-2xl">
                  <div className="min-w-0 pr-3">
                    <p className="font-medium truncate">{cat.name}</p>
                    <p className="text-xs text-emerald-600">{cat._count.products} products</p>
                  </div>
                  <form action={deleteProductCategory} className="flex-shrink-0">
                    <input type="hidden" name="id" value={cat.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 active:text-red-600 text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors">
                      Delete
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-4">No shop categories yet. Create one above!</p>
          )}
        </div>
      </div>

      {/* SHOP CATEGORY PREVIEW */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-emerald-950">Shop Category Preview</h2>
            <p className="text-sm text-emerald-600">How products appear grouped in the shop</p>
          </div>
          <div className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
            {productCategories.length} Categories
          </div>
        </div>
        
        {productCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsByCategory.map((cat) => {
              const firstProductImage = cat.products[0]?.image;
              return (
                <div key={cat.id} className="border border-emerald-200 rounded-3xl overflow-hidden group">
                  <div className="h-44 bg-emerald-100 relative">
                    {firstProductImage ? (
                      <img src={firstProductImage} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-emerald-400 text-sm">No image yet</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-emerald-700">
                      {cat.products.length} products
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-emerald-600 mt-1">Click to view all {cat.name.toLowerCase()}</p>
                  </div>
                </div>
              );
            })}
            
            {uncategorizedProducts.length > 0 && (
              <div className="border border-gray-300 rounded-3xl overflow-hidden">
                <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Uncategorized</div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">Other Products</h3>
                  <p className="text-sm text-gray-600">{uncategorizedProducts.length} products</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-2">No categories yet</p>
            <p className="text-sm text-gray-400">Create a category above to group products in the shop</p>
          </div>
        )}
      </div>
    </div>
  );
}
