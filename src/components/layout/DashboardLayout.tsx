import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  FolderOpen,
  Users,
  BarChart3,
  LogOut,
  Menu,
  ChevronLeft,
  ClipboardCheck,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { role, signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getNavItems = (): NavItem[] => {
    if (role === "hr_admin") {
      return [
        { label: "Dashboard", href: ROUTES.HR_DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "Vacancies", href: ROUTES.HR_VACANCIES, icon: <Briefcase className="h-5 w-5" /> },
        { label: "Applications", href: ROUTES.HR_APPLICATIONS, icon: <FileText className="h-5 w-5" /> },
        { label: "Reports", href: ROUTES.HR_REPORTS, icon: <BarChart3 className="h-5 w-5" /> },
        { label: "Users", href: ROUTES.HR_USERS, icon: <Users className="h-5 w-5" /> },
      ];
    }

    if (role === "reviewer") {
      return [
        { label: "Dashboard", href: ROUTES.REVIEWER_DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: "Assigned Applications", href: ROUTES.REVIEWER_APPLICATIONS, icon: <ClipboardCheck className="h-5 w-5" /> },
      ];
    }

    // Applicant
    return [
      { label: "Dashboard", href: ROUTES.APPLICANT_DASHBOARD, icon: <LayoutDashboard className="h-5 w-5" /> },
      { label: "My Applications", href: ROUTES.APPLICANT_APPLICATIONS, icon: <FileText className="h-5 w-5" /> },
      { label: "My Documents", href: ROUTES.APPLICANT_DOCUMENTS, icon: <FolderOpen className="h-5 w-5" /> },
      { label: "Profile", href: ROUTES.APPLICANT_PROFILE, icon: <User className="h-5 w-5" /> },
    ];
  };

  const navItems = getNavItems();

  const getRoleLabel = () => {
    switch (role) {
      case "hr_admin":
        return "HR Administrator";
      case "reviewer":
        return "Reviewer";
      default:
        return "Applicant";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            {sidebarOpen && (
              <Link to="/" className="flex items-center gap-2">
                <img src="/mgb-logo.png" alt="MGB Logo" className="h-8 w-8 object-contain" />
                <span className="font-semibold text-sidebar-foreground text-sm">MGB Jobs</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* User info */}
          {sidebarOpen && (
            <div className="border-b border-sidebar-border p-4">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.email}
              </p>
              <p className="text-xs text-sidebar-foreground/70">{getRoleLabel()}</p>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className={cn(
                "w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-destructive",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="ml-3">Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}