import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FileText, Briefcase, Calendar, ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

interface ApplicationWithVacancy extends Tables<"applications"> {
  vacancy: Tables<"vacancies"> | null;
}

export default function Applications() {
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["my-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(`
          *,
          vacancy:vacancies(*)
        `)
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as ApplicationWithVacancy[];
    },
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["application-status-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_status_history")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const getStatusHistory = (applicationId: string) => {
    return statusHistory?.filter((h) => h.application_id === applicationId) || [];
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">Track your job application status</p>
          </div>
          <Button asChild>
            <Link to={ROUTES.VACANCIES}>
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Vacancies
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading...
            </CardContent>
          </Card>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => {
              const history = getStatusHistory(app.id);
              return (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Briefcase className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {app.vacancy?.position_title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {app.vacancy?.office_division}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Reference Number</p>
                            <p className="font-mono text-sm">{app.reference_number}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="text-sm">
                              {format(new Date(app.submitted_at), "MMMM d, yyyy")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <div className="mt-1">
                              <StatusBadge status={app.status || "submitted"} type="application" />
                            </div>
                          </div>
                        </div>

                        {/* Status Timeline */}
                        {history.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Status History</p>
                            <div className="space-y-2">
                              {history.slice(0, 3).map((h) => (
                                <div
                                  key={h.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                  <span className="capitalize">
                                    {h.new_status.replace("_", " ")}
                                  </span>
                                  <span className="text-muted-foreground">
                                    • {format(new Date(h.created_at), "MMM d, yyyy")}
                                  </span>
                                  {h.remarks && (
                                    <span className="text-muted-foreground italic">
                                      - {h.remarks}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by browsing available job vacancies and submitting your application
              </p>
              <Button asChild>
                <Link to={ROUTES.VACANCIES}>
                  Browse Vacancies <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
