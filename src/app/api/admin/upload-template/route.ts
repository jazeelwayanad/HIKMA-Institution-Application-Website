import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// This route is called by the Course Builder's PDF upload tab
// It accepts courseId (not formId) and updates the course's formTemplate pdfTemplateUrl
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized: invalid token" }, { status: 401 });
    }

    const formData = await req.formData();
    const courseId = formData.get("courseId") as string;
    const file = formData.get("pdf") as File | null;

    if (!courseId || !file) {
      return NextResponse.json({ error: "Missing courseId or file" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Upload the file (Cloudinary or local fallback)
    const url = await uploadFile(file);

    // Find the course's linked form template and update its pdfTemplateUrl
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { formTemplateId: true },
    });

    if (!course?.formTemplateId) {
      return NextResponse.json(
        { error: "This course has no form template attached. Please link a Form Template first." },
        { status: 400 }
      );
    }

    await prisma.formTemplate.update({
      where: { id: course.formTemplateId },
      data: { pdfTemplateUrl: url },
    });

    return NextResponse.json({ success: true, url });

  } catch (err: any) {
    console.error("PDF Upload Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
