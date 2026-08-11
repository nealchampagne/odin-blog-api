import "dotenv/config"; // ensures DATABASE_URL is loaded
import { defineConfig } from "prisma/config";

const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",   // explicitly point to your schema file
  migrations: {
    seed: "tsx prisma/seed.ts",        // optional, but recommended
    path: "prisma/migrations",      // optional, but recommended
  },
  datasource: {
    url: connectionString,       // use env() helper, not process.env directly
  },
});
