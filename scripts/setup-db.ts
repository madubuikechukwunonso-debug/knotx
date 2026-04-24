import "dotenv/config";
import { execSync } from "node:child_process";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import mysql from "mysql2/promise";

const REQUIRED_TABLES = [
  "users",
  "local_users",
  "products",
  "services",
  "gallery_items",
  "staff_profiles",
  "staff_working_hours",
  "staff_time_off",
  "service_staff_assignments",
  "orders",
  "order_items",
  "order_status_events",
  "bookings",
  "hero_images",
  "subscribers",
  "newsletter_campaigns",
  "newsletter_recipients",
  "contact_messages",
  "contact_replies",
] as const;

function run(command: string) {
  console.log(`\n> ${command}`);
  execSync(command, { stdio: "inherit" });
}

async function verifyTables(databaseUrl: string) {
  const pool = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 5,
    enableKeepAlive: true,
  });

  try {
    const [rows] = await pool.query("SHOW TABLES");
    const tableNames = new Set(
      (rows as Record<string, string>[]).flatMap((row) => Object.values(row)),
    );

    const missing = REQUIRED_TABLES.filter((name) => !tableNames.has(name));

    if (missing.length > 0) {
      throw new Error(
        `Database setup incomplete. Missing tables: ${missing.join(", ")}`,
      );
    }

    console.log("Verified tables:");
    for (const name of REQUIRED_TABLES) {
      console.log(`- ${name}`);
    }
  } finally {
    await pool.end();
  }
}

async function bootstrapAdmin() {
  const { db } = await import("../src/lib/db");
  const { localUsers } = await import("../db/schema");

  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const name = (process.env.INITIAL_ADMIN_NAME || "Admin").trim();
  const username = (process.env.INITIAL_ADMIN_USERNAME || "admin")
    .trim()
    .toLowerCase();

  if (!email || !password) {
    console.log(
      "Skipping admin bootstrap: missing INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD",
    );
    return;
  }

  const database = db();

  const existing = await database
    .select()
    .from(localUsers)
    .where(
      or(eq(localUsers.email, email), eq(localUsers.username, username)),
    )
    .limit(1);

  if (existing.length > 0) {
    console.log("Admin already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await database.insert(localUsers).values({
    username,
    email,
    displayName: name,
    passwordHash,
    role: "super_admin",
    isActive: 1,
    isBlocked: 0,
  });

  console.log(`Admin created: ${email}`);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  console.log("Starting database setup...");

  run("npx drizzle-kit push");
  await verifyTables(databaseUrl);
  run("npx tsx db/seed.ts");
  await bootstrapAdmin();

  console.log("\nDatabase setup complete.");
}

main().catch((error) => {
  console.error("Database setup failed:", error);
  process.exit(1);
});
