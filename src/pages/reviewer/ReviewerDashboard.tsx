import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, CheckCircle, Clock, FileText } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import useTranslation

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation(); // Initialize useTranslation
  const [stats, setStats] = useState({
    assigned: 0,
    evaluated: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get assigned applications
      const { data: assignments } = await supabase
        .from("reviewer_assignments")
        .select("application_id")
        .eq("reviewer_id", user?.id);

      const assignedCount = assignments?.length || 0;

      // Get evaluations done by this reviewer
      const { data: evaluations } = await supabase
        .from("evaluations")
        .select("id")
        .eq("reviewer_id", user?.id);

      const evaluatedCount = evaluations?.length || 0;

      setStats({
        assigned: assignedCount,
        evaluated: evaluatedCount,
        pending: assignedCount - evaluatedCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t("assigned_applications"),
      value: stats.assigned,
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      title: t("pending_review_reviewer"),
      value: stats.pending,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: t("evaluated"),
      value: stats.evaluated,
      icon: CheckCircle,
      color: "text-success",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("reviewer_dashboard")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("review_evaluate_assigned_applications")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? "..." : stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("quick_actions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <a
                href="/reviewer/applications"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <ClipboardList className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="font-semibold">{t("view_assigned_applications")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("view_assigned_applications_desc")}
                  </p>
                </div>
              </a>
              <a
                href="/reviewer/evaluations"
                className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <CheckCircle className="h-8 w-8 text-success" />
                <div>
                  <h3 className="font-semibold">{t("my_evaluations")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("my_evaluations_desc")}
                  </p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}