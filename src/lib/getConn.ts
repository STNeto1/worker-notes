import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

declare global {
  interface Env {
    DATABASE_URL: string;
  }
}

const getConnectionUrl = (env: Env) => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error("DATABASE_URL is not set");
};

export const getConnection = (env: Env) => {
  const connection = connect({
    url: getConnectionUrl(env),
  });

  return drizzle(connection, {
    logger: true,
  });
};
