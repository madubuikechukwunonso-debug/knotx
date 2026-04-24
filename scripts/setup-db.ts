// setup-db.ts
import "dotenv/config";
import { execSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { prisma } from "./src/lib/prisma";

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

function run(command: string) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

async function verifyTables() {
  try {
    const tables = await prisma.$queryRaw<
      Array<{ table_name: string }>
    >`SHOW TABLES`;

    const tableNames = new Set(tables.map((row) => row.table_name));

    const missing = REQUIRED_TABLES.filter((name) => !tableNames.has(name));

    if (missing.length > 0) {
      throw new Error(
        `Database setup incomplete. Missing tables: ${missing.join(", ")}`
      );
    }

    console.log("✅ All required tables verified:");
    REQUIRED_TABLES.forEach((name) => console.log(`   - ${name}`));
  } catch (error) {
    console.error("Table verification failed:", error);
    throw error;
  }
}

async function bootstrapAdmin() {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = (process.env.INITIAL_ADMIN_NAME || "Admin").trim();
  const username = (process.env.INITIAL_ADMIN_USERNAME || "admin")
    .trim()
    .toLowerCase();

  if (!email || !password) {
    console.log("⏭️ Skipping admin bootstrap: missing INITIAL_ADMIN_* variables");
    return;
  }

  const existing = await prisma.localUser.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    console.log("✅ Admin user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

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
  console.log("🚀 Starting database setup with Prisma...\n");

  try {
    // 1. Push the Prisma schema to the database
    run("npx prisma db push");

    // 2. Verify all tables exist
    await verifyTables();

    // 3. Run seed script (if you have one)
    // run("npx tsx db/seed.ts");   // Uncomment if you have a seed file

    // 4. Bootstrap the initial admin user
    await bootstrapAdmin();

    console.log("\n🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("\n❌ Database setup failed:", error);
    process.exit(1);
  }
}

main();
