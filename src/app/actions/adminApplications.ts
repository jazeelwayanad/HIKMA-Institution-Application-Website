"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "./adminAuth";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(applicationId: string, status: string) {
  await requireAdminRoute();

  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status }
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
