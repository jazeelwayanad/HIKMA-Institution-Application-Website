import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ applicationId: string }> }) {
  const resolvedParams = await params;
  const { applicationId } = resolvedParams;

  try {
    // Auth: accept admin token, student token, OR no token (capability link right after submission)
    const studentToken = req.cookies.get("student_token")?.value;
    const studentPayload = studentToken ? await verifyToken(studentToken) : null;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { course: { include: { formTemplate: true } } },
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    if (studentPayload && studentPayload.role === "applicant" && studentPayload.sub !== applicationId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const templateUrl = application.course.formTemplate?.pdfTemplateUrl;

    // Require template URL
    if (!templateUrl) {
      return new NextResponse("No PDF template configured for this course", { status: 400 });
    }

    // Fetch the template
    let templateBuffer: Buffer;

    try {
      if (templateUrl.startsWith("http://") || templateUrl.startsWith("https://")) {
        // For Cloudinary URLs, extract public ID and fetch directly
        let fetchUrl = templateUrl;
        
        if (templateUrl.includes("cloudinary.com")) {
          // Cloudinary URLs are publicly accessible, just fetch directly
          // No need to use the SDK for fetching - secure_url is already public
          try {
            const response = await fetch(templateUrl, {
              headers: {
                "User-Agent": "Mozilla/5.0 (compatible; PDFTemplate/1.0)",
              },
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch from Cloudinary: ${response.status} ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            templateBuffer = Buffer.from(arrayBuffer);
          } catch (fetchErr: any) {
            if (process.env.NODE_ENV === "development") {
              console.error("Cloudinary fetch error:", fetchErr.message);
            }
            throw fetchErr;
          }
        } else {
          // Non-Cloudinary remote URLs
          const response = await fetch(templateUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          templateBuffer = Buffer.from(arrayBuffer);
        }
      } else {
        // Local file path
        const localPath = path.join(
          process.cwd(),
          "public",
          templateUrl.startsWith("/") ? templateUrl.slice(1) : templateUrl
        );
        templateBuffer = await fs.readFile(localPath);
      }
    } catch (fetchErr: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to fetch PDF template:", fetchErr.message);
      }
      return new NextResponse("Failed to load template", { status: 500 });
    }

    // Load template with pdf-lib
    const pdfDoc = await PDFDocument.load(templateBuffer, { ignoreEncryption: true });
    const form = pdfDoc.getForm();

    // Get submitted application data
    const submittedData = typeof application.data === "object" && application.data !== null
      ? (application.data as Record<string, any>)
      : {};

    // Map data to form fields
    const fields = form.getFields();
    for (const field of fields) {
      const fieldName = field.getName();
      
      // Try direct field name match, then snake_case variant
      const matchedValue =
        submittedData[fieldName] ??
        submittedData[fieldName.toLowerCase().replace(/ /g, "_")];

      // Only set text fields with actual string values
      if (
        matchedValue &&
        typeof matchedValue === "string" &&
        !matchedValue.startsWith("/uploads/") &&
        !matchedValue.startsWith("http")
      ) {
        try {
          form.getTextField(fieldName).setText(String(matchedValue));
        } catch {
          // Skip non-text fields or incompatible field types
        }
      }
    }

    // Stamp application number into common known field names
    for (const candidate of ["applicationNo", "application_no", "appNo", "app_number"]) {
      try {
        form.getTextField(candidate).setText(application.applicationNo);
        break;
      } catch {
        // Field doesn't exist, try next candidate
      }
    }

    // Flatten the form so fields become read-only text
    if (fields.length > 0) {
      form.flatten();
    }

    // Save and return the filled PDF
    const pdfBytes = await pdfDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Application_${application.applicationNo}.pdf"`,
      },
    });

  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("PDF route error:", error.message, error.stack);
    }
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
