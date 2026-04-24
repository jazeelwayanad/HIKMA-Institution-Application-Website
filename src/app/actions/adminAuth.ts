"use server";

import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// @ts-ignore
import * as bcrypt from "bcryptjs";

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { success: false, error: "Missing credentials" };

  const admin = await prisma.admin.findUnique({ where: { email } });
  
  if (!admin) {
    return { success: false, error: "Invalid email or password." };
  }

  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    return { success: false, error: "Invalid email or password." };
  }

  const token = await signToken({ sub: admin.id, role: admin.role, adminRole: "admin", email: admin.email });
  
  const cookieStore = await cookies();
  cookieStore.set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return { success: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin-login");
}

export async function requireAdminRoute() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) redirect("/admin-login");

  const payload = await verifyToken(token);
  if (!payload || payload.adminRole !== "admin") redirect("/admin-login");

  return payload;
}

export async function updateAdminProfile(adminId: string, data: { email?: string; password?: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return { success: false, error: "Unauthorized" };

  const payload = await verifyToken(token);
  if (!payload || payload.sub !== adminId) {
    return { success: false, error: "Unauthorized" };
  }

  const updateData: any = {};

  if (data.email) {
    const existing = await prisma.admin.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== adminId) {
      return { success: false, error: "Email already in use" };
    }
    updateData.email = data.email;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, error: "No changes provided" };
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: updateData,
  });

  return { success: true };
}
