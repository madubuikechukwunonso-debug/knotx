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
  const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;
  const inventory = parseInt(formData.get('inventory') as string) || 0;
  const imageFile = formData.get('image') as File | null;
  const featured = formData.get('featured') === 'on';

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) imageUrl = await uploadProductImage(imageFile);

  const { stripeProductId, stripePriceId } = await syncToStripe(name, description, imageUrl, price);

  await prisma.product.create({
    data: {
      name, slug, description, price, category: 'general',
      categoryId: categoryId || undefined,
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
  const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;
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
      categoryId: categoryId || undefined,
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

// ====================== CATEGORIES ======================
async function createCategory(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  await prisma.category.create({ data: { name, slug } });
  revalidatePath('/admin');
}

async function deleteCategory(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin');
}

export default async function AdminProductsSection() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, slug: true, description: true, price: true,
      priceCurrency: true, image: true, category: true,
      categoryId: true,
      categoryRel: { select: { id: true, name: true } },
      inventory: true, featured: true, active: true, sortOrder: true,
      stripeProductId: true, stripePriceId: true, createdAt: true, updatedAt: true,
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const productsByCategory = categories.map(cat => ({
    ...cat,
    products: products.filter(p => p.categoryId === cat.id),
  }));

  const uncategorizedProducts = products.filter(p => !p.categoryId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
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
          categories={categories}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onToggleActive={toggleProductActive}
        />
      </div>

      {/* CATEGORIES SECTION - MODERN DESIGN */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif text-emerald-950">Shop Categories</h2>
              <p className="text-sm text-emerald-600 mt-1">Organize your shop products beautifully</p>
            </div>
            <div className="text-xs px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium self-start sm:self-auto">
              {categories.length} Categories
            </div>
          </div>
        </div>

        {/* CREATE CATEGORY FORM - MOBILE FRIENDLY */}
        <form action={createCategory} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                name="name"
                placeholder="Category name (e.g., Hair Accessories)"
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 text-base focus:outline-none focus:border-emerald-500 placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-4 rounded-2xl font-medium text-base transition-all active:scale-[0.985]"
            >
              Create Category
            </button>
          </div>
        </form>

        {/* EXISTING CATEGORIES - MODERN CARDS */}
        <div>
          <h3 className="font-semibold text-lg mb-4 text-emerald-950">Your Categories</h3>
          
          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="group bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-3xl p-6 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 active:scale-[0.985]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                      📁
                    </div>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-400 hover:text-red-600 p-2 -mr-2 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.7 12.3a1 1 0 01-1 .7H6.7a1 1 0 01-1-.7L5 7m5 4v6m4-6v6m1-10V6a2 2 0 00-2-2H9a2 2 0 00-2 2v1" />
                        </svg>
                      </button>
                    </form>
                  </div>
                  
                  <h4 className="font-semibold text-xl text-emerald-950 mb-2 pr-8">{cat.name}</h4>
                  
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {cat._count.products} products
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-emerald-50 rounded-3xl">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-emerald-950 font-medium mb-1">No categories yet</p>
              <p className="text-sm text-emerald-600">Create your first category above</p>
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY PREVIEW - MODERN MOBILE DESIGN */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-emerald-950">Shop Preview</h2>
            <p className="text-sm text-emerald-600 mt-1">How customers see your categories</p>
          </div>
          <div className="text-xs px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-medium self-start sm:self-auto">
            Live Preview
          </div>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productsByCategory.map((cat) => {
              const firstProductImage = cat.products[0]?.image;
              const productCount = cat.products.length;
              
              return (
                <div 
                  key={cat.id} 
                  className="group relative bg-white border border-emerald-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 active:scale-[0.985]"
                >
                  {/* IMAGE SECTION */}
                  <div className="relative h-56 sm:h-64 bg-gradient-to-br from-emerald-100 to-emerald-200 overflow-hidden">
                    {firstProductImage ? (
                      <img 
                        src={firstProductImage} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-3 opacity-50">🛍️</div>
                          <p className="text-emerald-600 text-sm font-medium">No products yet</p>
                        </div>
                      </div>
                    )}
                    
                    {/* OVERLAY BADGE */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg">
                      <span className="text-emerald-700 text-sm font-semibold">
                        {productCount} {productCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT SECTION */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-xl text-emerald-950 leading-tight pr-2">
                        {cat.name}
                      </h3>
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600">→</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-emerald-600 leading-relaxed">
                      Tap to explore {cat.name.toLowerCase()} collection
                    </p>
                  </div>

                  {/* HOVER EFFECT BAR */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              );
            })}
            
            {/* UNCATEGORIZED CARD */}
            {uncategorizedProducts.length > 0 && (
              <div className="group relative bg-white border border-gray-200 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-56 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-3 opacity-40">📦</div>
                    <p className="text-gray-500 text-sm font-medium">Uncategorized</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl text-gray-800 mb-2">Other Products</h3>
                  <p className="text-sm text-gray-600">
                    {uncategorizedProducts.length} products need categorization
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-emerald-50 rounded-3xl">
            <div className="text-7xl mb-6">🎨</div>
            <h3 className="text-xl font-semibold text-emerald-950 mb-2">Ready to organize your shop?</h3>
            <p className="text-emerald-600 max-w-md mx-auto">Create categories above and watch your products come to life in beautiful collections</p>
          </div>
        )}
      </div>
    </div>
  );
}
