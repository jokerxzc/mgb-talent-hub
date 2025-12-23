import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

type AppRole = "applicant" | "hr_admin" | "reviewer";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.AUTH} state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === "hr_admin") {
      return <Navigate to={ROUTES.HR_DASHBOARD} replace />;
    }
    if (role === "reviewer") {
      return <Navigate to={ROUTES.REVIEWER_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.APPLICANT_DASHBOARD} replace />;
  }

  return <>{children}</>;
}
