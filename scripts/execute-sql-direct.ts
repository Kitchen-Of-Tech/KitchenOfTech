/**
 * Execute SQL directly via Supabase API
 * This bypasses the Supabase client and executes raw SQL
 */

import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

async function executeSql(sqlQuery: string): Promise<void> {
  try {
    console.log("Executing SQL...");
    console.log("Query:", sqlQuery.substring(0, 100) + "...\n");

    // Try using Supabase REST API with sql function
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql: sqlQuery }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ SQL executed successfully");
      console.log(data);
    } else {
      console.error("❌ SQL execution failed");
      console.error(data);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMsg);
  }
}

async function main() {
  // Read migration file
  const migrationPath = path.join(
    __dirname,
    "../supabase/migrations/20260320_fix_certificate_schema.sql"
  );
  const sql = fs.readFileSync(migrationPath, "utf-8");

  // Execute the full migration
  await executeSql(sql);
}

main();
