import { Pool } from 'pg'; // Use 'pg' for PostgreSQL
import { drizzle } from 'drizzle-orm/node-postgres'; // Use 'node-postgres' adapter for Drizzle
import * as schema from "@shared/schema";
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv'; // Ensure dotenv is imported and configured
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL }); // Use PostgreSQL Pool
export const db = drizzle({ client: pool, schema }); // Initialize Drizzle with PostgreSQL client

// Test connection function
// async function testConnection() {
//   try {
//     const result = await db.execute(sql`SELECT NOW()`);
//     console.log("✅ Database connected. Server time:", result.rows[0].now);

//     if ('users' in schema) {
//       const users = await db.select().from(schema.users);
//       console.log("📦 Users:", users);
//     } else {
//       console.warn("⚠️ 'users' table not found in schema.");
//     }

//   } catch (error) {
//     console.error("❌ Error querying 'users' table:", error);
//     process.exit(1);
//   }
// }

// testConnection();