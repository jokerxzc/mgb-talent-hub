import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Search, Edit, Trash2, Eye, Users } from "lucide-react";
import { EMPLOYMENT_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

type Vacancy = Tables<"vacancies">;

export default function HRVacancies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);

  const { data: vacancies, isLoading } = useQuery({
    queryKey: ["hr-vacancies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacancies")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (vacancy: Partial<Vacancy>) => {
      const { error } = await supabase.from("vacancies").insert({
        ...vacancy,
        created_by: user?.id,
      } as Tables<"vacancies">);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-vacancies"] });
      setIsCreateOpen(false);
      toast({ title: "Vacancy created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating vacancy", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Vacancy> & { id: string }) => {
      const { error } = await supabase
        .from("vacancies")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-vacancies"] });
      setEditingVacancy(null);
      toast({ title: "Vacancy updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating vacancy", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vacancies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-vacancies"] });
      toast({ title: "Vacancy deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting vacancy", description: error.message, variant: "destructive" });
    },
  });

  const filteredVacancies = vacancies?.filter((v) =>
    v.position_title.toLowerCase().includes(search.toLowerCase()) ||
    v.office_division.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vacancy Management</h1>
            <p className="text-muted-foreground">Create and manage job postings</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Vacancy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Vacancy</DialogTitle>
              </DialogHeader>
              <VacancyForm
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vacancies..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredVacancies && filteredVacancies.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Office/Division</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVacancies.map((vacancy) => (
                      <TableRow key={vacancy.id}>
                        <TableCell className="font-medium">{vacancy.position_title}</TableCell>
                        <TableCell>{vacancy.office_division}</TableCell>
                        <TableCell>
                          {EMPLOYMENT_TYPES[vacancy.employment_type as keyof typeof EMPLOYMENT_TYPES]}
                        </TableCell>
                        <TableCell>
                          {format(new Date(vacancy.application_deadline), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={vacancy.status || "draft"} type="vacancy" />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingVacancy(vacancy)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this vacancy?")) {
                                  deleteMutation.mutate(vacancy.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No vacancies found. Create your first vacancy to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingVacancy} onOpenChange={() => setEditingVacancy(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Vacancy</DialogTitle>
            </DialogHeader>
            {editingVacancy && (
              <VacancyForm
                initialData={editingVacancy}
                onSubmit={(data) => updateMutation.mutate({ ...data, id: editingVacancy.id })}
                isLoading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

interface VacancyFormProps {
  initialData?: Vacancy;
  onSubmit: (data: Partial<Vacancy>) => void;
  isLoading: boolean;
}

function VacancyForm({ initialData, onSubmit, isLoading }: VacancyFormProps) {
  const [formData, setFormData] = useState({
    position_title: initialData?.position_title || "",
    office_division: initialData?.office_division || "",
    employment_type: initialData?.employment_type || "permanent",
    salary_grade: initialData?.salary_grade || "",
    daily_rate: initialData?.daily_rate?.toString() || "",
    slots: initialData?.slots?.toString() || "1",
    place_of_assignment: initialData?.place_of_assignment || "",
    application_deadline: initialData?.application_deadline
      ? format(new Date(initialData.application_deadline), "yyyy-MM-dd")
      : "",
    description: initialData?.description || "",
    qualification_education: initialData?.qualification_education || "",
    qualification_experience: initialData?.qualification_experience || "",
    qualification_training: initialData?.qualification_training || "",
    qualification_eligibility: initialData?.qualification_eligibility || "",
    status: initialData?.status || "draft",
    required_documents: initialData?.required_documents || ["application_letter", "pds", "resume"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      daily_rate: formData.daily_rate ? parseFloat(formData.daily_rate) : null,
      slots: parseInt(formData.slots) || 1,
      application_deadline: new Date(formData.application_deadline).toISOString(),
    } as Partial<Vacancy>);
  };

  const toggleDocument = (doc: string) => {
    setFormData((prev) => ({
      ...prev,
      required_documents: prev.required_documents.includes(doc)
        ? prev.required_documents.filter((d) => d !== doc)
        : [...prev.required_documents, doc],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position_title">Position Title *</Label>
          <Input
            id="position_title"
            value={formData.position_title}
            onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="office_division">Office/Division *</Label>
          <Input
            id="office_division"
            value={formData.office_division}
            onChange={(e) => setFormData({ ...formData, office_division: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employment_type">Employment Type *</Label>
          <Select
            value={formData.employment_type}
            onValueChange={(value) => setFormData({ ...formData, employment_type: value as "permanent" | "cos" | "jo" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EMPLOYMENT_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_grade">Salary Grade</Label>
          <Input
            id="salary_grade"
            value={formData.salary_grade}
            onChange={(e) => setFormData({ ...formData, salary_grade: e.target.value })}
            placeholder="e.g., SG-15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="daily_rate">Daily Rate (₱)</Label>
          <Input
            id="daily_rate"
            type="number"
            value={formData.daily_rate}
            onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
            placeholder="For COS/JO"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slots">Number of Slots</Label>
          <Input
            id="slots"
            type="number"
            min="1"
            value={formData.slots}
            onChange={(e) => setFormData({ ...formData, slots: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="place_of_assignment">Place of Assignment</Label>
          <Input
            id="place_of_assignment"
            value={formData.place_of_assignment}
            onChange={(e) => setFormData({ ...formData, place_of_assignment: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="application_deadline">Application Deadline *</Label>
          <Input
            id="application_deadline"
            type="date"
            value={formData.application_deadline}
            onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qualification_education">Education Requirements</Label>
          <Textarea
            id="qualification_education"
            value={formData.qualification_education}
            onChange={(e) => setFormData({ ...formData, qualification_education: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualification_experience">Experience Requirements</Label>
          <Textarea
            id="qualification_experience"
            value={formData.qualification_experience}
            onChange={(e) => setFormData({ ...formData, qualification_experience: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qualification_training">Training Requirements</Label>
          <Textarea
            id="qualification_training"
            value={formData.qualification_training}
            onChange={(e) => setFormData({ ...formData, qualification_training: e.target.value })}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualification_eligibility">Eligibility Requirements</Label>
          <Textarea
            id="qualification_eligibility"
            value={formData.qualification_eligibility}
            onChange={(e) => setFormData({ ...formData, qualification_eligibility: e.target.value })}
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Required Documents</Label>
        <div className="grid sm:grid-cols-2 gap-2">
          {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.required_documents.includes(key)}
                onChange={() => toggleDocument(key)}
                className="rounded border-input"
              />
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as "draft" | "published" | "closed" | "archived" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Vacancy" : "Create Vacancy"}
        </Button>
      </div>
    </form>
  );
}
