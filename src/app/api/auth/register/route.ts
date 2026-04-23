import { NextResponse } from 'next/server';
import { registerCredentials, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await registerCredentials({ username: body.username, email: body.email, password: body.password, displayName: body.displayName });
    await setSessionCookie({ userId: user.id, userType: user.userType, role: user.role, email: user.email, name: user.name });
    return NextResponse.json({ ok: true, user });
  } catch (error: any) {
    const status = /already/.test(error?.message || '') ? 409 : 500;
    return NextResponse.json({ ok: false, message: error?.message || 'Registration failed' }, { status });
  }
}
