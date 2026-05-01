// src/sections/admin/AdminServicesSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminServiceTable from './AdminServiceTable';
import { put } from '@vercel/blob';
import { getStripe } from '@/lib/stripe';

const prisma = new PrismaClient();

// ====================== IMAGE UPLOAD ======================
async function uploadServiceImage(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;
  const blob = await put(`services/${filename}`, file, { access: 'public' });
  return blob.url;
}

// ====================== STRIPE SYNC ======================
async function syncServiceToStripe(
  name: string,
  description: string | undefined,
  imageUrl: string | undefined,
  depositAmountInCents: number,
  existingStripeProductId?: string | null
) {
  const stripe = getStripe();
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

  const price = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: depositAmountInCents,
    currency: 'cad',
  });

  return { stripeProductId, stripePriceId: price.id };
}

// ====================== SERVER ACTIONS - SERVICES ======================
async function createService(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-');
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const depositAmount = parseInt(formData.get('depositAmount') as string) || 0;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string);
  const imageFile = formData.get('image') as File | null;
  const featured = formData.get('featured') === 'on';
  const hairRequirement = (formData.get('hairRequirement') as string) || undefined;
  const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;

  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadServiceImage(imageFile);
  }

  const { stripeProductId, stripePriceId } = await syncServiceToStripe(
    name,
    description,
    imageUrl,
    depositAmount
  );

  await prisma.service.create({
    data: {
      name,
      slug,
      description,
      price,
      depositAmount,
      durationMinutes,
      image: imageUrl,
      featured,
      active: true,
      stripeProductId,
      stripePriceId,
      hairRequirement,
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath('/admin');
}

async function updateService(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  let slug = (formData.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-');
  const description = (formData.get('description') as string) || undefined;
  const price = parseInt(formData.get('price') as string);
  const depositAmount = parseInt(formData.get('depositAmount') as string) || 0;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string);
  const imageFile = formData.get('image') as File | null;
  const currentImage = formData.get('currentImage') as string | null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';
  const hairRequirement = (formData.get('hairRequirement') as string) || undefined;
  const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;

  let imageUrl = currentImage || undefined;
  if (imageFile && imageFile.size > 0) {
    imageUrl = await uploadServiceImage(imageFile);
  }

  const existing = await prisma.service.findUnique({
    where: { id },
    select: { stripeProductId: true },
  });

  const { stripeProductId, stripePriceId } = await syncServiceToStripe(
    name,
    description,
    imageUrl,
    depositAmount,
    existing?.stripeProductId
  );

  await prisma.service.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      depositAmount,
      durationMinutes,
      image: imageUrl,
      featured,
      active,
      stripeProductId,
      stripePriceId,
      hairRequirement,
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath('/admin');
}

async function deleteService(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.service.delete({ where: { id } });
  revalidatePath('/admin');
}

async function toggleServiceActive(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const current = await prisma.service.findUnique({ where: { id }, select: { active: true } });
  await prisma.service.update({
    where: { id },
    data: { active: !current?.active },
  });
  revalidatePath('/admin');
}

// ====================== CATEGORIES ======================
async function createCategory(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  await prisma.category.create({
    data: { name, slug },
  });
  revalidatePath('/admin');
}

async function deleteCategory(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.service.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin');
}

// ====================== ADDONS ======================
async function createAddon(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const price = parseInt(formData.get('price') as string);
  const description = (formData.get('description') as string) || undefined;
  const categoryId = formData.get('categoryId') ? parseInt(formData.get('categoryId') as string) : null;

  await prisma.addon.create({
    data: {
      name,
      price,
      description,
      active: true,
      categoryId: categoryId || undefined,
    },
  });
  revalidatePath('/admin');
}

async function deleteAddon(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.addon.delete({ where: { id } });
  revalidatePath('/admin');
}

export default async function AdminServicesSection() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      depositAmount: true,
      durationMinutes: true,
      image: true,
      featured: true,
      active: true,
      sortOrder: true,
      stripeProductId: true,
      stripePriceId: true,
      hairRequirement: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { services: true } },
    },
  });

  const addons = await prisma.addon.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    include: {
      category: { select: { name: true } },
    },
  });

  const servicesByCategory = categories.map(cat => ({
    ...cat,
    services: services.filter(s => s.categoryId === cat.id),
  }));

  const uncategorizedServices = services.filter(s => !s.categoryId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* SERVICES SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-emerald-950">Services</h1>
            <p className="text-emerald-600 text-sm mt-1">
              {services.length} service{services.length !== 1 ? 's' : ''} • Grouped by category for shop
            </p>
          </div>
        </div>

        <AdminServiceTable
          services={services}
          categories={categories}
          onCreate={createService}
          onUpdate={updateService}
          onDelete={deleteService}
          onToggleActive={toggleServiceActive}
        />
      </div>

      {/* CATEGORIES + ADDONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CATEGORIES - NOW WITH INLINE CREATE */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-emerald-950">Categories</h2>
            <p className="text-sm text-emerald-600">Group services for shop display • Create new categories in the modal</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Existing ({categories.length})</h3>
            {categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between bg-emerald-50 px-4 py-4 rounded-2xl">
                    <div className="min-w-0 pr-3">
                      <p className="font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-emerald-600">{cat._count.services} services</p>
                    </div>
                    <form action={deleteCategory} className="flex-shrink-0">
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 active:text-red-600 text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No categories yet. Create one in the service modal.</p>
            )}
          </div>
        </div>

        {/* ADDONS WITH CATEGORY ASSOCIATION */}
        <div className="bg-white rounded-3xl border border-emerald-100 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-serif text-emerald-950">Add-ons</h2>
            <p className="text-sm text-emerald-600">Beads, Extra Packs, Treatments • Linked to categories</p>
          </div>

          <form action={createAddon} className="mb-8 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Addon Name</label>
              <input
                type="text"
                name="name"
                placeholder="3 Packs of Beads"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Price (cents)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="1500"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category (optional)</label>
                <select
                  name="categoryId"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <input
                type="text"
                name="description"
                placeholder="Extra styling beads"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-3.5 rounded-2xl font-medium text-base transition-colors"
            >
              Create Add-on
            </button>
          </form>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Available ({addons.length})</h3>
            {addons.length > 0 ? (
              <div className="space-y-3">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between bg-emerald-50 px-4 py-4 rounded-2xl">
                    <div className="min-w-0 pr-3">
                      <p className="font-medium truncate">{addon.name}</p>
                      <p className="text-sm text-emerald-600 font-medium">
                        ${(addon.price / 100).toFixed(2)}
                        {addon.category && ` • ${addon.category.name}`}
                      </p>
                    </div>
                    <form action={deleteAddon} className="flex-shrink-0">
                      <input type="hidden" name="id" value={addon.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 active:text-red-600 text-sm font-medium px-3 py-1.5 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No add-ons yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY PREVIEW - SHOP GROUPING */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-emerald-950">Shop Category Preview</h2>
            <p className="text-sm text-emerald-600">How services will appear grouped in the shop</p>
          </div>
          <div className="text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full">
            {categories.length} Categories
          </div>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesByCategory.map((cat) => {
              const firstServiceImage = cat.services[0]?.image;
              return (
                <div key={cat.id} className="border border-emerald-200 rounded-3xl overflow-hidden group">
                  <div className="h-44 bg-emerald-100 relative">
                    {firstServiceImage ? (
                      <img 
                        src={firstServiceImage} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-emerald-400 text-sm">No image yet</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-emerald-700">
                      {cat.services.length} services
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-emerald-600 mt-1">Click to view all {cat.name.toLowerCase()}</p>
                  </div>
                </div>
              );
            })}
            
            {uncategorizedServices.length > 0 && (
              <div className="border border-gray-300 rounded-3xl overflow-hidden">
                <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Uncategorized</div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">Other Services</h3>
                  <p className="text-sm text-gray-600">{uncategorizedServices.length} services</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <p className="text-gray-500 mb-2">No categories yet</p>
            <p className="text-sm text-gray-400">Create a category in the service modal to group products</p>
          </div>
        )}
      </div>
    </div>
  );
}
