import type { Config } from "drizzle-kit";

const config: Config = {
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./db/sqlite.db",
  },
};

export default config;

