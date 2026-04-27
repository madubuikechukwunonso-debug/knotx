// src/sections/admin/AdminUsersSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminUserTable from './AdminUserTable';

const prisma = new PrismaClient();

async function getUsers() {
  return prisma.localUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      isBlocked: true,
      blockedReason: true,
      lastSignInAt: true,
      createdAt: true,
    },
  });
}

// Server Actions
async function createUser(formData: FormData) {
  'use server';

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const displayName = (formData.get('displayName') as string) || undefined;
  const role = formData.get('role') as string;
  const isActive = formData.get('isActive') === 'on';
  const password = formData.get('password') as string; // In production: hash with bcrypt!

  await prisma.localUser.create({
    data: {
      username,
      email,
      displayName,
      passwordHash: password ? `placeholder-${Date.now()}` : 'needs-hash-in-prod', // TODO: replace with real bcrypt hash
      role,
      isActive,
      isBlocked: false,
    },
  });

  revalidatePath('/admin/users');
}

async function updateUser(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);
  const displayName = (formData.get('displayName') as string) || undefined;
  const role = formData.get('role') as string;
  const isActive = formData.get('isActive') === 'on';
  const isBlocked = formData.get('isBlocked') === 'on';
  const blockedReason = (formData.get('blockedReason') as string) || undefined;

  await prisma.localUser.update({
    where: { id },
    data: {
      displayName,
      role,
      isActive,
      isBlocked,
      blockedReason,
      updatedAt: new Date(),
    },
  });

  revalidatePath('/admin/users');
}

async function deleteUser(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.localUser.delete({ where: { id } });
  revalidatePath('/admin/users');
}

async function toggleActive(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const user = await prisma.localUser.findUnique({ where: { id } });
  if (!user) return;
  await prisma.localUser.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath('/admin/users');
}

export default async function AdminUsersSection() {
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Users</h1>
          <p className="text-black/60">Manage customer accounts and permissions</p>
        </div>
        <AdminUserTable
          users={users}
          onCreate={createUser}
          onUpdate={updateUser}
          onDelete={deleteUser}
          onToggleActive={toggleActive}
        />
      </div>
    </div>
  );
}
