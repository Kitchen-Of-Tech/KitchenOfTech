import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get("certificateId");

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Use admin client to fetch certificate and related data
    const supabase = createAdminClient();
    
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select(`
        *,
        course_enrollments (
          course_id
        )
      `)
      .eq("certificate_id", certificateId)
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Get course name from Sanity (simplified - you'd fetch from Sanity in production)
    // For now, we'll use a placeholder
    const courseName = "Course Name"; // TODO: Fetch from Sanity

    // Generate QR code for verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/education/verify-certificate/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 2,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Set background color
    pdf.setFillColor(15, 23, 42); // dark bg
    pdf.rect(0, 0, 297, 210, "F");

    // Add decorative border
    pdf.setDrawColor(124, 58, 237); // primary color
    pdf.setLineWidth(2);
    pdf.rect(10, 10, 277, 190);

    // Add inner border
    pdf.setDrawColor(168, 85, 247); // lighter primary
    pdf.setLineWidth(0.5);
    pdf.rect(15, 15, 267, 180);

    // Title
    pdf.setFontSize(40);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.text("Certificate of Completion", 148.5, 50, { align: "center" });

    // Subtitle line
    pdf.setDrawColor(124, 58, 237);
    pdf.setLineWidth(0.5);
    pdf.line(80, 60, 217, 60);

    // "This certifies that"
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    pdf.text("This certifies that", 148.5, 75, { align: "center" });

    // Student name
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(124, 58, 237); // primary color
    pdf.text(certificate.student_name, 148.5, 90, { align: "center" });

    // "has successfully completed"
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    pdf.text("has successfully completed", 148.5, 105, { align: "center" });

    // Course name
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(courseName, 148.5, 120, { align: "center" });

    // Date
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(200, 200, 200);
    const issueDate = new Date(certificate.issue_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`Issued on ${issueDate}`, 148.5, 135, { align: "center" });

    // Certificate ID
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Certificate ID: ${certificateId}`, 148.5, 145, { align: "center" });

    // Signature line (left)
    pdf.setDrawColor(100, 100, 100);
    pdf.line(40, 170, 90, 170);
    pdf.setFontSize(10);
    pdf.setTextColor(200, 200, 200);
    pdf.text("Instructor", 65, 176, { align: "center" });

    // Signature line (right)
    pdf.line(207, 170, 257, 170);
    pdf.text("Director", 232, 176, { align: "center" });

    // Add QR code
    pdf.addImage(qrCodeDataUrl, "PNG", 245, 160, 30, 30);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Scan to verify", 260, 194, { align: "center" });

    // Footer text
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("KitchenOfTech - Excellence in Education", 148.5, 200, { align: "center" });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificateId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
