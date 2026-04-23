import { NextRequest, NextResponse } from "next/server";
import { loginCredentials } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import type { SessionRole } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await loginCredentials({
      identifier: body.identifier,
      password: body.password,
    });

    await setSessionCookie({
      userId: user.id,
      userType: user.userType,
      role: user.role as SessionRole,
      email: user.email,
      name: user.name,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error: any) {
    const status = /invalid|unauthorized/i.test(error?.message || "")
      ? 401
      : 500;

    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Login failed",
      },
      { status },
    );
  }
}
