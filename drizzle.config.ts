import type { Config } from "drizzle-kit";
import { env } from "~/env/server";

export default {
  schema: "./src/db/schemas.ts",
  out: "./drizzle",
  driver: "turso",
  dbCredentials: {
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;
