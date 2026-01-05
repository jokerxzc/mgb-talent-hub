import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import {
  Briefcase,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function HRDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["hr-dashboard-stats"],
    queryFn: async () => {
      const [vacanciesRes, applicationsRes] = await Promise.all([
        supabase.from("vacancies").select("id, status"),
        supabase.from("applications").select("id, status, submitted_at"),
      ]);

      const vacancies = vacanciesRes.data || [];
      const applications = applicationsRes.data || [];

      return {
        totalVacancies: vacancies.length,
        publishedVacancies: vacancies.filter((v) => v.status === "published").length,
        totalApplications: applications.length,
        pendingReview: applications.filter((a) => a.status === "submitted").length,
        underReview: applications.filter((a) => a.status === "under_review").length,
        shortlisted: applications.filter((a) => a.status === "shortlisted").length,
      };
    },
  });

  const { data: recentApplications } = useQuery({
    queryKey: ["recent-applications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select(`
          id,
          reference_number,
          status,
          submitted_at,
          vacancy:vacancies(position_title, office_division)
        `)
        .order("submitted_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: vacancyStats } = useQuery({
    queryKey: ["vacancy-application-stats"],
    queryFn: async () => {
      const { data: vacancies } = await supabase
        .from("vacancies")
        .select("id, position_title")
        .eq("status", "published")
        .limit(5);

      if (!vacancies) return [];

      const stats = await Promise.all(
        vacancies.map(async (v) => {
          const { count } = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .eq("vacancy_id", v.id);
          return { name: v.position_title.substring(0, 20), applications: count || 0 };
        })
      );

      return stats;
    },
  });

  const statusData = [
    { name: "Submitted", value: stats?.pendingReview || 0, color: "hsl(var(--chart-1))" },
    { name: "Under Review", value: stats?.underReview || 0, color: "hsl(var(--chart-2))" },
    { name: "Shortlisted", value: stats?.shortlisted || 0, color: "hsl(var(--chart-3))" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">HR Dashboard</h1>
            <p className="text-muted-foreground">Manage vacancies and track applications</p>
          </div>
          <Button asChild>
            <Link to={ROUTES.HR_VACANCIES}>
              <Plus className="h-4 w-4 mr-2" />
              New Vacancy
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Vacancies</CardTitle>
              <Briefcase className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.publishedVacancies || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalVacancies || 0} total vacancies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <p className="text-xs text-muted-foreground">All time received</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingReview || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.shortlisted || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for interview</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Applications per Vacancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {vacancyStats && vacancyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vacancyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 10 }} />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="applications" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                {stats?.totalApplications ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No applications yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.HR_APPLICATIONS}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications && recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{app.reference_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.vacancy?.position_title} - {app.vacancy?.office_division}
                      </p>
                    </div>
                    <StatusBadge status={app.status || "submitted"} type="application" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No applications yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
