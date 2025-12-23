import { cn } from "@/lib/utils";
import { APPLICATION_STATUS, VACANCY_STATUS } from "@/lib/constants";

type ApplicationStatusType = keyof typeof APPLICATION_STATUS;
type VacancyStatusType = keyof typeof VACANCY_STATUS;

interface StatusBadgeProps {
  status: ApplicationStatusType | VacancyStatusType;
  type?: "application" | "vacancy";
  className?: string;
}

const applicationStatusStyles: Record<ApplicationStatusType, string> = {
  submitted: "status-submitted",
  under_review: "status-under-review",
  shortlisted: "status-shortlisted",
  interview: "status-interview",
  selected: "status-selected",
  not_selected: "status-not-selected",
};

const vacancyStatusStyles: Record<VacancyStatusType, string> = {
  draft: "bg-muted text-muted-foreground border border-border",
  published: "bg-success/15 text-success border border-success/30",
  closed: "bg-warning/15 text-warning border border-warning/30",
  archived: "bg-muted text-muted-foreground border border-border",
};

export function StatusBadge({ status, type = "application", className }: StatusBadgeProps) {
  const label =
    type === "application"
      ? APPLICATION_STATUS[status as ApplicationStatusType]
      : VACANCY_STATUS[status as VacancyStatusType];

  const styles =
    type === "application"
      ? applicationStatusStyles[status as ApplicationStatusType]
      : vacancyStatusStyles[status as VacancyStatusType];

  return (
    <span className={cn("status-badge", styles, className)}>
      {label}
    </span>
  );
}
