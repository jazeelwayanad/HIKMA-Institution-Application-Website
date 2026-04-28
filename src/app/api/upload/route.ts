import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const previousUrl = formData.get("previousUrl") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Delete previous file if provided to avoid orphaned files on Cloudinary/Local
    if (previousUrl && (previousUrl.startsWith("http") || previousUrl.startsWith("/uploads/"))) {
      try {
        await deleteFile(previousUrl);
      } catch (err) {
        console.error("Failed to delete previous file:", err);
      }
    }

    const url = await uploadFile(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
