import { neon } from "@neondatabase/serverless";

let cachedSql: ReturnType<typeof neon> | null = null;

export function hasDatabaseConfig(): boolean {
  return Boolean(
    process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.NEON_DATABASE_URL,
  );
}

function getDatabaseUrl(): string {
  const databaseUrl =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.NEON_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "Database connection is not configured. Set DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL.",
    );
  }

  return databaseUrl;
}

export function getSql() {
  if (!cachedSql) {
    cachedSql = neon(getDatabaseUrl());
  }

  return cachedSql;
}
