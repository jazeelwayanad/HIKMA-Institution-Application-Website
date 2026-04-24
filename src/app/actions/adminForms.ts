"use server";

import { prisma } from "@/lib/prisma";
import { requireAdminRoute } from "./adminAuth";
import { revalidatePath } from "next/cache";

export async function createFormTemplate(formData: FormData) {
  await requireAdminRoute();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { success: false, error: "Form name is required" };
  }

  try {
    const newForm = await prisma.formTemplate.create({
      data: {
        name,
        description,
        formSchema: [
          {
            id: `f_name_${Date.now()}`,
            name: "full_name",
            label: "Full Name",
            type: "text",
            required: true,
            isProtected: true,
            placeholder: "e.g. Jane Doe"
          },
          {
            id: `f_mobile_${Date.now()}`,
            name: "mobile_number",
            label: "Mobile Number",
            type: "text",
            required: true,
            isProtected: true,
            placeholder: "e.g. +1 234 567 8900"
          },
          {
            id: `f_dob_${Date.now()}`,
            name: "dob",
            label: "Date of Birth",
            type: "date",
            required: true,
            isProtected: true,
          }
        ]
      }
    });

    revalidatePath("/admin/forms");
    return { success: true, id: newForm.id };
  } catch (error) {
    return { success: false, error: "Failed to create form template" };
  }
}

export async function updateFormSchema(formId: string, schema: any[]) {
  await requireAdminRoute();

  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { formSchema: schema }
    });
    revalidatePath(`/admin/forms/${formId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update schema" };
  }
}

export async function updateFormDetails(formId: string, data: { name: string, description: string }) {
  await requireAdminRoute();

  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: {
        name: data.name,
        description: data.description,
      }
    });
    revalidatePath(`/admin/forms/${formId}`);
    revalidatePath("/admin/forms");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update form details." };
  }
}

export async function attachFormPdfTemplate(formId: string, pdfUrl: string) {
  await requireAdminRoute();
  
  try {
    await prisma.formTemplate.update({
      where: { id: formId },
      data: { pdfTemplateUrl: pdfUrl }
    });
    revalidatePath(`/admin/forms/${formId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to attach PDF." };
  }
}

export async function deleteFormTemplate(formId: string) {
  await requireAdminRoute();

  try {
    // Unlink from any courses that might be using this template
    await prisma.course.updateMany({
      where: { formTemplateId: formId },
      data: { formTemplateId: null }
    });

    await prisma.formTemplate.delete({
      where: { id: formId }
    });

    revalidatePath("/admin/forms");
    revalidatePath("/admin/courses");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete form template." };
  }
}
