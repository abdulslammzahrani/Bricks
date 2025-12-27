import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set in your .env file.\n" +
    "Please create a .env file in the project root with:\n" +
    "DATABASE_URL=postgresql://user:password@localhost:5432/database_name\n\n" +
    "See .env.example for reference."
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
