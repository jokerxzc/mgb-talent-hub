import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Eye, FileEdit } from "lucide-react";
import { format } from "date-fns";
import { EvaluationForm } from "@/components/reviewer/EvaluationForm";
import { ApplicationDetail } from "@/components/reviewer/ApplicationDetail";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next"; // Import useTranslation

type Application = Tables<"applications"> & {
  vacancy: Tables<"vacancies"> | null;
  profile: Tables<"profiles"> | null;
};

export default function ReviewerApplications() {
  const { user } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [existingEvaluations, setExistingEvaluations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      fetchAssignedApplications();
    }
  }, [user]);

  const fetchAssignedApplications = async () => {
    try {
      // First get assigned application IDs
      const { data: assignments } = await supabase
        .from("reviewer_assignments")
        .select("application_id")
        .eq("reviewer_id", user?.id);

      if (!assignments || assignments.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const applicationIds = assignments.map((a) => a.application_id);

      // Then fetch application details
      const { data: apps, error } = await supabase
        .from("applications")
        .select(`
          *,
          vacancy:vacancies(*)
        `)
        .in("id", applicationIds)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(apps?.map((a) => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      const appsWithProfiles = apps?.map((app) => ({
        ...app,
        profile: profileMap.get(app.user_id) || null,
      }));

      setApplications(appsWithProfiles as Application[]);

      // Check which applications have evaluations
      const { data: evals } = await supabase
        .from("evaluations")
        .select("application_id")
        .eq("reviewer_id", user?.id);

      const evalMap: Record<string, boolean> = {};
      evals?.forEach((e) => {
        evalMap[e.application_id] = true;
      });
      setExistingEvaluations(evalMap);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      app.reference_number.toLowerCase().includes(searchLower) ||
      app.vacancy?.position_title?.toLowerCase().includes(searchLower) ||
      app.profile?.first_name?.toLowerCase().includes(searchLower) ||
      app.profile?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetail = (app: Application) => {
    setSelectedApp(app);
    setShowDetail(true);
  };

  const handleEvaluate = (app: Application) => {
    setSelectedApp(app);
    setShowEvaluation(true);
  };

  const handleEvaluationComplete = () => {
    setShowEvaluation(false);
    fetchAssignedApplications();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("assigned_applications_reviewer")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("review_evaluate_assigned_applications_desc")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle>{t("applications_for_review")}</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search_applications_reviewer")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("loading_applications")}
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("no_applications_assigned")}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("reference_no")}</TableHead>
                      <TableHead>{t("applicant")}</TableHead>
                      <TableHead>{t("position")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("submitted")}</TableHead>
                      <TableHead>{t("evaluation")}</TableHead>
                      <TableHead className="text-right">{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-mono text-sm">
                          {app.reference_number}
                        </TableCell>
                        <TableCell>
                          {app.profile?.first_name} {app.profile?.last_name}
                        </TableCell>
                        <TableCell>{app.vacancy?.position_title}</TableCell>
                        <TableCell>
                          <StatusBadge status={app.status || "submitted"} type="application" />
                        </TableCell>
                        <TableCell>
                          {format(new Date(app.submitted_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {existingEvaluations[app.id] ? (
                            <span className="text-success text-sm font-medium">{t("completed")}</span>
                          ) : (
                            <span className="text-warning text-sm font-medium">{t("pending")}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetail(app)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEvaluate(app)}
                            >
                              <FileEdit className="h-4 w-4 mr-1" />
                              {existingEvaluations[app.id] ? t("edit") : t("evaluate")}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("application_details_reviewer")}</DialogTitle>
          </DialogHeader>
          {selectedApp && <ApplicationDetail application={selectedApp} />}
        </DialogContent>
      </Dialog>

      {/* Evaluation Form Dialog */}
      <Dialog open={showEvaluation} onOpenChange={setShowEvaluation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {existingEvaluations[selectedApp?.id || ""]
                ? t("edit_evaluation_form_dialog_title")
                : t("evaluation_form_dialog_title")}
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <EvaluationForm
              application={selectedApp}
              onComplete={handleEvaluationComplete}
              onCancel={() => setShowEvaluation(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}