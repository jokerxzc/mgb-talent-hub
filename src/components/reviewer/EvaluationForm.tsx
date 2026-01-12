import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "react-i18next"; // Import useTranslation

const evaluationSchema = z.object({
  score: z.coerce
    .number()
    .min(0, "score_must_be_at_least_0")
    .max(100, "score_cannot_exceed_100"),
  recommendation: z.string().min(1, "please_select_recommendation"),
  remarks: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

interface EvaluationFormProps {
  application: Tables<"applications"> & {
    vacancy: Tables<"vacancies"> | null;
    profile: Tables<"profiles"> | null;
  };
  onComplete: () => void;
  onCancel: () => void;
}

export function EvaluationForm({ application, onComplete, onCancel }: EvaluationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation(); // Initialize useTranslation
  const [loading, setLoading] = useState(false);
  const [existingEvaluation, setExistingEvaluation] = useState<Tables<"evaluations"> | null>(null);

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      score: 0,
      recommendation: "",
      remarks: "",
    },
  });

  useEffect(() => {
    fetchExistingEvaluation();
  }, [application.id]);

  const fetchExistingEvaluation = async () => {
    const { data } = await supabase
      .from("evaluations")
      .select("*")
      .eq("application_id", application.id)
      .eq("reviewer_id", user?.id)
      .maybeSingle();

    if (data) {
      setExistingEvaluation(data);
      form.reset({
        score: Number(data.score) || 0,
        recommendation: data.recommendation || "",
        remarks: data.remarks || "",
      });
    }
  };

  const onSubmit = async (values: EvaluationFormData) => {
    if (!user) return;

    setLoading(true);
    try {
      if (existingEvaluation) {
        // Update existing evaluation
        const { error } = await supabase
          .from("evaluations")
          .update({
            score: values.score,
            recommendation: values.recommendation,
            remarks: values.remarks || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingEvaluation.id);

        if (error) throw error;

        toast({
          title: t("evaluation_updated"),
          description: t("evaluation_updated_successfully"),
        });
      } else {
        // Create new evaluation
        const { error } = await supabase.from("evaluations").insert({
          application_id: application.id,
          reviewer_id: user.id,
          score: values.score,
          recommendation: values.recommendation,
          remarks: values.remarks || null,
        });

        if (error) throw error;

        toast({
          title: t("evaluation_submitted"),
          description: t("evaluation_submitted_successfully"),
        });
      }

      onComplete();
    } catch (error: any) {
      console.error("Error saving evaluation:", error);
      toast({
        title: t("error"),
        description: error.message || t("failed_to_save_evaluation"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Application Summary */}
      <div className="bg-muted p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">{t("reference_number_label")}</p>
            <p className="font-mono font-medium">{application.reference_number}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("position_label")}</p>
            <p className="font-medium">{application.vacancy?.position_title}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("applicant_label")}</p>
            <p className="font-medium">
              {application.profile?.first_name} {application.profile?.last_name}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("office_division_label")}</p>
            <p className="font-medium">{application.vacancy?.office_division}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("score")} (0-100)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder={t("enter_score")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recommendation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("recommendation")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("select_recommendation")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="highly_recommended">{t("highly_recommended")}</SelectItem>
                    <SelectItem value="recommended">{t("recommended")}</SelectItem>
                    <SelectItem value="for_further_review">{t("for_further_review")}</SelectItem>
                    <SelectItem value="not_recommended">{t("not_recommended")}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("remarks_optional")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("enter_additional_remarks")}
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingEvaluation ? t("update_evaluation") : t("submit_evaluation")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}