import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, Star } from "lucide-react";
import { format } from "date-fns";

interface EvaluationWithDetails {
  id: string;
  application_id: string;
  score: number | null;
  recommendation: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  application: {
    reference_number: string;
    vacancy: {
      position_title: string;
    } | null;
    profile: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export default function ReviewerEvaluations() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState<EvaluationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEval, setSelectedEval] = useState<EvaluationWithDetails | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEvaluations();
    }
  }, [user]);

  const fetchEvaluations = async () => {
    try {
      const { data: evalData, error } = await supabase
        .from("evaluations")
        .select(`
          *,
          application:applications(
            reference_number,
            user_id,
            vacancy:vacancies(position_title)
          )
        `)
        .eq("reviewer_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(evalData?.map((e) => e.application?.user_id).filter(Boolean) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("first_name, last_name, user_id")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      const evalsWithProfiles = evalData?.map((evaluation) => ({
        ...evaluation,
        application: evaluation.application
          ? {
              ...evaluation.application,
              profile: profileMap.get(evaluation.application.user_id) || null,
            }
          : null,
      }));

      setEvaluations(evalsWithProfiles as EvaluationWithDetails[]);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getRecommendationBadge = (rec: string | null) => {
    if (!rec) return null;
    const colors: Record<string, string> = {
      "highly_recommended": "bg-success/10 text-success",
      "recommended": "bg-primary/10 text-primary",
      "not_recommended": "bg-destructive/10 text-destructive",
      "for_further_review": "bg-warning/10 text-warning",
    };
    const labels: Record<string, string> = {
      "highly_recommended": "Highly Recommended",
      "recommended": "Recommended",
      "not_recommended": "Not Recommended",
      "for_further_review": "For Further Review",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[rec] || ""}`}>
        {labels[rec] || rec}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your submitted evaluations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submitted Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading evaluations...
              </div>
            ) : evaluations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't submitted any evaluations yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference No.</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Evaluated On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell className="font-mono text-sm">
                          {evaluation.application?.reference_number}
                        </TableCell>
                        <TableCell>
                          {evaluation.application?.profile?.first_name}{" "}
                          {evaluation.application?.profile?.last_name}
                        </TableCell>
                        <TableCell>
                          {evaluation.application?.vacancy?.position_title}
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(evaluation.score)}`}>
                            {evaluation.score !== null ? `${evaluation.score}%` : "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getRecommendationBadge(evaluation.recommendation)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(evaluation.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEval(evaluation);
                              setShowDetail(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {selectedEval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference Number</p>
                  <p className="font-mono">{selectedEval.application?.reference_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p>{selectedEval.application?.vacancy?.position_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applicant</p>
                  <p>
                    {selectedEval.application?.profile?.first_name}{" "}
                    {selectedEval.application?.profile?.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Evaluated On</p>
                  <p>{format(new Date(selectedEval.created_at), "MMMM d, yyyy")}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold">
                    {selectedEval.score !== null ? `${selectedEval.score}%` : "No Score"}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Recommendation</p>
                  {getRecommendationBadge(selectedEval.recommendation)}
                </div>
                {selectedEval.remarks && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Remarks</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{selectedEval.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
