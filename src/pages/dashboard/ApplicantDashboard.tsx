import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ROUTES } from "@/lib/constants";
import { motion } from "framer-motion";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  TrendingUp,
  Sparkles,
  User,
  FolderOpen,
  Target
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
        selected: apps.filter((a) => a.status === "selected").length,
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

  const { data: recentApplications } = useQuery({
    queryKey: ["recent-applications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("applications")
        .select(`
          id, reference_number, status, submitted_at,
          vacancies ( position_title, office_division )
        `)
        .eq("user_id", user!.id)
        .order("submitted_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  const isProfileComplete = profile?.first_name && profile?.last_name && profile?.contact_number;
  const hasDocuments = documentsCount && documentsCount > 0;
  const completionPercentage = [isProfileComplete, hasDocuments, (stats?.total || 0) > 0].filter(Boolean).length;

  const statCards = [
    {
      title: "My Applications",
      value: stats?.total || 0,
      subtitle: "Total submitted",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Under Review",
      value: stats?.underReview || 0,
      subtitle: "Being processed",
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Shortlisted",
      value: stats?.shortlisted || 0,
      subtitle: "For interview",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Open Positions",
      value: stats?.openPositions || 0,
      subtitle: "Available now",
      icon: Briefcase,
      color: "text-success",
      bgColor: "bg-success/10",
      action: { label: "Browse Jobs", to: ROUTES.VACANCIES },
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: "bg-info/15 text-info border-info/30",
      under_review: "bg-warning/15 text-warning border-warning/30",
      shortlisted: "bg-primary/15 text-primary border-primary/30",
      interview: "bg-accent/15 text-accent border-accent/30",
      selected: "bg-success/15 text-success border-success/30",
      not_selected: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back{profile?.first_name ? `, ${profile.first_name}` : ""}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your applications and discover new opportunities
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Assistant Available</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Card */}
        {completionPercentage < 3 && (
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Complete Your Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        {completionPercentage}/3 steps completed
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-2 w-8 rounded-full ${
                          step <= completionPercentage ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isProfileComplete && (
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={ROUTES.APPLICANT_PROFILE}>
                        <User className="h-3 w-3 mr-1" />
                        Complete Profile
                      </Link>
                    </Button>
                  )}
                  {!hasDocuments && (
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={ROUTES.APPLICANT_DOCUMENTS}>
                        <FolderOpen className="h-3 w-3 mr-1" />
                        Upload Documents
                      </Link>
                    </Button>
                  )}
                  {(stats?.total || 0) === 0 && (
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={ROUTES.VACANCIES}>
                        <Briefcase className="h-3 w-3 mr-1" />
                        Apply for Jobs
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="h-full card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    {stat.action && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" asChild>
                        <Link to={stat.action.to}>
                          {stat.action.label}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Applications */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <CardDescription>Your latest job applications</CardDescription>
              </div>
              {(stats?.total || 0) > 0 && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={ROUTES.APPLICANT_APPLICATIONS}>
                    View All
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {recentApplications && recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.map((app: any) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {app.vacancies?.position_title || "Position"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {app.reference_number} • {app.vacancies?.office_division}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(app.status)} border`}>
                        {app.status?.replace("_", " ")}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No applications yet</p>
                  <Button asChild>
                    <Link to={ROUTES.VACANCIES}>
                      <Briefcase className="h-4 w-4 mr-2" />
                      Browse Open Positions
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Getting Started Guide */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
              <CardDescription>Follow these steps to apply for positions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    step: 1,
                    title: "Complete Profile",
                    description: "Add your personal info, education, and work experience",
                    icon: User,
                    done: isProfileComplete,
                    link: ROUTES.APPLICANT_PROFILE,
                  },
                  {
                    step: 2,
                    title: "Upload Documents",
                    description: "Prepare your PDS, resume, and required certificates",
                    icon: FolderOpen,
                    done: hasDocuments,
                    link: ROUTES.APPLICANT_DOCUMENTS,
                  },
                  {
                    step: 3,
                    title: "Apply for Jobs",
                    description: "Browse vacancies and submit your applications",
                    icon: Target,
                    done: (stats?.total || 0) > 0,
                    link: ROUTES.VACANCIES,
                  },
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    whileHover={{ y: -4 }}
                    className={`relative p-5 rounded-xl border-2 transition-all ${
                      item.done
                        ? "border-primary/30 bg-primary/5"
                        : "border-dashed border-muted-foreground/20 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          item.done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.done ? <CheckCircle className="h-4 w-4" /> : item.step}
                      </div>
                      <h4 className="font-semibold">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    {!item.done && (
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={item.link}>
                          Get Started
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* AI Assistant */}
      <AIAssistant />
    </DashboardLayout>
  );
}
