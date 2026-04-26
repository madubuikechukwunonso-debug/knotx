// src/app/api/profile/shipping/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,
      shippingCountry,
    } = body;

    // Only update the shipping fields
    const updatedUser = await prisma.localUser.update({
      where: { id: session.userId },
      data: {
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shipping address saved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Shipping address update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save shipping address" },
      { status: 500 }
    );
  }
}
