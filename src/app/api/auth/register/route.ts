// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, displayName } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email and password are required" },
        { status: 400 }
      );
    }

    const result = await registerUser({
      username,
      email,
      password,
      displayName,
    });

    return NextResponse.json({
      success: true,
      token: result.token,
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        role: result.user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Registration failed" },
      { status: 400 }
    );
  }
}
