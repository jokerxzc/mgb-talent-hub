import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Plus, Edit, Trash2, GraduationCap, Briefcase, User } from "lucide-react";
import { EDUCATION_LEVELS } from "@/lib/constants";
import type { Tables } from "@/integrations/supabase/types";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: education } = useQuery({
    queryKey: ["education", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("educational_background")
        .select("*")
        .eq("user_id", user!.id)
        .order("year_graduated", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: workExperience } = useQuery({
    queryKey: ["work-experience", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_experience")
        .select("*")
        .eq("user_id", user!.id)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information</p>
        </div>

        {/* Personal Information */}
        <PersonalInfoCard profile={profile} isLoading={profileLoading} />

        {/* Educational Background */}
        <EducationCard education={education || []} userId={user?.id || ""} />

        {/* Work Experience */}
        <WorkExperienceCard workExperience={workExperience || []} userId={user?.id || ""} />
      </div>
    </DashboardLayout>
  );
}

function PersonalInfoCard({ profile, isLoading }: { profile: Tables<"profiles"> | null | undefined; isLoading: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    contact_number: "",
    address: "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Tables<"profiles">>) => {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", profile!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        middle_name: profile.middle_name || "",
        last_name: profile.last_name || "",
        suffix: profile.suffix || "",
        contact_number: profile.contact_number || "",
        address: profile.address || "",
      });
      setIsEditing(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middle_name">Middle Name</Label>
                <Input
                  id="middle_name"
                  value={formData.middle_name}
                  onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="suffix">Suffix</Label>
                <Input
                  id="suffix"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="Jr., Sr., III, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Full Name</Label>
              <p>{`${profile?.first_name || ""} ${profile?.middle_name || ""} ${profile?.last_name || ""} ${profile?.suffix || ""}`.trim() || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Email</Label>
              <p>{profile?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Contact Number</Label>
              <p>{profile?.contact_number || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Address</Label>
              <p>{profile?.address || "Not set"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EducationCard({ education, userId }: { education: Tables<"educational_background">[]; userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    level: "",
    school_name: "",
    degree: "",
    field_of_study: "",
    year_graduated: "",
    honors: "",
  });

  const resetForm = () => {
    setFormData({
      level: "",
      school_name: "",
      degree: "",
      field_of_study: "",
      year_graduated: "",
      honors: "",
    });
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Tables<"educational_background">>) => {
      const { error } = await supabase.from("educational_background").insert({
        ...data,
        user_id: userId,
      } as Tables<"educational_background">);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Education added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding education", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tables<"educational_background">> & { id: string }) => {
      const { error } = await supabase.from("educational_background").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Education updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating education", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("educational_background").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      toast({ title: "Education deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting education", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (item: Tables<"educational_background">) => {
    setFormData({
      level: item.level,
      school_name: item.school_name,
      degree: item.degree || "",
      field_of_study: item.field_of_study || "",
      year_graduated: item.year_graduated?.toString() || "",
      honors: item.honors || "",
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      year_graduated: formData.year_graduated ? parseInt(formData.year_graduated) : null,
    };
    if (editingId) {
      updateMutation.mutate({ ...data, id: editingId });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Educational Background
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Education" : "Add Education"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree/Course</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Input
                    id="field_of_study"
                    value={formData.field_of_study}
                    onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year_graduated">Year Graduated</Label>
                  <Input
                    id="year_graduated"
                    type="number"
                    value={formData.year_graduated}
                    onChange={(e) => setFormData({ ...formData, year_graduated: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="honors">Honors/Awards</Label>
                  <Input
                    id="honors"
                    value={formData.honors}
                    onChange={(e) => setFormData({ ...formData, honors: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Add Education"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {education.length > 0 ? (
          <div className="space-y-3">
            {education.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{item.school_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.level} {item.degree && `- ${item.degree}`}
                  </p>
                  {item.year_graduated && (
                    <p className="text-xs text-muted-foreground">Graduated: {item.year_graduated}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this education record?")) deleteMutation.mutate(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No education records added yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function WorkExperienceCard({ workExperience, userId }: { workExperience: Tables<"work_experience">[]; userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    position_title: "",
    company_name: "",
    start_date: "",
    end_date: "",
    is_current: false,
    monthly_salary: "",
    salary_grade: "",
    duties: "",
  });

  const resetForm = () => {
    setFormData({
      position_title: "",
      company_name: "",
      start_date: "",
      end_date: "",
      is_current: false,
      monthly_salary: "",
      salary_grade: "",
      duties: "",
    });
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Tables<"work_experience">>) => {
      const { error } = await supabase.from("work_experience").insert({
        ...data,
        user_id: userId,
      } as Tables<"work_experience">);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-experience"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Work experience added successfully" });
    },
    onError: (error) => {
      toast({ title: "Error adding work experience", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tables<"work_experience">> & { id: string }) => {
      const { error } = await supabase.from("work_experience").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-experience"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Work experience updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating work experience", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("work_experience").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-experience"] });
      toast({ title: "Work experience deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting work experience", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (item: Tables<"work_experience">) => {
    setFormData({
      position_title: item.position_title,
      company_name: item.company_name,
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current || false,
      monthly_salary: item.monthly_salary?.toString() || "",
      salary_grade: item.salary_grade || "",
      duties: item.duties || "",
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      end_date: formData.is_current ? null : formData.end_date || null,
      monthly_salary: formData.monthly_salary ? parseFloat(formData.monthly_salary) : null,
    };
    if (editingId) {
      updateMutation.mutate({ ...data, id: editingId });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Work Experience" : "Add Work Experience"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="company_name">Company/Organization *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    disabled={formData.is_current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Currently working here</span>
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_salary">Monthly Salary (₱)</Label>
                  <Input
                    id="monthly_salary"
                    type="number"
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_grade">Salary Grade</Label>
                  <Input
                    id="salary_grade"
                    value={formData.salary_grade}
                    onChange={(e) => setFormData({ ...formData, salary_grade: e.target.value })}
                    placeholder="If government"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duties">Duties and Responsibilities</Label>
                <Textarea
                  id="duties"
                  value={formData.duties}
                  onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Add Experience"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {workExperience.length > 0 ? (
          <div className="space-y-3">
            {workExperience.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{item.position_title}</p>
                  <p className="text-sm text-muted-foreground">{item.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(item.start_date), "MMM yyyy")} - {item.is_current ? "Present" : item.end_date ? format(new Date(item.end_date), "MMM yyyy") : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Delete this work experience?")) deleteMutation.mutate(item.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">No work experience added yet</p>
        )}
      </CardContent>
    </Card>
  );
}
