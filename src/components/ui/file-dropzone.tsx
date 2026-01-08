import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear?: () => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileDropzone({
  onFileSelect,
  selectedFile,
  onClear,
  accept = ".pdf",
  maxSize = 5 * 1024 * 1024,
  className,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : selectedFile
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50",
        className
      )}
      onClick={() => fileInputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AnimatePresence mode="wait">
        {isDragging ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Upload className="h-7 w-7 text-primary" />
            </motion.div>
            <p className="text-sm font-medium text-primary">Drop your file here</p>
          </motion.div>
        ) : selectedFile ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              {onClear && (
                <button
                  onClick={handleClear}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <p className="text-sm font-medium truncate max-w-full px-4">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF only, max 5MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
