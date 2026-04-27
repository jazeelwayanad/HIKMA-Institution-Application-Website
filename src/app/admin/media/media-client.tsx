"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, ExternalLink, User, Trash2, CheckCircle2, Circle, X, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { bulkDeleteMediaFiles } from "@/app/actions/adminApplications";
import { useRouter } from "next/navigation";

type MediaFile = {
  url: string;
  type: 'image' | 'file';
  field: string;
  fieldKey: string;
  appNo: string;
  applicantName: string;
  appId: string;
  course: string;
};

export function MediaLibraryClient({ initialFiles }: { initialFiles: MediaFile[] }) {
  const router = useRouter();
  const [files, setFiles] = useState(initialFiles);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleSelect = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) newSelected.delete(url);
    else newSelected.add(url);
    setSelectedUrls(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUrls.size === files.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(files.map(f => f.url)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUrls.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedUrls.size} selected file(s)? This will remove them from the applications as well.`)) return;

    setIsDeleting(true);
    const filesToDelete = files.filter(f => selectedUrls.has(f.url)).map(f => ({
      appId: f.appId,
      fieldKey: f.fieldKey,
      url: f.url
    }));

    const result = await bulkDeleteMediaFiles(filesToDelete);
    if (result.success) {
      setFiles(files.filter(f => !selectedUrls.has(f.url)));
      setSelectedUrls(new Set());
      router.refresh();
    } else {
      alert("Failed to delete some files.");
    }
    setIsDeleting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media Library</h1>
          <p className="text-slate-500 text-sm">Review all documents and images uploaded via student applications.</p>
        </div>

        {selectedUrls.size > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-bold text-indigo-700">{selectedUrls.size} selected</span>
            <div className="h-4 w-px bg-indigo-200" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedUrls(new Set())}
              className="text-slate-500 hover:text-slate-700 h-8"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 py-2 border-b border-slate-100">
        <Button variant="ghost" size="sm" onClick={toggleSelectAll} className="text-slate-500 gap-2">
          {selectedUrls.size === files.length && files.length > 0 ? <CheckCircle2 className="w-4 h-4 text-indigo-600" /> : <Circle className="w-4 h-4" />}
          {selectedUrls.size === files.length && files.length > 0 ? "Deselect All" : "Select All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {files.map((file, i) => (
          <div key={i} className={`group bg-white rounded-xl border transition-all flex flex-col relative ${selectedUrls.has(file.url) ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
            {/* Selection Checkbox */}
            <div className={`absolute top-3 left-3 z-20 transition-opacity ${selectedUrls.has(file.url) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <Checkbox 
                checked={selectedUrls.has(file.url)} 
                onCheckedChange={() => toggleSelect(file.url)}
                className="bg-white border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
            </div>

            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => setPreviewFile(file)}>
              {file.type === 'image' ? (
                <img src={file.url} alt={file.field} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <FileText className="w-12 h-12 mb-2 text-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                    {file.url.split('.').pop()?.split('?')[0] || 'FILE'}
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                <div className="p-2.5 bg-white rounded-full text-slate-900 hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <ImageIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1">{file.field}</p>
                <p className="text-sm font-bold text-slate-900 truncate" title={file.applicantName}>{file.applicantName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{file.course}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{file.appNo}</span>
                <Link 
                  href={`/admin/applications/${file.appId}`} 
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="View Application"
                >
                  <User className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="py-24 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-bold">No media found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">Once applications start coming in with attachments, they will appear here.</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-950 border-slate-800">
          <DialogHeader className="p-4 bg-slate-900 border-b border-slate-800 flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                 {previewFile?.type === 'image' ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
               </div>
               <div>
                <DialogTitle className="text-white text-base">{previewFile?.field}</DialogTitle>
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
                alt={previewFile.field} 
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
    </div>
  );
}
