"use client";

import { useState } from "react";
import { ImageIcon, FileText, Download, ExternalLink, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MediaPreview({ 
  url, 
  label, 
  type = 'image', 
  applicantName, 
  appNo,
  children
}: { 
  url: string, 
  label: string, 
  type?: 'image' | 'file', 
  applicantName?: string, 
  appNo?: string,
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800">
          <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                 {type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
               </div>
               <div>
                <DialogTitle className="text-white text-base">{label}</DialogTitle>
                {applicantName && <p className="text-slate-400 text-xs mt-0.5">{applicantName} {appNo ? `• ${appNo}` : ''}</p>}
               </div>
            </div>
            <div className="flex items-center gap-2 pr-8">
              <a 
                href={url} 
                download 
                target="_blank"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <a 
                href={url} 
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
            {type === 'image' ? (
              <img 
                src={url} 
                alt={label} 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              />
            ) : (
              <iframe 
                src={url} 
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
