import { defineConfig } from "drizzle-kit";

const DATABASE_URL = "postgresql://neondb_owner:npg_JTfdm9DMt2Pn@ep-twilight-mouse-a8op4930-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
