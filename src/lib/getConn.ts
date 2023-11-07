declare global {
  interface Env {
    DATABASE_URL: string;
  }
}

export const getConnectionUrl = (env: Env) => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }

  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error("DATABASE_URL is not set");
};
