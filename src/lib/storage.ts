import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

// Configuration
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else if (process.env.NODE_ENV === "development") {
  console.warn("Cloudinary credentials missing. Falling back to local storage.");
}

export async function uploadFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Fallback to local storage if Cloudinary is not configured
  if (!isCloudinaryConfigured) {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try { await fs.access(uploadDir); } catch { await fs.mkdir(uploadDir, { recursive: true }); }

    const ext = path.extname(file.name) || ".tmp";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const fileName = `${uniqueId}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, buffer);
    return `/uploads/${fileName}`;
  }

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "application_portal",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Cloudinary upload error:", error);
          }
          reject(new Error("Failed to upload file. Please check your credentials."));
        } else {
          resolve(result!.secure_url);
        }
      }
    );
    uploadStream.end(buffer);
  });
}
