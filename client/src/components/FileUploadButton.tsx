import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image, Film, Check, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadButtonProps {
  maxFiles?: number;
  maxFileSize?: number;
  acceptedTypes?: string;
  onFilesUploaded?: (urls: string[]) => void;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonClassName?: string;
  children: ReactNode;
}

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
}

export function FileUploadButton({
  maxFiles = 5,
  maxFileSize = 52428800,
  acceptedTypes = "image/*,video/*",
  onFilesUploaded,
  buttonVariant = "outline",
  buttonSize = "default",
  buttonClassName,
  children,
}: FileUploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      
      await fetch(data.uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      
      const normalizedResponse = await apiRequest("POST", "/api/objects/normalize", {
        rawPath: data.uploadURL.split("?")[0],
      });
      const normalized = await normalizedResponse.json();
      return normalized.objectPath;
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles
      .filter(file => file.size <= maxFileSize)
      .slice(0, maxFiles - files.length);

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      progress: 0,
      status: "uploading" as const,
    }));

    const startIndex = files.length;
    setFiles(prev => [...prev, ...newFiles]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    for (let i = 0; i < newFiles.length; i++) {
      const fileIndex = startIndex + i;
      try {
        const url = await uploadMutation.mutateAsync(newFiles[i].file);
        setFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = { ...updated[fileIndex], status: "success", progress: 100, url };
          }
          return updated;
        });
      } catch (error) {
        setFiles(prev => {
          const updated = [...prev];
          if (updated[fileIndex]) {
            updated[fileIndex] = { ...updated[fileIndex], status: "error", progress: 0 };
          }
          return updated;
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "success") {
        if (files[i].url) uploadedUrls.push(files[i].url as string);
        continue;
      }

      setFiles(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: "uploading", progress: 30 };
        return updated;
      });

      try {
        const url = await uploadMutation.mutateAsync(files[i].file);
        uploadedUrls.push(url);
        
        setFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "success", progress: 100, url };
          return updated;
        });
      } catch (error) {
        setFiles(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: "error", progress: 0 };
          return updated;
        });
      }
    }

    if (uploadedUrls.length > 0 && onFilesUploaded) {
      onFilesUploaded(uploadedUrls);
    }
  };

  const allUploaded = files.length > 0 && files.every(f => f.status === "success");
  const hasFiles = files.length > 0;
  const canAddMore = files.length < maxFiles;

  const handleDone = () => {
    const urls = files.filter(f => f.url).map(f => f.url!);
    if (urls.length > 0 && onFilesUploaded) {
      onFilesUploaded(urls);
    }
    setOpen(false);
    setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
        setFiles([]);
      }
    }}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          className={buttonClassName}
          variant={buttonVariant}
          size={buttonSize}
          data-testid="button-upload-trigger"
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right flex items-center gap-2 justify-end">
            <span>رفع الصور والفيديوهات</span>
            <Upload className="h-5 w-5" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            data-testid="input-file-upload"
          />
          
          {canAddMore && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
              data-testid="dropzone-upload"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 text-muted-foreground">
                  <Image className="h-8 w-8" />
                  <Film className="h-8 w-8" />
                </div>
                <p className="font-medium">اضغط لاختيار الملفات</p>
                <p className="text-sm text-muted-foreground">
                  صور أو فيديوهات (حد أقصى {maxFiles} ملفات، {Math.round(maxFileSize / 1048576)} ميجابايت لكل ملف)
                </p>
              </div>
            </div>
          )}

          {hasFiles && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-right">
                {files.length} من {maxFiles} ملفات
              </p>
              <div className="grid grid-cols-2 gap-3">
                {files.map((uploadedFile, index) => (
                  <div 
                    key={index}
                    className="relative border rounded-lg overflow-hidden bg-muted/20"
                  >
                    {uploadedFile.file.type.startsWith("image/") && uploadedFile.preview ? (
                      <img 
                        src={uploadedFile.preview} 
                        alt="Preview" 
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 flex items-center justify-center bg-muted">
                        <Film className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="absolute top-1 left-1">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="absolute top-1 right-1">
                      {uploadedFile.status === "success" && (
                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {uploadedFile.status === "error" && (
                        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {uploadedFile.status === "uploading" && (
                      <div className="absolute bottom-0 left-0 right-0 p-1">
                        <Progress value={uploadedFile.progress} className="h-1" />
                      </div>
                    )}

                    <div className="p-2">
                      <p className="text-xs truncate">{uploadedFile.file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end items-center">
            {hasFiles && !allUploaded && (
              <span className="text-sm text-muted-foreground">جاري الرفع...</span>
            )}
            {allUploaded && (
              <Button 
                onClick={handleDone}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-done-upload"
              >
                تم
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
