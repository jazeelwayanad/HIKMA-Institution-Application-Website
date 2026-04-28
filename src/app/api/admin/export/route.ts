import { NextRequest, NextResponse } from "next/server";
import { requireAdminRoute } from "@/app/actions/adminAuth";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Authenticate Admin
    await requireAdminRoute();

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format") || "excel";
    const courseId = searchParams.get("courseId");

    const applications = await prisma.application.findMany({
      where: courseId ? { courseId } : undefined,
      include: { course: true },
      orderBy: { createdAt: "desc" }
    });

    if (applications.length === 0) {
      return NextResponse.json({ error: "No applications found to export." }, { status: 404 });
    }

    if (format === "excel") {
      // Flatten data for Excel
      const exportData = applications.map((app) => {
        const baseData = {
          "Application ID": app.applicationNo,
          "Course": app.course.title,
          "Status": app.status,
          "Submitted Date": app.createdAt.toLocaleDateString(),
          "Applicant DOB": app.dob.toLocaleDateString(),
        };

        // Attempt to extract dynamic data cleanly
        const parsedData = app.data ? { ...(app.data as Record<string, any>) } : {};
        
        if (parsedData.course_selected && app.course) {
          parsedData.course_selected = app.course.title;
        }
        // Merge without overwriting base
        return {
          ...baseData,
          ...parsedData
        };
      });

      // Create workbook
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Applications");

      // Generate buffer
      const buf = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      return new NextResponse(buf, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="Applications_Export_${new Date().getTime()}.xlsx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}
