import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../../db/schema';
import * as relations from '../../db/relations';
import { env } from './env';

const fullSchema = { ...schema, ...relations };
let dbInstance: ReturnType<typeof drizzle<typeof fullSchema>> | null = null;

export function db() {
  if (!dbInstance) {
    const pool = mysql.createPool({
      uri: env.databaseUrl,
      connectionLimit: 10,
      enableKeepAlive: true,
    });
    dbInstance = drizzle(pool, { schema: fullSchema });
  }
  return dbInstance;
}
