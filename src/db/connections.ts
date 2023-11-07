import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { env } from "~/env/server";

const connection = connect({
  url: DATABASE_URL,
});

export const db = drizzle(connection, {
  logger: true,
});
