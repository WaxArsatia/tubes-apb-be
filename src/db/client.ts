import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/common/config/env";
import * as schema from "@/db/schema";

const sql = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
});

export const db = drizzle(sql, { schema });

export const closeDatabaseConnection = async () => {
  await sql.end({ timeout: 5 });
};
