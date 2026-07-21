import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  const url =
    process.env.DATABASE_URL ??
    "postgresql://opencrm:opencrm@localhost:5432/opencrm";

  console.log("Running migrations…");
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  await client.end();
  console.log("Migrations complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
