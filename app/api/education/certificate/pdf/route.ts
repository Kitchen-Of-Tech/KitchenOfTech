import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import puppeteer from "puppeteer";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  let browser = null;
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
      width: 200,
      margin: 2,
      color: {
        dark: "#1f2937",
        light: "#ffffff",
      },
    });

    // Read SVG template
    const svgPath = path.join(process.cwd(), "public/certificates/Certificate.svg");
    const svgContent = fs.readFileSync(svgPath, "utf-8");

    // Prepare text data
    const textData = {
      studentName: certificate.student_name || "Student Name",
      courseName: certificate.course_name || "Course Name",
      grade: certificate.grade ? `${certificate.grade}%` : "N/A",
      level: certificate.level || "N/A",
      issueDate: certificate.issue_date 
        ? new Date(certificate.issue_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Date",
      expirationDate: certificate.valid_until
        ? new Date(certificate.valid_until).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      certificateId: certificate.certificate_id,
      credentialCode: certificate.credential_code || "N/A",
      instructorName: certificate.instructor_name || "Instructor",
      institution: certificate.institution || "KitchenOfTech",
    };

    // Create HTML with SVG + QR overlay
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: 'Arial', sans-serif; background: white; }
          .certificate-container {
            position: relative;
            width: 841.9px;
            height: 595.3px;
            margin: 0 auto;
          }
          svg { width: 100%; height: 100%; }
          
          .overlay-text {
            position: absolute;
            font-family: 'Arial', sans-serif;
            color: #1f2937;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          
          .student-name {
            top: 240px;
            left: 200px;
            width: 441.9px;
            font-size: 48px;
            font-weight: bold;
            text-align: center;
          }
          
          .course-name {
            top: 310px;
            left: 150px;
            width: 541.9px;
            font-size: 36px;
            text-align: center;
            font-weight: 600;
          }
          
          .grade {
            top: 380px;
            left: 150px;
            font-size: 24px;
            font-weight: 600;
          }
          
          .level {
            top: 380px;
            left: 350px;
            font-size: 24px;
            font-weight: 600;
          }
          
          .issue-date {
            top: 430px;
            left: 150px;
            font-size: 18px;
          }
          
          .expiration-date {
            top: 430px;
            left: 550px;
            font-size: 18px;
          }
          
          .certificate-id {
            top: 470px;
            left: 150px;
            font-size: 14px;
            color: #666;
          }
          
          .credential-code {
            top: 470px;
            left: 550px;
            font-size: 14px;
            color: #666;
          }
          
          .instructor-name {
            top: 510px;
            left: 150px;
            font-size: 18px;
          }
          
          .institution {
            top: 510px;
            left: 550px;
            font-size: 18px;
          }
          
          .qr-code {
            position: absolute;
            top: 358px;
            left: 166px;
            width: 110px;
            height: 110px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e5e7eb;
          }
          
          .qr-code img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          
          @media print {
            body { margin: 0; padding: 0; }
            .certificate-container { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="certificate-container">
          ${svgContent}
          
          <div class="overlay-text student-name">${textData.studentName}</div>
          <div class="overlay-text course-name">${textData.courseName}</div>
          <div class="overlay-text grade">Grade: ${textData.grade}</div>
          <div class="overlay-text level">Level: ${textData.level}</div>
          <div class="overlay-text issue-date">Issued: ${textData.issueDate}</div>
          <div class="overlay-text expiration-date">Valid Until: ${textData.expirationDate}</div>
          <div class="overlay-text certificate-id">ID: ${textData.certificateId}</div>
          <div class="overlay-text credential-code">Code: ${textData.credentialCode}</div>
          <div class="overlay-text instructor-name">Instructor: ${textData.instructorName}</div>
          <div class="overlay-text institution">${textData.institution}</div>
          
          <div class="qr-code">
            <img src="${qrCodeDataUrl}" alt="QR Code">
          </div>
        </div>
      </body>
      </html>
    `;

    // Use Puppeteer to generate PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    
    // Set viewport to match certificate dimensions
    await page.setViewport({
      width: 842,
      height: 596,
      deviceScaleFactor: 2, // For better quality
    });

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      width: "841.9px",
      height: "595.3px",
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      printBackground: true,
    });

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Certificate-${certificateId}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
