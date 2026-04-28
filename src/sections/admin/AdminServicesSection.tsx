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

// ====================== SERVER ACTIONS ======================
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

export default async function AdminServicesSection() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      depositAmount: true,        // ← Required
      durationMinutes: true,
      image: true,
      featured: true,
      active: true,
      sortOrder: true,            // ← Fixed: Now included
      stripeProductId: true,
      stripePriceId: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Services</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''} • Deposit + full price
          </p>
        </div>
      </div>

      <AdminServiceTable
        services={services}
        onCreate={createService}
        onUpdate={updateService}
        onDelete={deleteService}
        onToggleActive={toggleServiceActive}
      />
    </div>
  );
}
