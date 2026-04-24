"use server";

import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginStudent(mobile: string, dobString: string) {
  const dob = new Date(dobString);

  // We are searching for an application where the "mobile_number" in JSON matches the given mobile
  // and the DOB matches exactly. Using Prisma's powerful JSON filtering for PG.
  const application = await prisma.application.findFirst({
    where: {
      data: {
        path: ['mobile_number'],
        equals: mobile
      },
      // In JS, dates are tricky. We want to match exactly if we assume they are stored correctly, 
      // but to be safe, finding by exact Date object usually works for DATE type columns in Postgres.
      dob: {
        equals: dob
      }
    }
  });

  if (!application) {
    return { success: false, error: "No matching application found. Check your mobile number and Date of Birth." };
  }

  // Create JWT for the student session
  const token = await signToken({ sub: application.id, role: "applicant", appNo: application.applicationNo });
  
  const cookieStore = await cookies();
  cookieStore.set({
    name: "student_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 // 24 hours
  });

  return { success: true };
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete("student_token");
  redirect("/status");
}

export async function getStudentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("student_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "applicant") return null;

  return payload;
}
