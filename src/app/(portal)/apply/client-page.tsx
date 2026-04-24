"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CourseType = {
  id: string;
  title: string;
  description: string | null;
  fee: number | null;
  deadline: string | null;
};

export function ApplyFlowClient({ courses }: { courses: CourseType[] }) {
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const handleNext = () => {
    if (selectedCourseId && agreed) {
      router.push(`/apply/${selectedCourseId}`);
    }
  };

  return (
    <div className="space-y-8 mt-8 border-t pt-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">1. Select a Program</h3>
        {courses.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed rounded-lg bg-slate-50">
            <p className="text-slate-500">There are currently no programs open for application.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Card 
                key={course.id} 
                className={`cursor-pointer transition-all duration-200 ${selectedCourseId === course.id ? 'ring-2 ring-indigo-600 bg-indigo-50/50' : 'hover:border-indigo-300'}`}
                onClick={() => setSelectedCourseId(course.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    {selectedCourseId === course.id && (
                       <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    )}
                  </div>
                  {course.deadline && (
                     <CardDescription className="text-amber-600 font-medium text-xs mt-1">
                        Deadline: {new Date(course.deadline).toLocaleDateString()}
                     </CardDescription>
                  )}
                </CardHeader>
                {/* <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {course.description || "No description available."}
                  </p>
                  <div className="font-medium text-sm text-slate-800 mt-2">
                    Fee: {course.fee && course.fee > 0 ? `$${course.fee}` : "Free"}
                  </div>
                </CardContent> */}
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">2. Declaration</h3>
        <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Checkbox 
            id="terms" 
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(checked === true)}
            className="mt-1"
          />
          <Label htmlFor="terms" className="text-sm font-medium leading-relaxed text-slate-700 cursor-pointer">
            I agree that all information I provide in the following application is true and accurate. 
            I understand that any false information may lead to rejection of my application.
          </Label>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button 
          size="lg" 
          disabled={!selectedCourseId || !agreed}
          onClick={handleNext}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-8"
        >
          Begin Application
        </Button>
      </div>
    </div>
  );
}
