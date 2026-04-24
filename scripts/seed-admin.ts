// scripts/seed-admin.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const REQUIRED_TABLES = [
  "User",
  "LocalUser",
  "Product",
  "Service",
  "GalleryItem",
  "StaffProfile",
  "StaffWorkingHour",
  "StaffTimeOff",
  "ServiceStaffAssignment",
  "Order",
  "OrderItem",
  "Booking",
  "HeroImage",
  "Subscriber",
  "NewsletterCampaign",
  "NewsletterRecipient",
  "ContactMessage",
  "ContactReply",
] as const;

async function verifyTables() {
  const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `;

  const tableNames = new Set(tables.map((row) => row.table_name));

  const missing = REQUIRED_TABLES.filter((name) => !tableNames.has(name));

  if (missing.length > 0) {
    throw new Error(
      `Database setup incomplete. Missing tables: ${missing.join(", ")}`,
    );
  }

  console.log("✅ All required tables verified");
}

async function bootstrapAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || "Admin";
  const username =
    process.env.INITIAL_ADMIN_USERNAME?.trim().toLowerCase() || "admin";

  if (!email || !password) {
    console.log(
      "⏭️ Skipping admin bootstrap: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD missing",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.localUser.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    await prisma.localUser.update({
      where: { id: existing.id },
      data: {
        username,
        email,
        displayName: name,
        passwordHash,
        role: "super_admin",
        isActive: true,
        isBlocked: false,
      },
    });

    console.log(`✅ Admin user updated: ${email}`);
    return;
  }

  await prisma.localUser.create({
    data: {
      username,
      email,
      displayName: name,
      passwordHash,
      role: "super_admin",
      isActive: true,
      isBlocked: false,
    },
  });

  console.log(`✅ Default admin user created: ${email}`);
}

async function main() {
  try {
    console.log("🚀 Starting admin seed...");

    await verifyTables();
    await bootstrapAdmin();

    console.log("🎉 Admin seed completed successfully!");
  } catch (error) {
    console.error("❌ Admin seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
