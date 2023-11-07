import type { Config } from "drizzle-kit";
import { env } from "~/env/server";

export default {
  schema: "./src/db/schemas.ts",
  out: "./drizzle",
  driver: "mysql2",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
} satisfies Config;
