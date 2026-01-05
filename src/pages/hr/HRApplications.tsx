import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Eye, FileText, Download } from "lucide-react";
import { APPLICATION_STATUS } from "@/lib/constants";
import type { Tables, Enums } from "@/integrations/supabase/types";

type ApplicationStatus = Enums<"application_status">;

interface ApplicationWithDetails extends Tables<"applications"> {
  vacancy: Tables<"vacancies"> | null;
  profile: Tables<"profiles"> | null;
}

export default function HRApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);

  const { data: applications, isLoading } = useQuery({
    queryKey: ["hr-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          vacancy:vacancies(*),
          profile:profiles!applications_user_id_fkey(*)
        `)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as unknown as ApplicationWithDetails[];
    },
  });

  const { data: applicationDocuments } = useQuery({
    queryKey: ["application-documents", selectedApplication?.id],
    enabled: !!selectedApplication,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_documents")
        .select(`
          *,
          document:documents(*)
        `)
        .eq("application_id", selectedApplication!.id);
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, remarks }: { id: string; status: ApplicationStatus; remarks?: string }) => {
      // Get current status
      const { data: currentApp } = await supabase
        .from("applications")
        .select("status")
        .eq("id", id)
        .single();

      // Update application status
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;

      // Add to status history
      const { error: historyError } = await supabase
        .from("application_status_history")
        .insert({
          application_id: id,
          old_status: currentApp?.status,
          new_status: status,
          changed_by: user?.id,
          remarks,
        });
      if (historyError) throw historyError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-applications"] });
      toast({ title: "Application status updated" });
    },
    onError: (error) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });

  const filteredApplications = applications?.filter((app) => {
    const matchesSearch =
      app.reference_number.toLowerCase().includes(search.toLowerCase()) ||
      app.vacancy?.position_title.toLowerCase().includes(search.toLowerCase()) ||
      `${app.profile?.first_name} ${app.profile?.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getApplicantName = (profile: Tables<"profiles"> | null) => {
    if (!profile) return "Unknown";
    return `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || profile.email;
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications</h1>
          <p className="text-muted-foreground">Review and manage job applications</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference number, position, or applicant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(APPLICATION_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredApplications && filteredApplications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference #</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">{app.reference_number}</TableCell>
                        <TableCell>{getApplicantName(app.profile)}</TableCell>
                        <TableCell>{app.vacancy?.position_title}</TableCell>
                        <TableCell>
                          {format(new Date(app.submitted_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={app.status || "submitted"} type="application" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No applications found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Detail Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Reference Number</Label>
                    <p className="font-mono">{selectedApplication.reference_number}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Status</Label>
                    <div className="mt-1">
                      <StatusBadge status={selectedApplication.status || "submitted"} type="application" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Applicant</Label>
                    <p>{getApplicantName(selectedApplication.profile)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <p>{selectedApplication.profile?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Position</Label>
                    <p>{selectedApplication.vacancy?.position_title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Office/Division</Label>
                    <p>{selectedApplication.vacancy?.office_division}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Submitted</Label>
                    <p>{format(new Date(selectedApplication.submitted_at), "MMMM d, yyyy h:mm a")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Contact</Label>
                    <p>{selectedApplication.profile?.contact_number || "Not provided"}</p>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <Label className="text-muted-foreground text-xs">Submitted Documents</Label>
                  <div className="mt-2 space-y-2">
                    {applicationDocuments && applicationDocuments.length > 0 ? (
                      applicationDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doc.document?.file_name}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents attached</p>
                    )}
                  </div>
                </div>

                {/* Update Status */}
                <div className="border-t pt-4">
                  <Label>Update Status</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {Object.entries(APPLICATION_STATUS).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={selectedApplication.status === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          updateStatusMutation.mutate({
                            id: selectedApplication.id,
                            status: key as ApplicationStatus,
                          });
                          setSelectedApplication({
                            ...selectedApplication,
                            status: key as ApplicationStatus,
                          });
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
