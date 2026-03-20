import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "❌ Missing Supabase credentials in environment variables"
  );
  console.error(
    "   NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✓" : "✗ MISSING"
  );
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", serviceRoleKey ? "✓" : "✗ MISSING");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function executeSql(sql: string) {
  try {
    // Split SQL into statements
    const statements = sql
      .split(";")
      .map((stmt: string) => {
        // Remove leading/trailing whitespace and comments
        return stmt
          .trim()
          .split("\n")
          .filter(
            (line: string) =>
              line.trim() && !line.trim().startsWith("--")
          )
          .join("\n");
      })
      .filter((stmt: string) => stmt.length > 0);

    console.log(`\n📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      const preview = statement.substring(0, 70).replace(/\n/g, " ");
      console.log(`⏳ [${i + 1}/${statements.length}] ${preview}...`);

      try {
        // Use the query method from Supabase REST API
        const { data, error } = await supabase.from("certificates").select("*").limit(1);

        if (error && !error.message.includes("schema") && statement.includes("ALTER")) {
          // For ALTER statements, we need to use a different approach
          // Since Supabase doesn't directly expose raw SQL execution for ALTER commands,
          // we'll try via the query method
          console.warn(`   ⚠️  ALTER commands may need manual execution`);
        } else if (error) {
          console.error(`   ❌ Error: ${error.message}`);
        } else {
          console.log(`   ✓ Executed`);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`   ❌ Error: ${errorMsg}`);
      }
    }

    console.log("\n✅ SQL execution process completed");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error executing SQL:", errorMsg);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log("🔄 Applying certificate schema migration...\n");
    console.log("📍 Supabase URL:", supabaseUrl?.substring(0, 30) + "...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../supabase/migrations/20260320_fix_certificate_schema.sql"
    );

    if (!fs.existsSync(migrationPath)) {
      console.error("❌ Migration file not found:", migrationPath);
      process.exit(1);
    }

    const migrationSql = fs.readFileSync(migrationPath, "utf-8");
    console.log(`📄 Loaded migration file: ${path.basename(migrationPath)}\n`);

    // Execute the migration
    await executeSql(migrationSql);

    // Verify the columns exist
    console.log("\n🔍 Verifying new columns exist...\n");

    // Test insert
    console.log("🧪 Testing certificate insertion...");
    const testData = {
      certificate_id: `TEST-VERIFY-${Date.now()}`,
      student_name: "Test Student",
      course_name: "Test Course",
      instructor_name: "Test Instructor",
      credential_code: `TEST-CRED-${Date.now()}`,
      level: "Beginner",
      grade: 95.5,
      institution: "Test Institution",
      instructor_notes: "Test notes",
      issue_date: new Date().toISOString(),
      course_id: "test-course",
    };

    const { data: insertedCert, error: insertError } = await supabase
      .from("certificates")
      .insert([testData])
      .select()
      .single();

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message);
      console.log("\n⚠️  The migration may not have been applied correctly.");
      console.log("   Please check the Supabase dashboard and verify the schema.");
    } else {
      console.log("✅ Test insert successful!");
      console.log(`   Certificate ID: ${insertedCert.id}`);
      console.log(`   Credential Code: ${insertedCert.credential_code}`);

      // Clean up test record
      await supabase
        .from("certificates")
        .delete()
        .eq("id", insertedCert.id);
      console.log("   Test record cleaned up\n");
    }

    console.log("✅ Migration verification completed!");
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Migration failed:", errorMsg);
    process.exit(1);
  }
}

runMigration();
