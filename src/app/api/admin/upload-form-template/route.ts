import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized: no token" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    // Accept any valid admin token (role can be "admin" or "SUPER_ADMIN")
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized: invalid token" }, { status: 401 });
    }

    const formData = await req.formData();
    const formId = formData.get("formId") as string;
    const file = formData.get("pdf") as File | null;

    if (!formId || !file) {
      return NextResponse.json({ error: "Missing formId or file" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const url = await uploadFile(file);

    await prisma.formTemplate.update({
      where: { id: formId },
      data: { pdfTemplateUrl: url },
    });

    return NextResponse.json({ success: true, url });

  } catch (err: any) {
    console.error("PDF Upload Error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
