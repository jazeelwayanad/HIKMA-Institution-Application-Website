import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteCourse } from "@/app/actions/adminCourses";
import { redirect } from "next/navigation";
import { Eye, Trash2, ExternalLink } from "lucide-react";

export default async function CoursesManager() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Programs &amp; Courses</h1>
          <p className="text-slate-500 mt-1">Manage active programs and their dynamic application forms.</p>
        </div>
        <form action={async () => {
          "use server";
          const res = await createCourse({ title: "New Program Draft", description: "", fee: 0, formTemplateId: "" });
          if(res.success) {
            redirect(`/admin/courses/${res.courseId}`);
          }
        }}>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Create New Course</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {courses.length === 0 ? (
           <div className="p-12 text-center text-slate-500">No courses available. Create your first one.</div>
        ) : (
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
               <tr>
                 <th className="px-6 py-4">Program Name</th>
                 <th className="px-6 py-4">Status</th>
                 {/* <th className="px-6 py-4">Fee</th> */}
                 <th className="px-6 py-4">Applications</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {courses.map(course => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link href={`/admin/courses/${course.id}`} className="hover:text-indigo-600 transition-colors">
                        {course.title}
                      </Link>
                    </td>
                   <td className="px-6 py-4">
                     {course.status === 'OPEN' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Open</Badge>}
                     {course.status === 'DRAFT' && <Badge variant="outline" className="text-slate-500 border-slate-300">Draft</Badge>}
                     {course.status === 'CLOSED' && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Closed</Badge>}
                   </td>
                   {/* <td className="px-6 py-4 text-slate-500">{course.fee && course.fee > 0 ? `$${course.fee}` : "Free"}</td> */}
                   <td className="px-6 py-4 text-slate-500">
                     <Link href={`/admin/applications?courseId=${course.id}`} className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                       {course._count.applications} received
                     </Link>
                   </td>
                   <td className="px-6 py-4">
                     <div className="flex items-center justify-end gap-2">
                       {/* View admin course details */}
                       <Button size="sm" variant="ghost" asChild className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" title="View / Edit Course Details">
                         <Link href={`/admin/courses/${course.id}`}>
                           <Eye className="w-4 h-4" />
                         </Link>
                       </Button>

                       {/* Preview public application page */}
                       <Button size="sm" variant="ghost" asChild className="text-slate-400 hover:text-indigo-700 hover:bg-indigo-50" title="Preview Public Page">
                         <Link href={`/apply/${course.id}`} target="_blank">
                           <ExternalLink className="w-4 h-4" />
                         </Link>
                       </Button>

                       {/* Delete course */}
                       <form action={async () => {
                         "use server";
                         const result = await deleteCourse(course.id);
                         if (!result.success) {
                           console.error(result.error);
                         }
                       }}>
                         <Button
                           type="submit"
                           size="sm"
                           variant="ghost"
                           className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                           title={course._count.applications > 0 ? "Cannot delete: has applications" : "Delete Course"}
                           disabled={course._count.applications > 0}
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </form>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
      </div>
    </div>
  );
}
