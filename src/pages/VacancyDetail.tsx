import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Users,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
  ClipboardCheck,
  CheckCircle,
} from "lucide-react";
import { EMPLOYMENT_TYPES, DOCUMENT_TYPES, ROUTES } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

export default function VacancyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isApplicant } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const { data: vacancy, isLoading } = useQuery({
    queryKey: ["vacancy", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: userDocuments } = useQuery({
    queryKey: ["user-documents", user?.id],
    enabled: !!user && isApplyDialogOpen,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: existingApplication } = useQuery({
    queryKey: ["existing-application", user?.id, id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user!.id)
        .eq("vacancy_id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      // Generate reference number
      const { data: refData, error: refError } = await supabase.rpc("generate_reference_number");
      if (refError) throw refError;

      // Create application
      const { data: appData, error: appError } = await supabase
        .from("applications")
        .insert({
          user_id: user!.id,
          vacancy_id: id!,
          reference_number: refData,
        })
        .select()
        .single();
      if (appError) throw appError;

      // Link selected documents
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
      toast({
        title: "Application Submitted!",
        description: `Your reference number is ${data.reference_number}`,
      });
      setIsApplyDialogOpen(false);
      navigate(ROUTES.APPLICANT_APPLICATIONS);
    },
    onError: (error) => {
      toast({
        title: "Error submitting application",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleDocument = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  const getDocumentsByType = (type: string) => {
    return userDocuments?.filter((d) => d.document_type === type) || [];
  };

  const requiredDocs = vacancy?.required_documents || [];
  const hasAllRequiredDocs = requiredDocs.every((type) =>
    getDocumentsByType(type).some((d) => selectedDocuments.includes(d.id))
  );

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-8 text-center text-muted-foreground">Loading...</div>
      </PublicLayout>
    );
  }

  if (!vacancy) {
    return (
      <PublicLayout>
        <div className="container py-8 text-center">
          <h2 className="text-xl font-medium mb-4">Vacancy not found</h2>
          <Button asChild>
            <Link to={ROUTES.VACANCIES}>Back to Vacancies</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const isDeadlinePassed = new Date(vacancy.application_deadline) < new Date();

  return (
    <PublicLayout>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    {vacancy.position_title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {vacancy.office_division}
                    </span>
                    {vacancy.place_of_assignment && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {vacancy.place_of_assignment}
                      </span>
                    )}
                  </div>
                </div>
                <StatusBadge status={vacancy.status || "draft"} type="vacancy" />
              </div>

              <div className="grid sm:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Employment Type</p>
                  <p className="font-medium">
                    {EMPLOYMENT_TYPES[vacancy.employment_type as keyof typeof EMPLOYMENT_TYPES]}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {vacancy.employment_type === "permanent" ? "Salary Grade" : "Daily Rate"}
                  </p>
                  <p className="font-medium">
                    {vacancy.employment_type === "permanent"
                      ? vacancy.salary_grade || "Not specified"
                      : vacancy.daily_rate
                      ? `₱${vacancy.daily_rate.toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Slots Available</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {vacancy.slots}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className={`font-medium flex items-center gap-1 ${isDeadlinePassed ? "text-destructive" : ""}`}>
                    <Calendar className="h-4 w-4" />
                    {format(new Date(vacancy.application_deadline), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-6">
                {existingApplication ? (
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span>You have already applied for this position</span>
                  </div>
                ) : isDeadlinePassed ? (
                  <p className="text-destructive">Application deadline has passed</p>
                ) : user ? (
                  isApplicant ? (
                    <Button size="lg" onClick={() => setIsApplyDialogOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">Only applicants can apply for positions</p>
                  )
                ) : (
                  <div className="flex items-center gap-4">
                    <Button size="lg" asChild>
                      <Link to={ROUTES.AUTH}>Sign In to Apply</Link>
                    </Button>
                    <span className="text-muted-foreground">or</span>
                    <Button variant="outline" asChild>
                      <Link to={ROUTES.AUTH}>Create Account</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {vacancy.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{vacancy.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qualification Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {vacancy.qualification_education && (
                <div className="flex gap-3">
                  <GraduationCap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Education</p>
                    <p className="text-muted-foreground">{vacancy.qualification_education}</p>
                  </div>
                </div>
              )}
              {vacancy.qualification_experience && (
                <div className="flex gap-3">
                  <Briefcase className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Experience</p>
                    <p className="text-muted-foreground">{vacancy.qualification_experience}</p>
                  </div>
                </div>
              )}
              {vacancy.qualification_training && (
                <div className="flex gap-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Training</p>
                    <p className="text-muted-foreground">{vacancy.qualification_training}</p>
                  </div>
                </div>
              )}
              {vacancy.qualification_eligibility && (
                <div className="flex gap-3">
                  <ClipboardCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Eligibility</p>
                    <p className="text-muted-foreground">{vacancy.qualification_eligibility}</p>
                  </div>
                </div>
              )}
              {!vacancy.qualification_education &&
                !vacancy.qualification_experience &&
                !vacancy.qualification_training &&
                !vacancy.qualification_eligibility && (
                  <p className="text-muted-foreground">No specific qualifications listed</p>
                )}
            </CardContent>
          </Card>

          {/* Required Documents */}
          {requiredDocs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {requiredDocs.map((doc) => (
                    <li key={doc} className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span>{DOCUMENT_TYPES[doc as keyof typeof DOCUMENT_TYPES] || doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Apply Dialog */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Apply for {vacancy.position_title}</DialogTitle>
              <DialogDescription>
                Select the documents to submit with your application
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {requiredDocs.map((docType) => {
                const docs = getDocumentsByType(docType);
                const typeLabel = DOCUMENT_TYPES[docType as keyof typeof DOCUMENT_TYPES] || docType;
                const hasDoc = docs.some((d) => selectedDocuments.includes(d.id));

                return (
                  <div key={docType} className="space-y-2">
                    <Label className={`flex items-center gap-2 ${!hasDoc ? "text-destructive" : ""}`}>
                      {typeLabel}
                      <span className="text-destructive">*</span>
                    </Label>
                    {docs.length > 0 ? (
                      <div className="space-y-2">
                        {docs.map((doc) => (
                          <label
                            key={doc.id}
                            className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                          >
                            <Checkbox
                              checked={selectedDocuments.includes(doc.id)}
                              onCheckedChange={() => toggleDocument(doc.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{doc.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Uploaded {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                        You haven't uploaded a {typeLabel.toLowerCase()} yet.{" "}
                        <Link to={ROUTES.APPLICANT_DOCUMENTS} className="underline">
                          Upload now
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <Button
                  onClick={() => applyMutation.mutate()}
                  disabled={!hasAllRequiredDocs || applyMutation.isPending}
                  className="w-full"
                >
                  {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                </Button>
                {!hasAllRequiredDocs && (
                  <p className="text-xs text-destructive mt-2 text-center">
                    Please select all required documents to submit your application
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PublicLayout>
  );
}
