import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";
import { env } from "./env";

const fullSchema = { ...schema, ...relations };

let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function db() {
  if (!dbInstance) {
    pool = createPool({
      uri: env.DATABASE_URL,
      connectionLimit: 10,
      enableKeepAlive: true,
    });

    dbInstance = drizzle(pool, {
      schema: fullSchema,
      mode: "default",
    });
  }

  return dbInstance;
}
