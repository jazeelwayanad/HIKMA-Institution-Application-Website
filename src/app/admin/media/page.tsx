import { prisma } from "@/lib/prisma";
import { MediaLibraryClient } from "./media-client";

export default async function MediaPage() {
  const applications = await prisma.application.findMany({
    where: { deletedAt: null },
    include: { course: true },
    orderBy: { createdAt: 'desc' }
  });

  const mediaFiles: any[] = [];

  applications.forEach(app => {
    if (app.data && typeof app.data === 'object') {
      const data = app.data as Record<string, any>;
      for (const key in data) {
        const val = data[key];
        if (typeof val === 'string' && (val.includes('cloudinary.com') || val.startsWith('/uploads/'))) {
          const isImage = val.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || key === 'photo';
          mediaFiles.push({
            url: val,
            type: isImage ? 'image' : 'file',
            field: key.replace('doc_', '').replace(/_/g, ' ').toUpperCase(),
            fieldKey: key,
            appNo: app.applicationNo,
            applicantName: (data.full_name as string) || 'Unknown',
            appId: app.id,
            course: app.course.title
          });
        }
      }
    }
  });

  return (
    <div className="p-4 md:p-8">
      <MediaLibraryClient initialFiles={mediaFiles} />
    </div>
  );
}
