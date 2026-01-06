import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2
} from "lucide-react";
import { format } from "date-fns";

interface Vacancy {
  id: string;
  position_title: string;
  employment_type: string;
  office_division: string | null;
  application_deadline: string | null;
  slots: number | null;
}

const Index = () => {
  const { data: vacancies, isLoading } = useQuery({
    queryKey: ["featured-vacancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("id, position_title, employment_type, office_division, application_deadline, slots")
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
    { icon: UserPlus, title: "Create Account", description: "Register with your email and create your applicant profile" },
    { icon: FileText, title: "Complete Profile", description: "Fill in your personal information, education, and work experience" },
    { icon: Upload, title: "Upload Documents", description: "Upload required documents like resume, certificates, and IDs" },
    { icon: Send, title: "Submit Application", description: "Apply to job vacancies and track your application status" },
  ];

  const benefits = [
    "Competitive government salary and benefits",
    "Career growth and professional development",
    "Job security and stability",
    "Contribute to national development",
    "Work-life balance",
    "Health and retirement benefits",
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4 bg-gold text-gold-foreground">
              Government Career Opportunities
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Mines and Geosciences Bureau
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-primary-foreground/90">
              Career Opportunities
            </p>
            <p className="text-lg mb-8 text-primary-foreground/80 max-w-2xl">
              Join our team of dedicated professionals committed to the sustainable development 
              and management of the country's mineral and geoscience resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/vacancies">
                  <Briefcase className="mr-2 h-5 w-5" />
                  Browse Vacancies
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/auth">
                  Sign In / Register
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats?.activePositions || 0}</div>
              <div className="text-sm text-muted-foreground">Active Positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">{stats?.totalApplications || 0}</div>
              <div className="text-sm text-muted-foreground">Applications Received</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">16</div>
              <div className="text-sm text-muted-foreground">Regional Offices</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">1,000+</div>
              <div className="text-sm text-muted-foreground">Employees Nationwide</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vacancies */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Vacancies</h2>
              <p className="text-muted-foreground">Explore current job opportunities at MGB</p>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link to="/vacancies">
                View All Vacancies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vacancies && vacancies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacancies.map((vacancy) => (
                <Card key={vacancy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{vacancy.position_title}</CardTitle>
                      <Badge variant="secondary">{vacancy.employment_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-muted-foreground mb-4">
                      {vacancy.office_division && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{vacancy.office_division}</span>
                        </div>
                      )}
                      {vacancy.application_deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Deadline: {format(new Date(vacancy.application_deadline), "MMM dd, yyyy")}</span>
                        </div>
                      )}
                      {vacancy.slots && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{vacancy.slots} slot{vacancy.slots > 1 ? "s" : ""} available</span>
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/vacancies/${vacancy.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vacancies available at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Please check back later for new opportunities.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* How to Apply Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">How to Apply</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to submit your application
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applicationSteps.map((step, index) => (
              <Card key={index} className="text-center relative">
                <CardContent className="pt-8 pb-6">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
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

      {/* Why Join MGB Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Why Join MGB?</h2>
              <p className="text-muted-foreground mb-6">
                The Mines and Geosciences Bureau is the primary government agency responsible for 
                the conservation, management, development, and proper use of the country's mineral 
                resources. Be part of a team that shapes the future of our nation's natural resources.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <Building2 className="h-10 w-10 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Government Agency</h3>
                  <p className="text-sm text-primary-foreground/80">Under DENR, serving the Filipino people</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary text-secondary-foreground">
                <CardContent className="pt-6">
                  <MapPin className="h-10 w-10 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nationwide Presence</h3>
                  <p className="text-sm text-secondary-foreground/80">Offices across all regions</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary text-secondary-foreground">
                <CardContent className="pt-6">
                  <Users className="h-10 w-10 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Professional Team</h3>
                  <p className="text-sm text-secondary-foreground/80">Work with experts in the field</p>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <Briefcase className="h-10 w-10 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Career Growth</h3>
                  <p className="text-sm text-primary-foreground/80">Continuous learning opportunities</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
