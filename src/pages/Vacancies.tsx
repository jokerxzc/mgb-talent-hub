import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYMENT_TYPES } from "@/lib/constants";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Search, 
  Loader2, 
  Filter, 
  X,
  Users,
  Building2,
  SlidersHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

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

type SortOption = "newest" | "deadline" | "title";

export default function Vacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [employmentFilter, setEmploymentFilter] = useState<string>("all");
  const [officeFilter, setOfficeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

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

  // Get unique offices for filter dropdown
  const uniqueOffices = useMemo(() => {
    const offices = [...new Set(vacancies.map((v) => v.office_division))];
    return offices.sort();
  }, [vacancies]);

  // Filter and sort vacancies
  const filteredVacancies = useMemo(() => {
    let result = vacancies.filter((v) => {
      const matchesSearch =
        v.position_title.toLowerCase().includes(search.toLowerCase()) ||
        v.office_division.toLowerCase().includes(search.toLowerCase()) ||
        (v.place_of_assignment?.toLowerCase().includes(search.toLowerCase()) ?? false);
      
      const matchesEmployment = employmentFilter === "all" || v.employment_type === employmentFilter;
      const matchesOffice = officeFilter === "all" || v.office_division === officeFilter;

      return matchesSearch && matchesEmployment && matchesOffice;
    });

    // Sort
    switch (sortBy) {
      case "deadline":
        result = result.sort((a, b) => 
          new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime()
        );
        break;
      case "title":
        result = result.sort((a, b) => a.position_title.localeCompare(b.position_title));
        break;
      case "newest":
      default:
        // Already sorted by created_at desc from the query
        break;
    }

    return result;
  }, [vacancies, search, employmentFilter, officeFilter, sortBy]);

  const activeFiltersCount = [
    employmentFilter !== "all",
    officeFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setEmploymentFilter("all");
    setOfficeFilter("all");
    setSearch("");
  };

  const getEmploymentTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      permanent: "bg-success/15 text-success border-success/30",
      cos: "bg-info/15 text-info border-info/30",
      jo: "bg-warning/15 text-warning border-warning/30",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[type] || styles.permanent}`}>
        {EMPLOYMENT_TYPES[type as keyof typeof EMPLOYMENT_TYPES]}
      </span>
    );
  };

  return (
    <PublicLayout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge variant="outline" className="mb-3 text-primary border-primary">
            Careers
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Job Vacancies</h1>
          <p className="text-muted-foreground">
            Browse available positions at the Mines and Geosciences Bureau
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by position, office, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1.5 block">Employment Type</label>
                        <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="permanent">Permanent</SelectItem>
                            <SelectItem value="cos">Contract of Service (COS)</SelectItem>
                            <SelectItem value="jo">Job Order (JO)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1.5 block">Office/Division</label>
                        <Select value={officeFilter} onValueChange={setOfficeFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All offices" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Offices</SelectItem>
                            {uniqueOffices.map((office) => (
                              <SelectItem key={office} value={office}>
                                {office}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                          <X className="h-4 w-4" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredVacancies.length} of {vacancies.length} positions
            </span>
            {(search || activeFiltersCount > 0) && (
              <Button variant="link" size="sm" onClick={clearFilters} className="text-muted-foreground p-0 h-auto">
                Clear all filters
              </Button>
            )}
          </div>
        </motion.div>

        {/* Vacancy List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredVacancies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No vacancies found</h3>
                <p className="text-muted-foreground mb-4">
                  {search || activeFiltersCount > 0
                    ? "Try adjusting your search or filters"
                    : "Check back later for new openings"}
                </p>
                {(search || activeFiltersCount > 0) && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredVacancies.map((vacancy, index) => (
                <motion.div
                  key={vacancy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="group hover:shadow-md hover:border-primary/30 transition-all duration-200">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {vacancy.position_title}
                            </h3>
                            {getEmploymentTypeBadge(vacancy.employment_type)}
                            {vacancy.salary_grade && (
                              <Badge variant="outline" className="text-xs">
                                SG-{vacancy.salary_grade}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="h-4 w-4" />
                              {vacancy.office_division}
                            </span>
                            {vacancy.place_of_assignment && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                {vacancy.place_of_assignment}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {vacancy.slots} slot{vacancy.slots > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-xs text-muted-foreground">Deadline</div>
                            <div className="text-sm font-medium flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {format(new Date(vacancy.application_deadline), "MMM dd, yyyy")}
                            </div>
                          </div>
                          <Button asChild>
                            <Link to={`/vacancies/${vacancy.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </PublicLayout>
  );
}
