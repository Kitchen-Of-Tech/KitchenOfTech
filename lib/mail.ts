import { Resend } from 'resend';

/**
 * Email utility for sending notifications
 * Uses Resend for reliable email delivery
 */

interface EmailOptions {
  to: string[];
  subject: string;
  text: string;
  html: string;
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email notification using Resend
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL in environment variables
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, text, html } = options;

  // Check if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured. Email not sent.');
    console.log('📧 Email (not sent - RESEND_API_KEY not configured):');
    console.log(`To: ${to.join(', ')}`);
    console.log(`Subject: ${subject}`);
    return false;
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@kitchenoftech.org',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
    });

    if (result.error) {
      console.error('❌ Email send failed:', result.error);
      return false;
    }

    console.log('✅ Email sent successfully:', {
      messageId: result.data?.id,
      to: to.join(', '),
      subject,
    });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

/**
 * Format a meeting request notification email
 */
export function formatMeetingNotificationEmail(meeting: {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  service_title?: string;
  service_slug?: string;
  preferred_datetime?: string;
  created_at: string;
}) {
  const contactInfo = [];
  if (meeting.email) contactInfo.push(`Email: ${meeting.email}`);
  if (meeting.phone) contactInfo.push(`Phone: ${meeting.phone}`);

  const subject = meeting.service_title
    ? `New Meeting Request: ${meeting.service_title}`
    : 'New Meeting Request';

  const text = `
New Meeting Request Received

Name: ${meeting.name}
${contactInfo.join('\n')}
${meeting.service_title ? `Service: ${meeting.service_title}` : 'General Inquiry'}
${meeting.preferred_datetime ? `Preferred Date/Time: ${new Date(meeting.preferred_datetime).toLocaleString()}` : ''}
${meeting.message ? `\nMessage:\n${meeting.message}` : ''}

Submitted: ${new Date(meeting.created_at).toLocaleString()}

View and manage this request in your dashboard:
${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/meetings
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0070f3;">New Meeting Request</h2>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${meeting.name}</p>
        ${meeting.email ? `<p><strong>Email:</strong> <a href="mailto:${meeting.email}">${meeting.email}</a></p>` : ''}
        ${meeting.phone ? `<p><strong>Phone:</strong> ${meeting.phone}</p>` : ''}
        ${meeting.service_title ? `<p><strong>Service:</strong> ${meeting.service_title}</p>` : '<p><strong>Type:</strong> General Inquiry</p>'}
        ${meeting.preferred_datetime ? `<p><strong>Preferred Date/Time:</strong> ${new Date(meeting.preferred_datetime).toLocaleString()}</p>` : ''}
      </div>
      
      ${meeting.message ? `
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Message:</h3>
          <p style="white-space: pre-wrap;">${meeting.message}</p>
        </div>
      ` : ''}
      
      <p style="color: #666; font-size: 14px;">
        Submitted: ${new Date(meeting.created_at).toLocaleString()}
      </p>
      
      <div style="margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/meetings" 
           style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          View in Dashboard
        </a>
      </div>
    </div>
  `;

  return { subject, text, html };
}
