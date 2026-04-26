import { prisma } from "@/lib/prisma";
import { ApplyFlowClient } from "./client-page";

export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  // Fetch courses with OPEN status
  const courses = await prisma.course.findMany({
    where: { status: "OPEN" },
    select: {
      id: true,
      title: true,
      description: true,
      fee: true,
      deadline: true,
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Application Portal</h1>
        <p className="mt-4 text-lg text-slate-600">
          Please read the instructions carefully, select your desired program, and begin your application.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Instructions for Applicants</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-600 mb-8">
          <li>Keep required documents ready: SSLC Certificate, Plus Two Certificate, Transfer Certificate, ID proof, and recent photo.</li>
          <li>Fill all details accurately as per official records.</li>
          <li>Select your program carefully; changes may not be allowed after submission.</li>
          <li>Pay the application fee (if applicable). Fees are non-refundable.</li>
          <li>Review your form before submitting.</li>
          <li>After submission, note your Application Number.</li>
          <li><b>Note your Registered Mobile Number and DOB to check status of your application.</b></li>
          <li>Agree to the declaration confirming all information is true.</li>
        </ul>

        {/* Client component for the interactive flow (Select Course -> Checkbox -> Next) */}
        <ApplyFlowClient courses={courses.map((c: typeof courses[0]) => ({
          ...c,
          deadline: c.deadline?.toISOString() ?? null
        }))} />
      </div>
    </div>
  );
}
