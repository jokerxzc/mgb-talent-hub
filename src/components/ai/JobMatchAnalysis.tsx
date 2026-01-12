import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface JobMatchAnalysisProps {
  vacancy: {
    position_title: string;
    qualification_education?: string | null;
    qualification_experience?: string | null;
    qualification_training?: string | null;
    qualification_eligibility?: string | null;
  };
  userEducation?: string[];
  userExperience?: string[];
}

export function JobMatchAnalysis({ vacancy, userEducation = [], userExperience = [] }: JobMatchAnalysisProps) {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation(); // Initialize useTranslation

  const analyzeMatch = async () => {
    setIsLoading(true);
    setIsExpanded(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "job-match",
          context: {
            vacancyTitle: vacancy.position_title,
            vacancyRequirements: {
              education: vacancy.qualification_education,
              experience: vacancy.qualification_experience,
              training: vacancy.qualification_training,
              eligibility: vacancy.qualification_eligibility,
            },
            userProfile: {
              education: userEducation,
              experience: userExperience,
            },
          },
        },
      });

      if (error) throw error;
      setAnalysis(data.response);
    } catch (error) {
      console.error("Match analysis error:", error);
      toast({
        title: t("analysis_failed"),
        description: t("unable_to_analyze_match"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchIcon = () => {
    if (!analysis) return <Sparkles className="h-4 w-4" />;
    
    const lowerAnalysis = analysis.toLowerCase();
    if (lowerAnalysis.includes("excellent")) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    } else if (lowerAnalysis.includes("good")) {
      return <TrendingUp className="h-4 w-4 text-primary" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={analyzeMatch}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="w-full gap-2 border-primary/30 hover:bg-primary/5"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary" />
        )}
        {isLoading ? t("analyzing") : t("ai_match_analysis")}
      </Button>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">{t("analyzing_qualifications")}</span>
                </div>
              ) : analysis ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium text-sm">
                    {getMatchIcon()}
                    {t("ai_analysis")}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {analysis}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}