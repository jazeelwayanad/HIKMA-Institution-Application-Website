"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "./adminAuth";
import { revalidatePath } from "next/cache";

export async function createCourse(data: { title: string, description: string, fee: number }) {
  await requireAdminRoute();
  
  try {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        fee: data.fee,
        status: "DRAFT",
      }
    });
    
    revalidatePath("/admin/courses");
    return { success: true, courseId: course.id };
  } catch (error) {
    return { success: false, error: "Failed to create course." };
  }
}

export async function updateCourseStatus(courseId: string, status: "DRAFT" | "OPEN" | "CLOSED") {
  await requireAdminRoute();
  
  try {
    await prisma.course.update({
      where: { id: courseId },
      data: { status }
    });
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status." };
  }
}

export async function updateCourseDetails(courseId: string, data: { 
  title: string, 
  description: string, 
  fee: number, 
  status?: string, 
  appNumberPrefix?: string, 
  currentAppCounter?: number,
  appNumberDigits?: number,
  requiredDocuments?: any,
  subCourses?: any
}) {
  await requireAdminRoute();

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        description: data.description,
        fee: data.fee,
        ...(data.status && { status: data.status }),
        ...(data.appNumberPrefix !== undefined && { appNumberPrefix: data.appNumberPrefix }),
        ...(data.currentAppCounter !== undefined && { currentAppCounter: data.currentAppCounter }),
        ...(data.appNumberDigits !== undefined && { appNumberDigits: data.appNumberDigits }),
        ...(data.requiredDocuments !== undefined && { requiredDocuments: data.requiredDocuments }),
        ...(data.subCourses !== undefined && { subCourses: data.subCourses })
      }
    });
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update course details." };
  }
}

export async function deleteCourse(courseId: string) {
  await requireAdminRoute();

  try {
    const appCount = await prisma.application.count({ where: { courseId, deletedAt: null } });
    if (appCount > 0) {
      return { success: false, error: `Cannot delete: this course has ${appCount} existing application(s). Close it instead.` };
    }

    // Delete any soft-deleted applications first to prevent foreign key constraint errors
    await prisma.application.deleteMany({ where: { courseId } });

    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete course." };
  }
}
