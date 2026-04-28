"use server";

import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";
import { getStudentSession } from "@/app/actions/auth";

export async function submitApplication(formData: FormData) {
  try {
    const courseId = formData.get("courseId") as string;
    const dobString = formData.get("dob") as string;
    const editId = formData.get("editId") as string | null;

    if (!courseId || !dobString) {
      return { success: false, error: "Missing crucial basic information." };
    }

    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      return { success: false, error: "Invalid Date of Birth." };
    }

    let existingApplication = null;
    let existingData: Record<string, any> = {};

    if (editId) {
      const session = await getStudentSession();
      if (!session || session.sub !== editId) {
        return { success: false, error: "Unauthorized to edit this application." };
      }

      existingApplication = await prisma.application.findUnique({
        where: { id: editId }
      });

      if (!existingApplication) {
        return { success: false, error: "Application not found." };
      }

      const settings = await prisma.systemSettings.findFirst();
      if (!existingApplication.isEditable && !settings?.globalEditSubmissions) {
        return { success: false, error: "This application is not currently editable." };
      }

      existingData = typeof existingApplication.data === 'object' && existingApplication.data !== null ? existingApplication.data as Record<string, any> : {};
    }

    const applicantData: Record<string, any> = { ...existingData };
    const uploadPromises: Promise<{key: string, url: string}>[] = [];
    const deletePromises: Promise<void>[] = [];

    // Extract all fields from FormData
    for (const [key, value] of Array.from(formData.entries())) {
      if (key === "courseId" || key === "editId") continue;
      
      const isFile = typeof value === "object" && value !== null && "size" in value && "name" in value;
      
      if (isFile) {
        const fileValue = value as unknown as File;
        if (fileValue.size > 0 && fileValue.name !== "undefined") {
          // If there's an existing file for this key, delete it
          if (applicantData[key]) {
            deletePromises.push(deleteFile(applicantData[key]));
          }
          // Collect upload promise
          uploadPromises.push(
            uploadFile(fileValue).then(url => ({ key, url }))
          );
        }
      } else {
        // If it's a new pre-uploaded URL replacing an old one, delete the old file
        if (typeof value === "string" && value.startsWith("http") && applicantData[key] && applicantData[key] !== value && applicantData[key].startsWith("http")) {
          deletePromises.push(deleteFile(applicantData[key]));
        }
        applicantData[key] = value;
      }
    }

    // Wait for all uploads and deletions to complete in parallel
    const [uploadedFiles] = await Promise.all([
      Promise.all(uploadPromises),
      Promise.all(deletePromises)
    ]);
    
    uploadedFiles.forEach(({ key, url }) => {
      applicantData[key] = url;
    });




    if (editId && existingApplication) {
      // Update existing application
      const updatedApplication = await prisma.application.update({
        where: { id: editId },
        data: {
          dob,
          data: applicantData,
        }
      });

      return { success: true, appNo: updatedApplication.applicationNo, applicationId: updatedApplication.id };
    } else {
      // Create new application
      // Atomic auto-increment mechanism for course-specific AppNumbers via Prisma Transactions
      const applicationNo = await (prisma as any).$transaction(async (tx: any) => {
        const course = await tx.course.findUnique({
          where: { id: courseId }
        });

        if (!course) {
          throw new Error("Course not found");
        }

        const nextId = course.currentAppCounter + 1;
        await tx.course.update({
          where: { id: courseId },
          data: { currentAppCounter: nextId }
        });

        const paddedId = course.appNumberDigits > 0 
          ? String(nextId).padStart(course.appNumberDigits, '0') 
          : String(nextId);
          
        const cleanPrefix = course.appNumberPrefix.replace(/-+$/, '');
        return cleanPrefix ? `${cleanPrefix}-${paddedId}` : paddedId;
      });

      // Save Application
      const application = await prisma.application.create({
        data: {
          applicationNo,
          courseId,
          dob,
          data: applicantData,
        }
      });

      return { success: true, appNo: applicationNo, applicationId: application.id };
    }

  } catch (err: any) {
    console.error("Submission error:", err);
    return { success: false, error: "An internal server error occurred saving your application." };
  }
}
