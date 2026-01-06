import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Download, FileText, Briefcase, GraduationCap, User } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface ApplicationDetailProps {
  application: Tables<"applications"> & {
    vacancy: Tables<"vacancies"> | null;
    profile: Tables<"profiles"> | null;
  };
}

export function ApplicationDetail({ application }: ApplicationDetailProps) {
  const [education, setEducation] = useState<Tables<"educational_background">[]>([]);
  const [experience, setExperience] = useState<Tables<"work_experience">[]>([]);
  const [documents, setDocuments] = useState<Tables<"documents">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicantData();
  }, [application]);

  const fetchApplicantData = async () => {
    try {
      const userId = application.user_id;

      // Fetch education
      const { data: eduData } = await supabase
        .from("educational_background")
        .select("*")
        .eq("user_id", userId)
        .order("year_graduated", { ascending: false });

      // Fetch work experience
      const { data: expData } = await supabase
        .from("work_experience")
        .select("*")
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      // Fetch documents linked to this application
      const { data: appDocs } = await supabase
        .from("application_documents")
        .select("document_id")
        .eq("application_id", application.id);

      if (appDocs && appDocs.length > 0) {
        const docIds = appDocs.map((d) => d.document_id);
        const { data: docsData } = await supabase
          .from("documents")
          .select("*")
          .in("id", docIds);
        setDocuments(docsData || []);
      }

      setEducation(eduData || []);
      setExperience(expData || []);
    } catch (error) {
      console.error("Error fetching applicant data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: Tables<"documents">) => {
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
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading applicant data...</div>;
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile" className="flex items-center gap-1">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="education" className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4" />
          Education
        </TabsTrigger>
        <TabsTrigger value="experience" className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          Experience
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">
                  {application.profile?.first_name} {application.profile?.middle_name}{" "}
                  {application.profile?.last_name} {application.profile?.suffix}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{application.profile?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Number</p>
                <p className="font-medium">
                  {application.profile?.contact_number || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {application.profile?.address || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="education" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Educational Background</CardTitle>
          </CardHeader>
          <CardContent>
            {education.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No educational background provided
              </p>
            ) : (
              <div className="space-y-4">
                {education.map((edu) => (
                  <div
                    key={edu.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{edu.school_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.level} {edu.degree && `- ${edu.degree}`}
                        </p>
                        {edu.field_of_study && (
                          <p className="text-sm">{edu.field_of_study}</p>
                        )}
                        {edu.honors && (
                          <p className="text-sm text-primary">{edu.honors}</p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {edu.year_graduated || "In Progress"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="experience" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {experience.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No work experience provided
              </p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div
                    key={exp.id}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{exp.position_title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.company_name}
                        </p>
                        {exp.duties && (
                          <p className="text-sm mt-2">{exp.duties}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>
                          {format(new Date(exp.start_date), "MMM yyyy")} -{" "}
                          {exp.is_current
                            ? "Present"
                            : exp.end_date
                            ? format(new Date(exp.end_date), "MMM yyyy")
                            : ""}
                        </p>
                        {exp.monthly_salary && (
                          <p>₱{Number(exp.monthly_salary).toLocaleString()}/mo</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Submitted Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No documents attached to this application
              </p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.document_type} •{" "}
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(1)} KB`
                            : "Unknown size"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
