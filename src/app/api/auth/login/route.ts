import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { ok: false, message: "Identifier and password are required" },
        { status: 400 },
      );
    }

    const result = await loginUser(identifier, password);

    await setSessionCookie({
      userId: result.user.id,
      userType: "local",
      role: result.user.role as any,
      email: result.user.email,
      name: result.user.displayName || result.user.username,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || "Login failed" },
      { status: 401 },
    );
  }
}
