import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/permissions';

export async function GET() {
  await requireAdmin();
  return NextResponse.json({ ok: true, section: 'newsletter', items: [] });
}
