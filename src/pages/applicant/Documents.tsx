import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { DOCUMENT_TYPES, FILE_SIZE_LIMIT } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function Documents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(); // Initialize useTranslation
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user!.id)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== "application/pdf") {
      toast({ title: t("only_pdf_files_allowed"), variant: "destructive" });
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      toast({ title: t("file_size_limit_exceeded"), variant: "destructive" });
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType || !user) return;

    setUploading(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}_${documentType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("applicant-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save document metadata
      const { error: dbError } = await supabase.from("documents").insert({
        user_id: user.id,
        document_type: documentType,
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
      });

      if (dbError) throw dbError;

      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsDialogOpen(false);
      setSelectedFile(null);
      setDocumentType("");
      toast({ title: t("document_uploaded_successfully") });
    } catch (error: any) {
      toast({ title: t("error_uploading_document"), description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (doc: Tables<"documents">) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("applicant-documents")
        .remove([doc.file_path]);
      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: t("document_deleted_successfully") });
    },
    onError: (error) => {
      toast({ title: t("error_deleting_document"), description: error.message, variant: "destructive" });
    },
  });

  const handleDownload = async (doc: Tables<"documents">) => {
    try {
      const { data, error } = await supabase.storage
        .from("applicant-documents")
        .download(doc.file_path);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ title: t("error_downloading_document"), description: error.message, variant: "destructive" });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return t("unknown_size");
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES] || type;
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("my_documents_page_title")}</h1>
            <p className="text-muted-foreground">{t("upload_manage_documents")}</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                {t("upload_document")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("upload_document")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document_type">{t("document_type")} *</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_document_type")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("file_pdf_only_max_5mb")} *</Label>
                  <FileDropzone
                    selectedFile={selectedFile}
                    onFileSelect={handleFileSelect}
                    onClear={() => setSelectedFile(null)}
                  />
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentType || uploading}
                  className="w-full"
                >
                  {uploading ? t("uploading") : t("upload_document")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("uploaded_documents")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">{t("loading")}</div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="bg-muted px-2 py-0.5 rounded">
                            {getDocumentTypeLabel(doc.document_type)}
                          </span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>{format(new Date(doc.uploaded_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(t("delete_document_confirm"))) deleteMutation.mutate(doc);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t("no_documents_uploaded_yet")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("upload_documents_to_use")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("document_guidelines")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t("pdf_only_accepted")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t("max_file_size_5mb")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t("ensure_clear_readable")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t("pds_latest_csc_form")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                {t("transcript_certified_true_copy")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}