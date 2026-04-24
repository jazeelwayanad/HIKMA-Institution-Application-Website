"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "./adminAuth";
import { revalidatePath } from "next/cache";

export async function createStatus(label: string, color: string, description?: string) {
  await requireAdminRoute();
  
  const value = label.toUpperCase().replace(/\s+/g, "_");
  
  try {
    await prisma.applicationStatus.create({
      data: { label, value, color, description: description || null }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Status already exists or failed to create." };
  }
}

export async function updateStatus(id: string, label: string, color: string, description?: string) {
  await requireAdminRoute();
  const value = label.toUpperCase().replace(/\s+/g, "_");
  try {
    await prisma.applicationStatus.update({
      where: { id },
      data: { label, value, color, description: description || null }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function deleteStatus(id: string) {
  await requireAdminRoute();
  
  try {
    await prisma.applicationStatus.delete({
      where: { id }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin/applications");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete status." };
  }
}

export async function initializeDefaultStatuses() {
  const defaults = [
    { label: "Pending", value: "PENDING", color: "amber" },
    { label: "Approved", value: "APPROVED", color: "emerald" },
    { label: "Rejected", value: "REJECTED", color: "red" },
  ];
  
  for (const status of defaults) {
    await prisma.applicationStatus.upsert({
      where: { value: status.value },
      update: {},
      create: status,
    });
  }
}
