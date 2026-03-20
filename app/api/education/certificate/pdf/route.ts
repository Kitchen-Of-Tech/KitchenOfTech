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

    // Replace placeholders in SVG
    svgContent = svgContent.replace(/\[NAME\]/g, certificate.student_name || "Student Name");
    svgContent = svgContent.replace(/\[Course Name\]/g, certificate.course_name || "Course Name");
    svgContent = svgContent.replace(/\[ISSUED DATE\]/g, issueDateStr);
    svgContent = svgContent.replace(/\[CERTIFICATE ID\]/g, certificateId);

    // Ensure Arial font is used by replacing any remaining custom font references
    svgContent = svgContent.replace(/font-family:\s*'[^']*'/g, "font-family: 'Arial'");
    svgContent = svgContent.replace(/font-family:\s*"[^"]*"/g, 'font-family: "Arial"');

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
