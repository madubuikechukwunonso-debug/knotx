import { NextRequest, NextResponse } from "next/server";
import { registerCredentials } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import type { SessionRole } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const user = await registerCredentials({
      username: body.username,
      email: body.email,
      password: body.password,
      displayName: body.displayName,
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
    const status = /already/i.test(error?.message || "") ? 409 : 500;

    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Registration failed",
      },
      { status },
    );
  }
}
