// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          orderBy: { sentAt: "asc" },
          select: { id: true, body: true, sentAt: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: body.name || "Website Visitor",
        email: body.email || "visitor@example.com",
        subject: body.subject || "Support Request",
        message: body.message,
        status: "new",
      },
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
