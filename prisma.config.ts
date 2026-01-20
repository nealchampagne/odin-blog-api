import "dotenv/config"; // ensures DATABASE_URL is loaded
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",   // explicitly point to your schema file
  migrations: {
    seed: "tsx prisma/seed.ts",        // optional, but recommended
    path: "prisma/migrations",      // optional, but recommended
  },
  datasource: {
    url: env("DATABASE_URL"),       // use env() helper, not process.env directly
  },
});
