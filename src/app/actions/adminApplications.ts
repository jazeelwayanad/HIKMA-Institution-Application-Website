"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "./adminAuth";
import { revalidatePath } from "next/cache";
import { uploadFile, deleteFile } from "@/lib/storage";

export async function adminSubmitApplication(formData: FormData) {
  await requireAdminRoute();

  try {
    const editId = formData.get("editId") as string;
    const dobString = formData.get("dob") as string;

    if (!editId) return { success: false, error: "Missing application ID." };

    const dob = dobString ? new Date(dobString) : undefined;

    const existingApp = await prisma.application.findUnique({ where: { id: editId } });
    if (!existingApp) return { success: false, error: "Application not found." };

    const existingData: Record<string, any> =
      typeof existingApp.data === "object" && existingApp.data !== null
        ? (existingApp.data as Record<string, any>)
        : {};

    const applicantData: Record<string, any> = { ...existingData };
    const uploadPromises: Promise<{key: string, url: string}>[] = [];

    for (const [key, value] of Array.from(formData.entries())) {
      if (["courseId", "editId", "declaration_agreed"].includes(key)) continue;
      const isFile =
        typeof value === "object" &&
        value !== null &&
        "size" in value &&
        "name" in value;
      if (isFile) {
        const fileValue = value as unknown as File;
        if (fileValue.size > 0 && fileValue.name !== "undefined") {
          // If there's an existing file for this key, delete it
          if (applicantData[key]) {
            await deleteFile(applicantData[key]);
          }
          // Collect upload promise
          uploadPromises.push(
            uploadFile(fileValue).then(url => ({ key, url }))
          );
        }
      } else {
        applicantData[key] = value;
      }
    }

    // Wait for all uploads to complete in parallel
    const uploadedFiles = await Promise.all(uploadPromises);
    uploadedFiles.forEach(({ key, url }) => {
      applicantData[key] = url;
    });

    const updateData: any = { data: applicantData };
    if (dob && !isNaN(dob.getTime())) updateData.dob = dob;
    // Allow admin to reassign the application to a different course
    const newCourseId = formData.get("courseId") as string | null;
    if (newCourseId && newCourseId !== existingApp.courseId) {
      updateData.courseId = newCourseId;
    }

    const updated = await prisma.application.update({
      where: { id: editId },
      data: updateData,
    });

    revalidatePath(`/admin/applications/${editId}`);
    revalidatePath("/admin/applications");
    return { success: true, appNo: updated.applicationNo, applicationId: updated.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update application." };
  }
}



export async function updateApplicationStatus(applicationId: string, status: string, adminNote?: string) {
  await requireAdminRoute();

  try {
    const dataUpdate: any = { status };
    
    if (adminNote !== undefined) {
      const app = await prisma.application.findUnique({ where: { id: applicationId } });
      if (app) {
        const existingData = typeof app.data === 'object' && app.data !== null ? app.data as Record<string, any> : {};
        existingData.adminNote = adminNote;
        dataUpdate.data = existingData;
      }
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: dataUpdate
    });

    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteApplication(applicationId: string) {
  await requireAdminRoute();
  
  try {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (app && app.data && typeof app.data === 'object') {
      const data = app.data as Record<string, any>;
      for (const key in data) {
        const val = data[key];
        if (typeof val === 'string' && (val.includes('cloudinary.com') || val.startsWith('/uploads/'))) {
          await deleteFile(val);
        }
      }
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { deletedAt: new Date() }
    });
    
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete application." };
  }
}

export async function updateApplicationData(applicationId: string, data: any) {
  await requireAdminRoute();
  
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { data }
    });
    
    revalidatePath("/admin/applications");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update application data." };
  }
}
export async function bulkUpdateApplicationStatuses(applicationIds: string[], status: string) {
  await requireAdminRoute();

  try {
    await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { status }
    });

    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update statuses." };
  }
}

export async function bulkDeleteApplications(applicationIds: string[]) {
  await requireAdminRoute();
  
  try {
    const apps = await prisma.application.findMany({
      where: { id: { in: applicationIds } }
    });

    for (const app of apps) {
      if (app.data && typeof app.data === 'object') {
        const data = app.data as Record<string, any>;
        for (const key in data) {
          const val = data[key];
          if (typeof val === 'string' && (val.includes('cloudinary.com') || val.startsWith('/uploads/'))) {
            await deleteFile(val);
          }
        }
      }
    }

    await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { deletedAt: new Date() }
    });
    
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete applications." };
  }
}

export async function deleteMediaFile(applicationId: string, fieldKey: string, fileUrl: string) {
  await requireAdminRoute();

  try {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) return { success: false, error: "Application not found." };

    const data = typeof app.data === 'object' && app.data !== null ? { ...(app.data as Record<string, any>) } : {};
    
    // Find the actual key in the data object
    if (data[fieldKey] === fileUrl) {
      delete data[fieldKey];
    } else {
      // Fallback search
      for (const k in data) {
        if (data[k] === fileUrl) {
          delete data[k];
          break;
        }
      }
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { data }
    });

    await deleteFile(fileUrl);

    revalidatePath("/admin/media");
    revalidatePath(`/admin/applications/${applicationId}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete media file." };
  }
}

export async function bulkDeleteMediaFiles(files: { appId: string, fieldKey: string, url: string }[]) {
  await requireAdminRoute();

  try {
    for (const file of files) {
      await deleteMediaFile(file.appId, file.fieldKey, file.url);
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete some media files." };
  }
}
