// prisma.config.ts
// Prisma configuration for datasource URL (required for Prisma 7+)
import { defineConfig } from "@prisma/client";

export default defineConfig({
  datasource: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
