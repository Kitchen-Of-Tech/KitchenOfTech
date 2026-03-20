#!/usr/bin/env node
/**
 * Verify that certificate schema columns exist
 * Run this after manually applying the migration via Supabase dashboard
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import * as path from "path";
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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verifyCertificateSchema() {
  console.log("🔍 Verifying certificate table schema...\n");

  try {
    // Attempt to insert test data with all new fields
    const testData = {
      certificate_id: `TEST-${Date.now()}`,
      student_name: "Test Student",
      course_name: "Test Course",
      instructor_name: "Test Instructor",
      course_id: "test-course",
      credential_code: `TEST-CODE-${Date.now()}`,
      level: "Beginner",
      grade: 95.5,
      institution: "Test Institution",
      instructor_notes: "Test notes",
      issue_date: new Date().toISOString(),
    };

    console.log("📝 Testing certificate table insert with new columns...\n");
    console.log("Data to insert:");
    Object.entries(testData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log("\n");

    const { data: result, error } = await supabase
      .from("certificates")
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error("❌ Insert failed!");
      console.error(`Error: ${error.message}\n`);

      if (error.message.includes("credential_code")) {
        console.log("⚠️  The credential_code column still doesn't exist.");
        console.log("   → Run the SQL migration in Supabase dashboard first!");
      } else if (error.message.includes("schema cache")) {
        console.log("⚠️  Schema cache not updated yet.");
        console.log("   → Wait a moment and try again, or clear browser cache");
      } else {
        console.log("⚠️  Check the error message above for details");
      }

      process.exit(1);
    }

    console.log("✅ Certificate schema is correct!\n");
    console.log("Inserted test certificate:");
    console.log(`  ID: ${result.id}`);
    console.log(`  Certificate ID: ${result.certificate_id}`);
    console.log(`  Credential Code: ${result.credential_code}`);
    console.log(`  Level: ${result.level}`);
    console.log(`  Grade: ${result.grade}`);
    console.log(`  Institution: ${result.institution}\n`);

    // Clean up
    await supabase.from("certificates").delete().eq("id", result.id);
    console.log("✓ Test record cleaned up\n");

    console.log("🎉 Certificate schema migration is complete!");
    console.log("   You can now use the certificate APIs\n");

    console.log("📚 Next steps:");
    console.log("  1. npm run dev (start development server)");
    console.log("  2. Try creating certificates in the dashboard");
    console.log("  3. Test the certificate verification endpoint\n");

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("❌ Verification failed:", msg);
    process.exit(1);
  }
}

verifyCertificateSchema();
