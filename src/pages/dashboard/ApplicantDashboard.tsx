import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { FileText, Briefcase, Clock, CheckCircle, ArrowRight } from "lucide-react";

export default function ApplicantDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["applicant-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: applications } = await supabase
        .from("applications")
        .select("status")
        .eq("user_id", user!.id);

      const { count: vacancyCount } = await supabase
        .from("vacancies")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

      const apps = applications || [];
      return {
        total: apps.length,
        underReview: apps.filter((a) => a.status === "under_review").length,
        shortlisted: apps.filter((a) => a.status === "shortlisted" || a.status === "interview").length,
        openPositions: vacancyCount || 0,
      };
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile-completion", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, contact_number, address")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
  });

  const { data: documentsCount } = useQuery({
    queryKey: ["documents-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count || 0;
    },
  });

  const isProfileComplete = profile?.first_name && profile?.last_name && profile?.contact_number;
  const hasDocuments = documentsCount && documentsCount > 0;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">Total submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Under Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.underReview || 0}</div>
              <p className="text-xs text-muted-foreground">Being processed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.shortlisted || 0}</div>
              <p className="text-xs text-muted-foreground">For interview</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openPositions || 0}</div>
              <p className="text-xs text-muted-foreground">Available now</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`flex items-start gap-4 p-4 rounded-lg ${isProfileComplete ? "bg-primary/10" : "bg-muted/50"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${isProfileComplete ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                {isProfileComplete ? <CheckCircle className="h-4 w-4" /> : "1"}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Complete Your Profile</h4>
                <p className="text-sm text-muted-foreground">Add your personal information, education, and work experience.</p>
              </div>
              {!isProfileComplete && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.APPLICANT_PROFILE}>
                    Complete <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
            <div className={`flex items-start gap-4 p-4 rounded-lg ${hasDocuments ? "bg-primary/10" : "bg-muted/50"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${hasDocuments ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                {hasDocuments ? <CheckCircle className="h-4 w-4" /> : "2"}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Upload Required Documents</h4>
                <p className="text-sm text-muted-foreground">Prepare your PDS, resume, transcript, and other documents.</p>
              </div>
              {!hasDocuments && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.APPLICANT_DOCUMENTS}>
                    Upload <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-medium">Browse and Apply</h4>
                <p className="text-sm text-muted-foreground">Explore job openings and submit your applications.</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={ROUTES.VACANCIES}>
                  Browse <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
