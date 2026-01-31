/**
 * Email Notification Service for Education Platform
 * 
 * This service handles sending email notifications for:
 * - Course enrollment confirmations
 * - Payment approval notifications
 * - Welcome emails
 * - Certificate generation
 * - Course completion
 * 
 * Integrated with Resend Email Service
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'KitchenOfTech <onboarding@resend.dev>';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EnrollmentEmailData {
  userName: string;
  userEmail: string;
  courseName: string;
  courseSlug: string;
  enrollmentId: string;
  isPending: boolean;
  transactionId?: string;
}

interface CertificateEmailData {
  userName: string;
  userEmail: string;
  courseName: string;
  certificateUrl: string;
  certificateId: string;
}

/**
 * Send a generic email using Resend
 */
async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  try {
    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured. Email not sent.');
      console.log('📧 Email would be sent to:', to);
      console.log('📧 Subject:', subject);
      return false;
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentConfirmation(data: EnrollmentEmailData): Promise<boolean> {
  const { userName, userEmail, courseName, courseSlug, isPending, transactionId } = data;
  
  const subject = isPending 
    ? `Payment Submitted - ${courseName}`
    : `Welcome to ${courseName}!`;
  
  const html = isPending
    ? getPaymentPendingEmailHTML(userName, courseName, transactionId || '')
    : getWelcomeEmailHTML(userName, courseName, courseSlug);
  
  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send payment approval notification
 */
export async function sendPaymentApprovalEmail(data: EnrollmentEmailData): Promise<boolean> {
  const { userName, userEmail, courseName, courseSlug } = data;
  
  const subject = `Payment Approved - Access Your Course Now!`;
  const html = getPaymentApprovedEmailHTML(userName, courseName, courseSlug);
  
  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Send certificate issued notification
 */
export async function sendCertificateEmail(data: CertificateEmailData): Promise<boolean> {
  const { userName, userEmail, courseName, certificateUrl, certificateId } = data;
  
  const subject = `Congratulations! Your Certificate is Ready`;
  const html = getCertificateEmailHTML(userName, courseName, certificateUrl, certificateId);
  
  return sendEmail({ to: userEmail, subject, html });
}

/**
 * Email HTML Templates
 */

function getPaymentPendingEmailHTML(userName: string, courseName: string, transactionId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Submitted Successfully!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for enrolling in <strong>${courseName}</strong>!</p>
      
      <div class="info-box">
        <h3>⏳ What's Next?</h3>
        <ol>
          <li>Our team will verify your payment</li>
          <li>You'll receive access within 24 hours</li>
          <li>Once approved, you can start learning immediately</li>
        </ol>
      </div>
      
      <p><strong>Transaction ID:</strong> ${transactionId}</p>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/education/dashboard" class="button">View Dashboard</a>
      
      <p>Best regards,<br>The KitchenOfTech Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} KitchenOfTech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getWelcomeEmailHTML(userName: string, courseName: string, courseSlug: string): string {
  const courseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/education/learn/${courseSlug}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to Your Course!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Congratulations! You're now enrolled in <strong>${courseName}</strong>.</p>
      
      <p>You now have full access to:</p>
      
      <div class="feature">✅ All course videos and lessons</div>
      <div class="feature">✅ Downloadable resources</div>
      <div class="feature">✅ Quizzes and assignments</div>
      <div class="feature">✅ Certificate upon completion</div>
      <div class="feature">✅ Instructor support</div>
      
      <a href="${courseUrl}" class="button">Start Learning Now</a>
      
      <p>We're excited to have you on this learning journey. If you need any help, our support team is here for you.</p>
      
      <p>Happy learning!<br>The KitchenOfTech Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} KitchenOfTech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getPaymentApprovedEmailHTML(userName: string, courseName: string, courseSlug: string): string {
  const courseUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/education/learn/${courseSlug}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Approved!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Great news! Your payment has been approved and your course is now active.</p>
      
      <div class="success-box">
        <h3>🚀 You're Ready to Learn!</h3>
        <p>Your enrollment in <strong>${courseName}</strong> is now fully activated. Start your learning journey right away!</p>
      </div>
      
      <a href="${courseUrl}" class="button">Access Your Course</a>
      
      <p>Thank you for choosing KitchenOfTech. We're excited to support your learning journey!</p>
      
      <p>Best regards,<br>The KitchenOfTech Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} KitchenOfTech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getCertificateEmailHTML(userName: string, courseName: string, certificateUrl: string, certificateId: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .certificate-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; text-align: center; border-radius: 10px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Congratulations!</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Congratulations on completing <strong>${courseName}</strong>!</p>
      
      <div class="certificate-box">
        <h2>🎓 Your Certificate is Ready!</h2>
        <p>Certificate ID: <strong>${certificateId}</strong></p>
        <a href="${certificateUrl}" class="button">Download Certificate</a>
      </div>
      
      <p>You've demonstrated dedication and commitment in completing this course. Share your achievement with the world!</p>
      
      <p>Your certificate includes:</p>
      <ul>
        <li>Unique certificate ID for verification</li>
        <li>Course completion details</li>
        <li>Skills acquired</li>
        <li>Professional credential</li>
      </ul>
      
      <p>Keep learning and growing with KitchenOfTech!</p>
      
      <p>Best regards,<br>The KitchenOfTech Team</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} KitchenOfTech. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
