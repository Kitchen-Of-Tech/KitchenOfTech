/**
 * Send Certificate Emails to Bootcamp Participants
 * 
 * This script:
 * 1. Links certificates to bootcamp registrations
 * 2. Sends certificate emails using the Resend service
 * 3. Tracks sending status in the database
 * 
 * Usage:
 *   npx ts-node scripts/send-bootcamp-certificates.ts [bootcamp-id]
 *   npx ts-node scripts/send-bootcamp-certificates.ts (sends to all pending)
 */

import { createAdminClient } from '../lib/supabase/server';
import { getCertificateForRegistration, getBootcampRegistrations } from '../lib/education/certificate-linking';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

interface CertificateSendResult {
  registration_id: string;
  student_email: string;
  student_name: string;
  status: 'success' | 'failed' | 'skipped';
  certificate_id?: string;
  message: string;
}

async function sendCertificateEmails(bootcampId?: string): Promise<void> {
  const startTime = Date.now();
  
  console.log('🎓 Starting Certificate Distribution...\n');

  try {
    // Initialize Supabase admin client
    const supabase = await createAdminClient();

    // Verify API key exists
    if (!process.env.RESEND_API_KEY) {
      throw new Error('❌ RESEND_API_KEY not found in environment variables');
    }

    // Get bootcamp registrations that need certificates
    console.log('📋 Fetching bootcamp registrations...');
    const registrations = await getBootcampRegistrations(supabase, bootcampId);

    if (!registrations || registrations.length === 0) {
      console.log('✅ No pending registrations found');
      return;
    }

    console.log(`✅ Found ${registrations.length} registration(s)\n`);

    const results: CertificateSendResult[] = [];
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Process each registration
    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      const progressMsg = `[${i + 1}/${registrations.length}]`;

      try {
        console.log(`${progressMsg} Processing: ${registration.name || 'Unknown'} (${registration.email})`);

        // Skip if no email
        if (!registration.email) {
          console.log(`  ⚠️ No email provided\n`);
          results.push({
            registration_id: registration.id,
            student_email: registration.email || 'NO_EMAIL',
            student_name: registration.name || 'Unknown',
            status: 'skipped',
            message: 'No email provided',
          });
          skippedCount++;
          continue;
        }

        // Find linked certificate
        console.log(`  🔍 Searching for certificate match...`);
        const certificate = await getCertificateForRegistration(supabase, registration);

        if (!certificate) {
          console.log(`  ❌ No certificate found\n`);
          results.push({
            registration_id: registration.id,
            student_email: registration.email,
            student_name: registration.name || 'Unknown',
            status: 'skipped',
            message: 'No matching certificate found',
          });
          skippedCount++;
          continue;
        }

        console.log(`  ✅ Certificate found (ID: ${certificate.id})`);

        // Prepare email content
        const certificateUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenoftech.org'}/certificates/${certificate.id}`;
        const studentName = certificate.student_name || registration.name || 'Graduate';
        const issuedDate = certificate.issued_date 
          ? new Date(certificate.issued_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: bold; color: #0070f3; }
              .message { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .certificate-box { background: white; border: 2px solid #0070f3; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; }
              .certificate-box h2 { color: #0070f3; margin: 0 0 10px 0; }
              .certificate-box p { margin: 8px 0; }
              .student-name { font-size: 20px; font-weight: bold; color: #000; }
              .issued-date { color: #666; font-size: 14px; }
              .button { display: inline-block; background: #0070f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">🎓 Kitchen of Tech</div>
              </div>

              <div class="message">
                <p>Dear ${studentName},</p>
                <p>Congratulations! 🎉</p>
                <p>We are delighted to inform you that you have successfully completed the bootcamp program at Kitchen of Tech. Your dedication, hard work, and commitment to learning have been truly impressive.</p>
              </div>

              <div class="certificate-box">
                <h2>Certificate of Completion</h2>
                <p class="student-name">${studentName}</p>
                <p>Has successfully completed the bootcamp program</p>
                <p class="issued-date">Issued: ${issuedDate}</p>
              </div>

              <p>Your certificate is now available and ready to download or share with your professional network. This certificate represents your achievement and demonstrates your proficiency in the skills covered during the bootcamp.</p>

              <a href="${certificateUrl}" class="button">View Your Certificate</a>

              <p>You can also access your certificate anytime from your dashboard or by using the link above. Feel free to:</p>
              <ul>
                <li>Download the certificate for your records</li>
                <li>Share it on LinkedIn or other professional platforms</li>
                <li>Include it in your resume or portfolio</li>
              </ul>

              <p>If you have any questions about your certificate or need any assistance, please don't hesitate to reach out to our support team.</p>

              <p>Thank you for being part of Kitchen of Tech, and we wish you all the best in your future endeavors!</p>

              <p style="margin-top: 30px;">Best regards,<br><strong>Kitchen of Tech Team</strong></p>

              <div class="footer">
                <p>This is an automated message. Please do not reply directly to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Kitchen of Tech. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send email
        console.log(`  📧 Sending certificate email...`);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'noreply@kitchenoftech.org',
          to: registration.email,
          subject: `🎓 Your Certificate of Completion from Kitchen of Tech`,
          html: emailHtml,
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        console.log(`  ✅ Email sent successfully (Message ID: ${result.data?.id})\n`);

        // Update certificate as sent
        const { error: updateError } = await supabase
          .from('certificates')
          .update({
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', certificate.id);

        if (updateError) {
          console.log(`  ⚠️ Warning: Could not update certificate status: ${updateError.message}`);
        }

        results.push({
          registration_id: registration.id,
          student_email: registration.email,
          student_name: registration.name || 'Unknown',
          status: 'success',
          certificate_id: certificate.id,
          message: 'Certificate email sent successfully',
        });

        successCount++;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.log(`  ❌ Failed: ${errorMsg}\n`);

        results.push({
          registration_id: registration.id,
          student_email: registration.email || 'UNKNOWN',
          student_name: registration.name || 'Unknown',
          status: 'failed',
          message: errorMsg,
        });

        failureCount++;
      }
    }

    // Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n' + '='.repeat(60));
    console.log('📊 CERTIFICATE DISTRIBUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`⚠️ Skipped: ${skippedCount}`);
    console.log(`⏱️ Duration: ${duration}s`);
    console.log('='.repeat(60) + '\n');

    // Save results to file
    const resultsFile = `scripts/output/certificate-send-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
    
    const dir = path.dirname(resultsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`📁 Results saved to: ${resultsFile}\n`);

    // Exit with success
    process.exit(successCount > 0 ? 0 : 1);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
const bootcampId = process.argv[2];
sendCertificateEmails(bootcampId).catch(console.error);
