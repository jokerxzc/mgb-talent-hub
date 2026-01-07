import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Users, 
  Building2, 
  ArrowRight, 
  FileText, 
  UserPlus, 
  Upload, 
  Send,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle2,
  Clock,
  Shield,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";

interface Vacancy {
  id: string;
  position_title: string;
  employment_type: string;
  office_division: string | null;
  application_deadline: string | null;
  slots: number | null;
  place_of_assignment: string | null;
}

const Index = () => {
  const { data: vacancies, isLoading } = useQuery({
    queryKey: ["featured-vacancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("id, position_title, employment_type, office_division, application_deadline, slots, place_of_assignment")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Vacancy[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["homepage-stats"],
    queryFn: async () => {
      const [vacanciesResult, applicationsResult] = await Promise.all([
        supabase.from("vacancies").select("id", { count: "exact" }).eq("status", "published"),
        supabase.from("applications").select("id", { count: "exact" }),
      ]);

      return {
        activePositions: vacanciesResult.count || 0,
        totalApplications: applicationsResult.count || 0,
      };
    },
  });

  const applicationSteps = [
    { icon: UserPlus, title: "Create Account", description: "Register with your email" },
    { icon: FileText, title: "Complete Profile", description: "Add your qualifications" },
    { icon: Upload, title: "Upload Documents", description: "Submit required files" },
    { icon: Send, title: "Apply", description: "Submit your application" },
  ];

  const benefits = [
    { icon: Shield, title: "Job Security", description: "Stable government employment with career protection" },
    { icon: GraduationCap, title: "Career Growth", description: "Professional development and training opportunities" },
    { icon: CheckCircle2, title: "Competitive Benefits", description: "Health, retirement, and other government benefits" },
    { icon: Clock, title: "Work-Life Balance", description: "Structured work hours and leave benefits" },
  ];

  const getEmploymentTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      permanent: "bg-success/15 text-success border-success/30",
      cos: "bg-info/15 text-info border-info/30",
      jo: "bg-warning/15 text-warning border-warning/30",
    };
    const labels: Record<string, string> = {
      permanent: "Permanent",
      cos: "COS",
      jo: "Job Order",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[type] || styles.permanent}`}>
        {labels[type] || type}
      </span>
    );
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full translate-x-1/3 translate-y-1/3" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-gold text-gold-foreground hover:bg-gold/90 text-sm px-3 py-1">
                Now Hiring
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Build Your Career at <span className="text-gold">MGB</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/85 max-w-xl">
                Join the Mines and Geosciences Bureau and contribute to the sustainable 
                development of the Philippines' mineral resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button asChild size="lg" variant="secondary" className="text-base font-semibold shadow-lg">
                  <Link to="/vacancies">
                    <Briefcase className="mr-2 h-5 w-5" />
                    View Open Positions
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="text-base border-2 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                >
                  <Link to="/auth">
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-3 text-gold" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {stats?.activePositions || 0}
                  </div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Open Positions</div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-3 text-gold" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">
                    {stats?.totalApplications || 0}
                  </div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Applications</div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-3 text-gold" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">16</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Regional Offices</div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-3 text-gold" />
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground">1,000+</div>
                  <div className="text-sm text-primary-foreground/70 mt-1">Employees</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How to Apply - Compact Steps */}
      <section className="py-8 bg-muted/50 border-y">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {applicationSteps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className="flex items-center gap-3 px-4 md:px-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < applicationSteps.length - 1 && (
                  <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vacancies */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <Badge variant="outline" className="mb-3 text-primary border-primary">
                Opportunities
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Vacancies</h2>
              <p className="text-muted-foreground mt-1">Explore current openings across all offices</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/vacancies">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : vacancies && vacancies.length > 0 ? (
            <div className="grid gap-4">
              {vacancies.map((vacancy) => (
                <Card key={vacancy.id} className="group hover:shadow-md hover:border-primary/30 transition-all duration-200">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {vacancy.position_title}
                          </h3>
                          {getEmploymentTypeBadge(vacancy.employment_type)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                          {vacancy.office_division && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              {vacancy.office_division}
                            </span>
                          )}
                          {vacancy.place_of_assignment && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {vacancy.place_of_assignment}
                            </span>
                          )}
                          {vacancy.slots && (
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {vacancy.slots} slot{vacancy.slots > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {vacancy.application_deadline && (
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-muted-foreground">Deadline</div>
                            <div className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(vacancy.application_deadline), "MMM dd, yyyy")}
                            </div>
                          </div>
                        )}
                        <Button asChild size="sm" className="shrink-0">
                          <Link to={`/vacancies/${vacancy.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg mb-1">No Vacancies Available</h3>
                <p className="text-muted-foreground">Check back later for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Why Join MGB */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-3 text-primary border-primary">
              Why Join Us
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">A Career That Matters</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of the government agency responsible for managing the country's 
              mineral resources and geosciences development.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link to="/auth?mode=register">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join our team of dedicated professionals committed to the sustainable development 
            of the Philippines' natural resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link to="/vacancies">
                <Briefcase className="mr-2 h-5 w-5" />
                Browse Vacancies
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-2 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
            >
              <Link to="/auth">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
