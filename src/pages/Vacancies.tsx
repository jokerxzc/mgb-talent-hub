import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_TYPES, ROUTES } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/status-badge";
import { Briefcase, MapPin, Calendar, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Vacancy {
  id: string;
  position_title: string;
  employment_type: "permanent" | "cos" | "jo";
  salary_grade: string | null;
  office_division: string;
  place_of_assignment: string | null;
  application_deadline: string;
  slots: number;
  status: "draft" | "published" | "closed" | "archived";
}

export default function Vacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    const { data, error } = await supabase
      .from("vacancies")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVacancies(data as Vacancy[]);
    }
    setLoading(false);
  };

  const filteredVacancies = vacancies.filter(
    (v) =>
      v.position_title.toLowerCase().includes(search.toLowerCase()) ||
      v.office_division.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Job Vacancies</h1>
          <p className="text-muted-foreground">
            Browse available positions at the Mines and Geosciences Bureau
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search positions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVacancies.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vacancies found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search" : "Check back later for new openings"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredVacancies.map((vacancy) => (
              <Card key={vacancy.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl mb-1">{vacancy.position_title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{vacancy.office_division}</p>
                    </div>
                    <StatusBadge status={vacancy.status} type="vacancy" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" />
                      {EMPLOYMENT_TYPES[vacancy.employment_type]}
                    </div>
                    {vacancy.salary_grade && (
                      <div className="flex items-center gap-1.5">
                        SG-{vacancy.salary_grade}
                      </div>
                    )}
                    {vacancy.place_of_assignment && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {vacancy.place_of_assignment}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Deadline: {format(new Date(vacancy.application_deadline), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {vacancy.slots} position{vacancy.slots > 1 ? "s" : ""} available
                    </span>
                    <Button asChild>
                      <Link to={`/vacancies/${vacancy.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
