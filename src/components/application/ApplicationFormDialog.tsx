import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { DOCUMENT_TYPES, FILE_SIZE_LIMIT } from "@/lib/constants";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: {
    id: string;
    position_title: string;
    required_documents: string[] | null;
  };
  userId: string;
  onSuccess: (referenceNumber: string) => void;
}

export function ApplicationFormDialog({
  open,
  onOpenChange,
  vacancy,
  userId,
  onSuccess,
}: ApplicationFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation(); // Initialize useTranslation
  
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("select");
  const [uploadDocType, setUploadDocType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const requiredDocs = vacancy.required_documents || [];

  const { data: userDocuments, refetch: refetchDocuments } = useQuery({
    queryKey: ["user-documents", userId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getDocumentsByType = (type: string) => {
    return userDocuments?.filter((d) => d.document_type === type) || [];
  };

  const toggleDocument = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  const hasAllRequiredDocs = requiredDocs.every((type) =>
    getDocumentsByType(type).some((d) => selectedDocuments.includes(d.id))
  );

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
    if (!selectedFile || !uploadDocType) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}_${uploadDocType}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("applicant-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: newDoc, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: userId,
          document_type: uploadDocType,
          file_name: selectedFile.name,
          file_path: filePath,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Auto-select the newly uploaded document
      if (newDoc) {
        setSelectedDocuments((prev) => [...prev, newDoc.id]);
      }

      await refetchDocuments();
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      
      setSelectedFile(null);
      setUploadDocType("");
      setActiveTab("select");
      toast({ title: t("document_uploaded_successfully") });
    } catch (error: any) {
      toast({ title: t("error_uploading_document"), description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { data: refData, error: refError } = await supabase.rpc("generate_reference_number");
      if (refError) throw refError;

      const { data: appData, error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: userId,
          vacancy_id: vacancy.id,
          reference_number: refData,
        })
        .select()
        .single();
      if (appError) throw appError;

      if (selectedDocuments.length > 0) {
        const docLinks = selectedDocuments.map((docId) => ({
          application_id: appData.id,
          document_id: docId,
        }));
        const { error: linkError } = await supabase
          .from("application_documents")
          .insert(docLinks);
        if (linkError) throw linkError;
      }

      return appData;
    },
    onSuccess: (data) => {
      onSuccess(data.reference_number);
      onOpenChange(false);
      setSelectedDocuments([]);
    },
    onError: (error) => {
      toast({
        title: t("error_submitting_application"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const missingDocTypes = requiredDocs.filter(
    (type) => !getDocumentsByType(type).some((d) => selectedDocuments.includes(d.id))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("apply_for")} {vacancy.position_title}</DialogTitle>
          <DialogDescription>
            {t("select_or_upload_documents")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select" className="gap-2">
              <FileText className="h-4 w-4" />
              {t("select_documents")}
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              {t("upload_new")}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="select" className="m-0 space-y-4">
              {requiredDocs.length > 0 ? (
                requiredDocs.map((docType) => {
                  const docs = getDocumentsByType(docType);
                  const typeLabel = DOCUMENT_TYPES[docType as keyof typeof DOCUMENT_TYPES] || docType;
                  const hasSelectedDoc = docs.some((d) => selectedDocuments.includes(d.id));

                  return (
                    <motion.div
                      key={docType}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        {hasSelectedDoc ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                        {typeLabel}
                        <span className="text-destructive">{t("required")}</span>
                      </Label>
                      
                      {docs.length > 0 ? (
                        <div className="grid gap-2">
                          {docs.map((doc) => (
                            <label
                              key={doc.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                                selectedDocuments.includes(doc.id)
                                  ? "border-primary bg-primary/5"
                                  : "border-border bg-muted/30 hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox
                                checked={selectedDocuments.includes(doc.id)}
                                onCheckedChange={() => toggleDocument(doc.id)}
                              />
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{doc.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {t("uploaded")} {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {t("no_document_uploaded_yet", { type: typeLabel.toLowerCase() })}
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto mt-1"
                            onClick={() => {
                              setUploadDocType(docType);
                              setActiveTab("upload");
                            }}
                          >
                            {t("upload_now")} →
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  {t("no_specific_documents_required")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="upload" className="m-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">{t("document_type")} *</Label>
                <Select value={uploadDocType} onValueChange={setUploadDocType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_document_type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                        {missingDocTypes.includes(key) && (
                          <span className="ml-2 text-destructive text-xs">{t("required")}</span>
                        )}
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
                disabled={!selectedFile || !uploadDocType || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {t("upload_add_to_application")}
                  </>
                )}
              </Button>
            </TabsContent>
          </div>
        </Tabs>

        {/* Summary and Submit */}
        <div className="pt-4 border-t mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("documents_selected")}</span>
            <span className="font-medium">{selectedDocuments.length}</span>
          </div>
          
          {!hasAllRequiredDocs && missingDocTypes.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {t("missing_required_documents")}{" "}
                  {missingDocTypes.map((type) => DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES] || type).join(", ")}
                </span>
              </p>
            </div>
          )}

          <Button
            onClick={() => applyMutation.mutate()}
            disabled={!hasAllRequiredDocs || applyMutation.isPending}
            className="w-full"
            size="lg"
          >
            {applyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("submitting_application")}
              </>
            ) : (
              t("submit_application")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}