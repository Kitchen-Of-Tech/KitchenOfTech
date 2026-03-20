import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import sharp from "sharp";
import fs from "fs";
import path from "path";

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

    // Read SVG template
    const svgPath = path.join(process.cwd(), "public/certificates/Certificate.svg");
    let svgContent = fs.readFileSync(svgPath, "utf-8");

    // Prepare replacement values
    const issueDateStr = certificate.issue_date
      ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Date";

    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/education/verify-certificate/${certificateId}`;

  // Remove all text nodes from SVG to avoid font rendering issues in production
  // We'll render all text using jsPDF built-in fonts for consistency.
  svgContent = svgContent.replace(/<text[\s\S]*?<\/text>/g, "");

    // Convert modified SVG to PNG for embedding in PDF
    const svgBuffer = Buffer.from(svgContent);

    // SVG viewBox is 841.9 x 595.3px (landscape A4)
    // We need to convert to landscape orientation in PDF
    const pngBuffer = await sharp(svgBuffer)
      .resize(1190, 842, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255 },
      })
      .png({ quality: 100 })
      .toBuffer();

    // Convert PNG to base64 data URL
    const pngBase64 = pngBuffer.toString("base64");
    const pngDataUrl = `data:image/png;base64,${pngBase64}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Create PDF in LANDSCAPE orientation (A4)
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 297mm for landscape
    const pageHeight = pdf.internal.pageSize.getHeight(); // 210mm for landscape

  // Add the modified SVG template image (fills entire page)
    pdf.addImage(pngDataUrl, "PNG", 0, 0, pageWidth, pageHeight);

    // QR code position (where the red box was: x="166.6" y="358.1" width="109.8" height="109.8")
    // Scale to PDF dimensions: SVG is 841.9 x 595.3, PDF landscape is 297 x 210mm
    // x: 166.6 / 841.9 * 297 = 58.99mm (approximately)
    // y: 358.1 / 595.3 * 210 = 126.17mm (approximately)
    // size: 109.8 / 841.9 * 297 = 38.79mm

    const qrX = (166.6 / 841.9) * pageWidth; // Scale X coordinate
    const qrY = (358.1 / 595.3) * pageHeight; // Scale Y coordinate
    const qrSize = (109.8 / 841.9) * pageWidth; // Scale QR size

    try {
      pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    } catch (err) {
      console.error("Error adding QR code:", err);
    }

    // Draw text using jsPDF built-in fonts (avoids missing font issues in production)
    const svgWidth = 841.9;
    const svgHeight = 595.3;
    const scaleX = pageWidth / svgWidth;
    const scaleY = pageHeight / svgHeight;

    const toMmX = (x: number) => x * scaleX;
    const toMmY = (y: number) => y * scaleY;

    const darkText = "#120842";
    const whiteText = "#ffffff";

    const setFont = (size: number, style: "normal" | "bold", color: string) => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(size);
      pdf.setTextColor(color);
    };

    const contentX = toMmX(166.6226);
    const contentMaxWidth = pageWidth - contentX - 20;

    // Title
    setFont(28, "bold", darkText);
    pdf.text("Certificate of Completion", contentX, toMmY(148.8042));

    // Course name (wrap if too long)
    const courseName = certificate.course_name || "Course Name";
    let courseFontSize = 22;
    setFont(courseFontSize, "normal", darkText);
    let courseLines = pdf.splitTextToSize(courseName, contentMaxWidth);
    if (courseLines.length > 1) {
      courseFontSize = 18;
      setFont(courseFontSize, "normal", darkText);
      courseLines = pdf.splitTextToSize(courseName, contentMaxWidth);
    }
    pdf.text(courseLines, contentX, toMmY(148.8042 + 26.4));

    // Label: awarded to
    setFont(12.0385, "normal", darkText);
    pdf.text("THIS CERTIFICATE AWARDED TO :", toMmX(166.5743), toMmY(232.9318));

    // Student name (wrap if too long)
    const studentName = certificate.student_name || "Student Name";
    let nameFontSize = 36;
    setFont(nameFontSize, "bold", darkText);
    let nameLines = pdf.splitTextToSize(studentName, contentMaxWidth);
    if (nameLines.length > 1) {
      nameFontSize = 28;
      setFont(nameFontSize, "bold", darkText);
      nameLines = pdf.splitTextToSize(studentName, contentMaxWidth);
    }
    if (nameLines.length > 2) {
      nameLines = nameLines.slice(0, 2);
    }
    pdf.text(nameLines, toMmX(166.6222), toMmY(281.9073));

    // Issued date (white text on blue bar)
    setFont(12.3389, "normal", whiteText);
    pdf.text(
      `ISSUED DATE: ${issueDateStr}`,
      toMmX(597.4471),
      toMmY(211.9475)
    );

    // Certificate ID
    setFont(16, "normal", darkText);
    pdf.text(
      `CERTIFICATE ID: ${certificateId}`,
      toMmX(166.6223),
      toMmY(326.1075)
    );

    // Scan to verify label
    setFont(10.4184, "normal", darkText);
    pdf.text("SCAN TO VERIFY:", toMmX(166.6222), toMmY(482.2604));

    // Signature line label
    setFont(7.4443, "normal", darkText);
    pdf.text(
      "FOUNDER & CEO, KITCHEN OF TECH",
      toMmX(399.1534),
      toMmY(432.0538)
    );

    // Logo text
    setFont(6.6872, "bold", whiteText);
    pdf.text("KITCHEN OF TECH", toMmX(641.0333), toMmY(417.7838));

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificateId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
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
