"use server";

import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

// Basic SHA-256 for rapid auth scaffolding. A real app uses bcrypt.
function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function loginAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { success: false, error: "Missing credentials" };

  // Auto-seed an admin if database is entirely empty (UX Helper)
  const adminCount = await prisma.admin.count();
  if (adminCount === 0 && email === "alwardavga@gmail.com" && password === "password") {
    await prisma.admin.create({
      data: {
        email: "alwardavga@gmail.com",
        password: hashPassword("password"),
        role: "SUPER_ADMIN"
      }
    });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  
  if (!admin || admin.password !== hashPassword(password)) {
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
