import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "../../db/schema";
import * as relations from "../../db/relations";
import { env } from "./env";

const fullSchema = { ...schema, ...relations };

const globalForDb = globalThis as typeof globalThis & {
  __knotx_pool?: ReturnType<typeof createPool>;
  __knotx_db?: ReturnType<typeof drizzle<typeof fullSchema>>;
};

export function db() {
  if (!globalForDb.__knotx_pool) {
    globalForDb.__knotx_pool = createPool({
      uri: env.databaseUrl,
      connectionLimit: 10,
      enableKeepAlive: true,
    });
  }

  if (!globalForDb.__knotx_db) {
    globalForDb.__knotx_db = drizzle(globalForDb.__knotx_pool, {
      schema: fullSchema,
      mode: "default",
    });
  }

  return globalForDb.__knotx_db;
}
