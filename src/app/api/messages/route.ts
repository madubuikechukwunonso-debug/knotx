// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ messages: [] }, { status: 401 });
    }

    // Get the logged-in user's email so we can show them their own inquiries
    const user = await prisma.localUser.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user?.email) {
      return NextResponse.json({ messages: [] });
    }

    const messages = await prisma.contactMessage.findMany({
      where: {
        email: user.email.toLowerCase(),
      },
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
    console.error("Error fetching messages:", error);
    return NextResponse.json({ messages: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, name, email, subject } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name && typeof name === "string" ? name.trim() : "Website Visitor",
        email: email.trim().toLowerCase(),
        subject: subject && typeof subject === "string" ? subject.trim() : null,
        message: message.trim(),
        status: "new",
        read: false,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: newMessage 
    });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
