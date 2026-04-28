"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, ExternalLink, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type MediaFile = {
  url: string;
  label: string;
  type: 'image' | 'file';
  applicantName: string;
  appNo: string;
};

export function ApplicationDataClient({ formData, applicantName, appNo, variant = 'admin' }: { 
  formData: Record<string, any>, 
  applicantName: string, 
  appNo: string,
  variant?: 'admin' | 'student'
}) {
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const orderedKeys = [
    "photo",
    "full_name",
    "dob",
    "father_name",
    "mother_name",
    "mother_mobile",
    "guardian_name",
    "guardian_relation",
    "guardian_mobile",
    "house_name",
    "place",
    "post_office",
    "district",
    "whatsapp_number",
    "marital_status",
    "madrasa_qualification",
    "last_school_name",
    "sslc_hse_reg_number",
    "course_selected",
    "sub_course",
    "remarks"
  ];

  const entries = Object.entries(formData).filter(([key]) => key !== 'adminNote').sort(([keyA], [keyB]) => {
    const indexA = orderedKeys.indexOf(keyA);
    const indexB = orderedKeys.indexOf(keyB);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Group documents at the end if not explicitly ordered
    if (keyA.startsWith('doc_') && !keyB.startsWith('doc_')) return 1;
    if (!keyA.startsWith('doc_') && keyB.startsWith('doc_')) return -1;
    
    return keyA.localeCompare(keyB);
  });


  return (
    <>
      <dl className={variant === 'student' ? "flex flex-col gap-2" : "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"}>
        {entries.map(([key, value]: [string, any]) => {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim();
          const lowerKey = key.toLowerCase();
          const isUrl = typeof value === 'string' && (value.startsWith('/uploads/') || (value as string).includes('http'));
          const isImage = isUrl && (
            /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(value as string) ||
            lowerKey.includes('photo') || lowerKey.includes('pic') || lowerKey.includes('image')
          );

          if (variant === 'student') {
            return (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start mb-2">
                <dt className="w-full sm:w-[220px] shrink-0 text-[13px] font-medium text-[#2d3748] uppercase tracking-wide mb-1 sm:mb-0 sm:mt-1.5">
                  {label}
                </dt>
                <dd className="flex-1 min-h-[30px] border border-[#a0aec0] rounded-[6px] bg-white px-3 py-1.5 flex items-center text-[14px] font-medium text-[#1a202c] shadow-sm break-words overflow-hidden">
                  {isImage ? (
                    <div className="flex items-start gap-4">
                      <div 
                        className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 bg-slate-50 cursor-pointer hover:border-indigo-300 transition-colors"
                        onClick={() => setPreviewFile({ url: value, label, type: 'image', applicantName, appNo })}
                      >
                        <img src={value as string} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center h-16">
                        <button 
                          onClick={() => setPreviewFile({ url: value, label, type: 'image', applicantName, appNo })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-xs font-semibold"
                        >
                          Preview Image
                        </button>
                      </div>
                    </div>
                  ) : isUrl ? (
                    <button 
                      onClick={() => setPreviewFile({ url: value, label, type: 'file', applicantName, appNo })}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline break-all text-left font-semibold text-[13px]"
                    >
                      Preview Document
                    </button>
                  ) : (
                    <span className="whitespace-pre-wrap">{String(value)}</span>
                  )}
                </dd>
              </div>
            );
          }

          return (
            <div key={key} className={isUrl ? "md:col-span-2" : ""}>
              <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</dt>
              <dd className="text-slate-900 font-medium whitespace-pre-wrap">
                {isImage ? (
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-28 h-28 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm bg-slate-50 flex-shrink-0 cursor-pointer hover:border-indigo-300 transition-colors"
                      onClick={() => setPreviewFile({ url: value, label, type: 'image', applicantName, appNo })}
                    >
                      <img src={value as string} alt={label} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      <button 
                        onClick={() => setPreviewFile({ url: value, label, type: 'image', applicantName, appNo })}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm font-semibold"
                      >
                        <ImageIcon className="w-4 h-4" />
                        Preview Image
                      </button>
                    </div>
                  </div>
                ) : isUrl ? (
                  <button 
                    onClick={() => setPreviewFile({ url: value, label, type: 'file', applicantName, appNo })}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors text-sm font-semibold"
                  >
                    <FileText className="w-4 h-4" />
                    Preview Document
                  </button>
                ) : (
                  String(value) || <span className="text-slate-300 italic">Not provided</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800">
          <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                 {previewFile?.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
               </div>
               <div>
                <DialogTitle className="text-white text-base">{previewFile?.label}</DialogTitle>
                <p className="text-slate-400 text-xs mt-0.5">{previewFile?.applicantName} • {previewFile?.appNo}</p>
               </div>
            </div>
            <div className="flex items-center gap-2 pr-8">
              <a 
                href={previewFile?.url} 
                download 
                target="_blank"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <a 
                href={previewFile?.url} 
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            {previewFile?.type === 'image' ? (
              <img 
                src={previewFile.url} 
                alt={previewFile.label} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            ) : (
              <iframe 
                src={previewFile?.url} 
                className="w-full h-full bg-white rounded-lg shadow-2xl"
                title="File Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
