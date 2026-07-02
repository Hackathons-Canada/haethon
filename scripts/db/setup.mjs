import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

await sql`CREATE EXTENSION IF NOT EXISTS postgis`;
await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

const [result] = await sql`
  SELECT
    current_database() AS database,
    current_schema() AS schema,
    postgis_version() AS postgis_version,
    EXISTS(SELECT 1 FROM pg_type WHERE typname = 'geography') AS geography_type_exists,
    EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS pg_trgm_installed
`;

if (!result.geography_type_exists || !result.pg_trgm_installed) {
  console.error("Database extensions were not installed correctly.");
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

console.log(
  `Database setup ok: ${result.database}/${result.schema}, PostGIS ${result.postgis_version}, pg_trgm installed`
);
