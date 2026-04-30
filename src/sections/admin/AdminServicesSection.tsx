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

// ====================== SERVER ACTIONS - CATEGORIES ======================
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
  // Unassign services from this category
  await prisma.service.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  });
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin');
}

// ====================== SERVER ACTIONS - ADDONS ======================
async function createAddon(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const price = parseInt(formData.get('price') as string);
  const description = (formData.get('description') as string) || undefined;

  await prisma.addon.create({
    data: {
      name,
      price,
      description,
      active: true,
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
  });

  // Group services by category for display
  const servicesByCategory = categories.map(cat => ({
    ...cat,
    services: services.filter(s => s.categoryId === cat.id),
  }));

  // Services without category
  const uncategorizedServices = services.filter(s => !s.categoryId);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* SERVICES SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif text-emerald-950">Services</h1>
            <p className="text-emerald-600 text-sm mt-1">
              {services.length} service{services.length !== 1 ? 's' : ''} • Deposit + full price + hair requirements
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

      {/* CATEGORIES SECTION */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-emerald-950">Service Categories</h2>
            <p className="text-sm text-emerald-600">e.g. Stitch Braids, Knotless, Cornrows • Services appear under selected category on booking page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Category Form */}
          <div className="border border-emerald-200 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Create New Category</h3>
            <form action={createCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Stitch Braids"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-medium"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Existing Categories */}
          <div>
            <h3 className="font-medium mb-4">Existing Categories ({categories.length})</h3>
            {categories.length > 0 ? (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between bg-emerald-50 px-5 py-4 rounded-2xl">
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-emerald-600">{cat._count.services} services</p>
                    </div>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={(e) => {
                          if (!confirm(`Delete category "${cat.name}"? Services will become uncategorized.`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No categories yet. Create one above.</p>
            )}
          </div>
        </div>
      </div>

      {/* ADDONS SECTION */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-serif text-emerald-950">Add-ons</h2>
            <p className="text-sm text-emerald-600">e.g. Beads, Extra Packs, Hair Treatment • Customers can select multiple on booking page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Addon Form */}
          <div className="border border-emerald-200 rounded-2xl p-6">
            <h3 className="font-medium mb-4">Create New Add-on</h3>
            <form action={createAddon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Addon Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. 3 Packs of Beads"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price (CAD)</label>
                <input
                  type="number"
                  name="price"
                  placeholder="1500"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Enter in cents (e.g. 1500 = $15.00)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  name="description"
                  placeholder="Extra beads for styling"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-medium"
              >
                Create Add-on
              </button>
            </form>
          </div>

          {/* Existing Addons */}
          <div>
            <h3 className="font-medium mb-4">Available Add-ons ({addons.length})</h3>
            {addons.length > 0 ? (
              <div className="space-y-3">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between bg-emerald-50 px-5 py-4 rounded-2xl">
                    <div>
                      <p className="font-medium">{addon.name}</p>
                      <p className="text-sm text-emerald-600">
                        ${(addon.price / 100).toFixed(2)} CAD
                      </p>
                      {addon.description && (
                        <p className="text-xs text-gray-500">{addon.description}</p>
                      )}
                    </div>
                    <form action={deleteAddon}>
                      <input type="hidden" name="id" value={addon.id} />
                      <button
                        type="submit"
                        className="text-red-500 hover:text-red-700 text-sm"
                        onClick={(e) => {
                          if (!confirm(`Delete add-on "${addon.name}"?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No add-ons yet. Create one above.</p>
            )}
          </div>
        </div>
      </div>

      {/* CATEGORY PREVIEW */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8">
        <h2 className="text-2xl font-serif text-emerald-950 mb-6">Category Preview (How it appears on Booking Page)</h2>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesByCategory.map((cat) => {
              const firstServiceImage = cat.services[0]?.image;
              return (
                <div key={cat.id} className="border border-emerald-200 rounded-3xl overflow-hidden">
                  <div className="h-48 bg-emerald-100 relative">
                    {firstServiceImage ? (
                      <img src={firstServiceImage} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-emerald-400">
                        No image yet
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                    <p className="text-sm text-emerald-600">{cat.services.length} services available</p>
                  </div>
                </div>
              );
            })}
            
            {uncategorizedServices.length > 0 && (
              <div className="border border-gray-300 rounded-3xl overflow-hidden">
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                  Uncategorized
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">Other Services</h3>
                  <p className="text-sm text-gray-600">{uncategorizedServices.length} services</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-12 text-gray-500">Create categories above to see preview</p>
        )}
      </div>
    </div>
  );
}
