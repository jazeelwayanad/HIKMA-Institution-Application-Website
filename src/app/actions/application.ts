"use server";

import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";

export async function submitApplication(formData: FormData, schema: any[]) {
  try {
    const courseId = formData.get("courseId") as string;
    const dobString = formData.get("dob") as string;

    if (!courseId || !dobString) {
      return { success: false, error: "Missing crucial basic information." };
    }

    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      return { success: false, error: "Invalid Date of Birth." };
    }

    // Iterate through schema and extract fields
    const applicantData: Record<string, any> = {};
    let applicantName = "Unknown";

    for (const field of schema) {
      const data = formData.get(field.name);
      
      // If it's a file
      if (field.type === "file") {
        const file = data as File | null;
        if (file && file.size > 0 && file.name !== "undefined") {
          // Upload file via Storage Provider
          const url = await uploadFile(file);
          applicantData[field.name] = url;
        } else if (field.required) {
          return { success: false, error: `Required file ${field.label} is missing.` };
        }
      } else {
        // Standard text, number, select
        if (field.required && (!data || data === "")) {
          return { success: false, error: `Required field ${field.label} is missing.` };
        }
        applicantData[field.name] = data;

        // Best effort to find a semantic name for general dashboard viewing
        if (field.name.toLowerCase().includes("name") && data) {
           applicantName = data.toString();
        }
      }
    }

    // Atomic auto-increment mechanism for standard AppNumbers via Prisma Transactions
    const applicationNo = await prisma.$transaction(async (tx) => {
      let settings = await tx.systemSettings.findFirst();
      if (!settings) {
        settings = await tx.systemSettings.create({ data: {} });
      }

      const nextId = settings.currentAppCounter + 1;
      await tx.systemSettings.update({
        where: { id: settings.id },
        data: { currentAppCounter: nextId }
      });

      return `${settings.appNumberPrefix}${nextId}`;
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

  } catch (err: any) {
    console.error("Submission error:", err);
    return { success: false, error: "An interval server error occurred saving your application." };
  }
}
