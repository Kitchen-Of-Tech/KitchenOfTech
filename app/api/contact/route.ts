import { NextRequest, NextResponse } from "next/server";

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required." },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // --- Send via email service ---
    // Option A: Resend (recommended) — set RESEND_API_KEY in .env.local
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.CONTACT_EMAIL || "contact@kitchenoftech.com";

    if (resendApiKey) {
      const emailPayload = {
        from: "KitchenOfTech Contact <onboarding@resend.dev>",
        to: [recipientEmail],
        reply_to: body.email,
        subject: `[Contact Form] ${body.subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280; width: 120px;">Name:</td>
                <td style="padding: 8px 0;">${body.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0;"><a href="mailto:${body.email}">${body.email}</a></td>
              </tr>
              ${body.phone ? `<tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0;">${body.phone}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #6b7280;">Subject:</td>
                <td style="padding: 8px 0;">${body.subject}</td>
              </tr>
            </table>
            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <h3 style="color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap; color: #4b5563;">${body.message}</p>
          </div>
        `,
      };

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error("Resend API error:", resendError);
        return NextResponse.json(
          { error: "Failed to send message. Please try again later." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, message: "Your message has been sent successfully!" },
        { status: 200 }
      );
    }

    // Option B: Fallback — log the submission if no email service is configured
    // In production you MUST set RESEND_API_KEY
    console.log("📩 Contact form submission (no email service configured):", {
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message,
      timestamp: new Date().toISOString(),
    });

    // Return success anyway so users aren't stuck (configure email service for production)
    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received. We'll get back to you soon!",
        warning: "Email service not configured — message logged to server console.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
