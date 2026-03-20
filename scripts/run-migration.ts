import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigrations() {
  console.log("🔄 Applying enhanced certificate migration...\n");

  try {
    // First, verify the certificates table exists and check columns
    console.log("📋 Checking certificates table schema...");
    const { data: tableInfo } = await supabase.rpc("get_table_schema", {
      table_name: "certificates",
    });

    console.log("Current columns:", tableInfo);

    // Run the migration SQL directly
    const migrationPath = path.join(
      process.cwd(),
      "supabase/migrations/20260320_enhanced_certificates.sql"
    );

    if (!fs.existsSync(migrationPath)) {
      console.error("❌ Migration file not found:", migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Split into individual statements and execute
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const isCommentOnly = statement.startsWith("--");

      if (isCommentOnly) continue;

      try {
        console.log(
          `⏳ Executing statement ${i + 1}/${statements.length}...`
        );
        console.log(
          `   ${statement.substring(0, 60).replace(/\n/g, " ")}...`
        );

        // Use sql to execute raw SQL
        const { error } = await supabase.rpc("sql", {
          query: statement,
        });

        if (error) {
          // Check if it's just a duplicate column error (which is ok since we use IF NOT EXISTS)
          if (error.message?.includes("already exists")) {
            console.log(`   ✓ Already exists (skipped)`);
          } else {
            console.log(`   ⚠️  ${error.message}`);
          }
        } else {
          console.log(`   ✓ Executed`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${err.message}`);
      }
    }

    // Verify the migration was applied
    console.log("\n🔍 Verifying migration...");
    const { data: certTable, error: tableError } = await supabase
      .from("certificates")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Error checking table:", tableError.message);
    } else {
      console.log("✅ Certificates table accessible");
      console.log("   Attempting to insert test data...");

      // Try a test insert to verify columns work
      const { data: testCert, error: insertError } = await supabase
        .from("certificates")
        .insert({
          certificate_id: "TEST-" + Date.now(),
          student_name: "Test Student",
          course_name: "Test Course",
          credential_code: "TEST-CODE-" + Date.now(),
          level: "Beginner",
          issue_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Insert test failed:", insertError.message);
      } else {
        console.log("✅ Test insert successful!");

        // Clean up test data
        await supabase
          .from("certificates")
          .delete()
          .eq("id", testCert.id);
      }
    }

    console.log("\n✅ Migration process completed!");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
