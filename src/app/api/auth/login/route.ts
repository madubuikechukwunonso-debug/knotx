import { NextResponse } from 'next/server';
import { authenticateCredentials, bootstrapInitialAdmin, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await bootstrapInitialAdmin();
    const body = await request.json();
    const user = await authenticateCredentials(String(body.identifier || '').trim(), String(body.password || '').trim());
    if (!user) return NextResponse.json({ ok: false, message: 'Invalid credentials' }, { status: 401 });
    await setSessionCookie({ userId: user.id, userType: user.userType, role: user.role, email: user.email, name: user.name });
    return NextResponse.json({ ok: true, user });
  } catch (error: any) {
    console.error('POST /api/auth/login failed', error);
    return NextResponse.json({ ok: false, message: error?.message || 'Login failed' }, { status: 500 });
  }
}
