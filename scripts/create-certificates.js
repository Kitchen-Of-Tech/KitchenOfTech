const { createClient } = require("@supabase/supabase-js");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.join(__dirname, "../.env.local");
const envFile = fs.readFileSync(envPath, "utf-8");
const envVars = {};

envFile.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...valueParts] = trimmed.split("=");
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const STUDENTS = [
  "Anika Tasnim",
  "Charity",
  "Indroit Roy",
  "Mahatuza Islam Meshu",
  "Md Ratul Raihan",
  "Md Saidul Amin",
  "Rupama Halder",
  "Sabrina akter",
  "Sadia Akter Keya",
  "Saniela Akter",
  "Siam Shikder",
  "Surya Akter",
  "Yeasir Arafat",
  "Zarin Tabassum Anuva",
  "Zinnatun Nessa Antu Moni",
];

const COURSE_NAME = "COMPUTER OPERATION, MS OFFICE AND AI BOOTKOT";
const ISSUED_DATE = "2026-03-12";
const VALID_UNTIL_DAYS = 365; // 1 year validity

function generateCertificateId() {
  // Format: KOT-2026-XXXXXXXXXXXXXXXXXX
  const randomPart = uuidv4().replace(/-/g, "").substring(0, 16).toUpperCase();
  return `KOT-2026-${randomPart}`;
}

function generateCredentialCode() {
  // Format: KOTCERT{8-digit}
  const randomNum = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return `KOTCERT${randomNum}`;
}

async function createCertificates() {
  console.log(`\n🎓 Starting certificate creation for ${STUDENTS.length} students...\n`);

  const results = {
    success: [],
    failed: [],
    notFound: [],
  };

  for (const studentName of STUDENTS) {
    try {
      // Find student in bootcamp_registrations
      const { data: registration, error: searchError } = await supabase
        .from("bootcamp_registrations")
        .select("*")
        .ilike("name", `%${studentName}%`)
        .limit(1)
        .single();

      if (searchError || !registration) {
        console.log(`❌ NOT FOUND: ${studentName}`);
        results.notFound.push(studentName);
        continue;
      }

      // Calculate expiration date (1 year from issue date)
      const issueDate = new Date(ISSUED_DATE);
      const validUntil = new Date(issueDate);
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      // Create certificate record
      const { data: cert, error: insertError } = await supabase
        .from("certificates")
        .insert({
          certificate_id: generateCertificateId(),
          credential_code: generateCredentialCode(),
          student_name: registration.name,
          course_name: COURSE_NAME,
          course_id: "computer-operation-ms-office-ai-bootcamp",
          issue_date: ISSUED_DATE,
          valid_until: validUntil.toISOString().split("T")[0],
          enrollment_id: null,
          user_id: null,
          instructor_name: "Kitchen of Tech",
          institution: "Kitchen of Tech",
          level: "Beginner",
          grade: 85,
        })
        .select()
        .single();

      if (insertError) {
        console.log(`❌ FAILED: ${studentName} - ${insertError.message}`);
        results.failed.push({
          name: studentName,
          error: insertError.message,
        });
      } else {
        console.log(`✅ SUCCESS: ${studentName}`);
        console.log(
          `   Certificate ID: ${cert.certificate_id}`
        );
        console.log(`   Credential Code: ${cert.credential_code}`);
        results.success.push({
          name: studentName,
          certificateId: cert.certificate_id,
          email: registration.email,
          whatsappNumber: registration.whatsapp_number,
          verificationLink: `${process.env.NEXT_PUBLIC_SITE_URL}/education/verify-certificate/${cert.certificate_id}`,
        });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${studentName} - ${error.message}`);
      results.failed.push({
        name: studentName,
        error: error.message,
      });
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📊 SUMMARY");
  console.log("=".repeat(80));
  console.log(`✅ Success: ${results.success.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Not Found: ${results.notFound.length}`);
  console.log("\n");

  // Generate WhatsApp messages
  console.log("📱 WHATSAPP CONGRATULATIONS MESSAGES:");
  console.log("=".repeat(80) + "\n");

  results.success.forEach((student) => {
    const message = `🎉 Congratulations ${student.name}! 🎉

You have successfully completed the course:
*${COURSE_NAME}*

Your Certificate is ready! You can verify it here:
${student.verificationLink}

Download your certificate and share with employers!

Well done on your achievement! 👏

- Kitchen of Tech Team`;

    console.log(`TO: ${student.whatsappNumber}`);
    console.log(`\n${message}`);
    console.log("\n" + "-".repeat(80) + "\n");
  });

  // Summary statistics
  console.log("\n📈 STATISTICS:");
  console.log("=".repeat(80));
  console.log(`Total Processed: ${STUDENTS.length}`);
  console.log(`Successfully Created: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  console.log(`Not Found: ${results.notFound.length}`);

  if (results.notFound.length > 0) {
    console.log("\n⚠️  Students NOT FOUND in bootcamp_registrations:");
    results.notFound.forEach((name) => console.log(`   - ${name}`));
  }

  if (results.failed.length > 0) {
    console.log("\n❌ Failed Registrations:");
    results.failed.forEach((f) => console.log(`   - ${f.name}: ${f.error}`));
  }

  console.log("\n");
}

// Run the script
createCertificates().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
