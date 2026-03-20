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

    // Fetch certificate data
    const supabase = createAdminClient();
    
    const { data: certificate, error: certError } = await supabase
      .from("certificates")
      .select("*")
      .eq("certificate_id", certificateId)
      .single();

    if (certError || !certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Generate QR code
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/education/verify-certificate/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#1f2937",
        light: "#ffffff",
      },
    });

    // Create PDF using jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Set background - elegant gradient-like effect
    pdf.setFillColor(245, 245, 245);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Add decorative header
    pdf.setFillColor(99, 102, 241); // indigo
    pdf.rect(0, 0, pageWidth, 25, "F");

    // Certificate title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Certificate of Achievement", pageWidth / 2, 15, {
      align: "center",
    });

    // Add decorative line
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(0.5);
    pdf.line(15, 35, pageWidth - 15, 35);

    // Congratulations text
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont("helvetica", "normal");
    pdf.text("This is to certify that", pageWidth / 2, 45, { align: "center" });

    // Student name - LARGE AND BOLD
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(31, 41, 55); // dark gray
    const studentName = (certificate.student_name || "Student Name").toUpperCase();
    pdf.text(studentName, pageWidth / 2, 60, { align: "center" });

    // Decorative line under name
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(1);
    pdf.line(20, 65, pageWidth - 20, 65);

    // Achievement text
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(100, 100, 100);
    pdf.text("has successfully completed the course", pageWidth / 2, 75, {
      align: "center",
    });

    // Course name
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(99, 102, 241);
    const courseName = certificate.course_name || "Course Name";
    pdf.text(courseName, pageWidth / 2, 85, { align: "center" });

    // Certificate details section
    const detailsStartY = 100;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);

    // Issue date
    const issueDate = certificate.issue_date
      ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date";
    pdf.text(`Issued on: ${issueDate}`, 20, detailsStartY);

    // Grade
    if (certificate.grade !== undefined && certificate.grade !== null) {
      const gradeText = `Grade: ${typeof certificate.grade === "number" ? certificate.grade.toFixed(2) : certificate.grade}%`;
      pdf.text(gradeText, pageWidth - 60, detailsStartY);
    }

    // Level
    if (certificate.level) {
      pdf.text(`Level: ${certificate.level}`, 20, detailsStartY + 8);
    }

    // Credential code
    if (certificate.credential_code) {
      pdf.text(
        `Credential Code: ${certificate.credential_code}`,
        pageWidth - 100,
        detailsStartY + 8
      );
    }

    // Expiration date
    if (certificate.valid_until) {
      const expDate = new Date(certificate.valid_until).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      );
      pdf.text(`Valid Until: ${expDate}`, 20, detailsStartY + 16);
    }

    // Institution
    if (certificate.institution) {
      pdf.text(`Institution: ${certificate.institution}`, 20, detailsStartY + 24);
    }

    // Instructor
    if (certificate.instructor_name) {
      pdf.text(
        `Instructor: ${certificate.instructor_name}`,
        pageWidth - 100,
        detailsStartY + 24
      );
    }

    // Add QR code section
    const qrY = detailsStartY + 35;
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Scan to verify this certificate:", pageWidth / 2 - 35, qrY);

    // Add QR code image
    try {
      pdf.addImage(qrCodeDataUrl, "PNG", pageWidth / 2 - 20, qrY + 3, 40, 40);
    } catch (err) {
      console.error("Error adding QR code to PDF:", err);
      // Continue without QR if it fails
    }

    // Footer
    const footerY = pageHeight - 15;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.setFont("helvetica", "normal");
    pdf.text("KitchenOfTech - Excellence in Education", pageWidth / 2, footerY, {
      align: "center",
    });
    pdf.text(
      `Certificate ID: ${certificateId}`,
      pageWidth / 2,
      footerY + 5,
      { align: "center" }
    );

    // Add decorative footer line
    pdf.setDrawColor(99, 102, 241);
    pdf.setLineWidth(0.5);
    pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificateId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: String(error) },
      { status: 500 }
    );
  }
}
