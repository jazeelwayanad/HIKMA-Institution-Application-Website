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
export async function deleteFile(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  // Handle local storage deletion
  if (fileUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Local file deletion error:", error);
      }
    }
    return;
  }

  // Handle Cloudinary deletion
  if (isCloudinaryConfigured && fileUrl.includes("cloudinary.com")) {
    try {
      const publicId = extractPublicId(fileUrl);
      if (publicId) {
        await new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Cloudinary file deletion error:", error);
      }
    }
  }
}

function extractPublicId(url: string): string | null {
  // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/[resource_type]/upload/v[version]/[folder]/[filename].[ext]
  // We want "[folder]/[filename]"
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // The public ID starts after the version (v[digits])
    // Or directly after "upload" if no version is present
    let publicIdWithExt = "";
    if (parts[uploadIndex + 1].startsWith("v") && /^\d+$/.test(parts[uploadIndex + 1].substring(1))) {
      publicIdWithExt = parts.slice(uploadIndex + 2).join("/");
    } else {
      publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
    }

    // Remove extension
    const lastDotIndex = publicIdWithExt.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      return publicIdWithExt.substring(0, lastDotIndex);
    }
    return publicIdWithExt;
  } catch {
    return null;
  }
}
