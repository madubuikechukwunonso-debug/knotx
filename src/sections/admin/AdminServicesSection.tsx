// src/sections/admin/AdminServicesSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import AdminServiceTable from './AdminServiceTable'; // we'll create this next (client part)

const prisma = new PrismaClient();

async function getServices() {
  return prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

// Server Actions
async function createService(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const durationMinutes = parseInt(formData.get('durationMinutes') as string);
  const image = (formData.get('image') as string) || null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  await prisma.service.create({
    data: {
      name,
      slug,
      description,
      price,
      durationMinutes,
      image,
      featured,
      active,
      sortOrder: 0, // you can change later in edit
    },
  });

  revalidatePath('/admin/services');
}

async function updateService(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = parseInt(formData.get('price') as string);
  const durationMinutes = parseInt(formData.get('durationMinutes') as string);
  const image = (formData.get('image') as string) || null;
  const featured = formData.get('featured') === 'on';
  const active = formData.get('active') === 'on';
  const sortOrder = parseInt(formData.get('sortOrder') as string);

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  await prisma.service.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      price,
      durationMinutes,
      image,
      featured,
      active,
      sortOrder,
    },
  });

  revalidatePath('/admin/services');
}

async function deleteService(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.service.delete({ where: { id } });
  revalidatePath('/admin/services');
}

async function toggleActive(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const active = formData.get('active') === 'true';
  await prisma.service.update({
    where: { id },
    data: { active: !active },
  });
  revalidatePath('/admin/services');
}

export default async function AdminServicesSection() {
  const services = await getServices();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Services</h1>
          <p className="text-black/60">Manage your booking services and pricing</p>
        </div>
        <AdminServiceTable
          services={services}
          onCreate={createService}
          onUpdate={updateService}
          onDelete={deleteService}
          onToggleActive={toggleActive}
        />
      </div>
    </div>
  );
}
