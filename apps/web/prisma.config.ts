import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
  },
  // Load environment variables for build/deployment
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
  },
});
