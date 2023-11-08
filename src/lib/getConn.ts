import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

declare global {
  interface Env {
    DATABASE_URL: string;
  }
}

export const getEnvValue = (
  env: Env | null,
  key: keyof Env = "DATABASE_URL",
): string => {
  if (!!env && env[key]) {
    return env[key] as string;
  }

  if (process.env[key]) {
    return process.env[key] as string;
  }

  throw new Error(`Missing environment variable: ${key}`);
};

export const getConnection = (env: Env) => {
  const connection = connect({
    url: getEnvValue(env, "DATABASE_URL"),
    // @ts-ignore
    fetch: (url: string, init: RequestInit<RequestInitCfProperties>) => {
      delete (init as any)["cache"]; // Remove cache header
      return fetch(url, init);
    },
  });

  return drizzle(connection, {
    logger: true,
  });
};
