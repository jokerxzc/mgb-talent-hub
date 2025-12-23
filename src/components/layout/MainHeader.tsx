import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, LayoutDashboard, FileText, Briefcase, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants";

export function MainHeader() {
  const { user, role, signOut, isHRAdmin, isReviewer } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (isHRAdmin) return ROUTES.HR_DASHBOARD;
    if (isReviewer) return ROUTES.REVIEWER_DASHBOARD;
    return ROUTES.APPLICANT_DASHBOARD;
  };

  const NavLinks = () => (
    <>
      <Link
        to={ROUTES.HOME}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to={ROUTES.VACANCIES}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setMobileMenuOpen(false)}
      >
        Job Vacancies
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-foreground leading-tight">
                Mines and Geosciences Bureau
              </p>
              <p className="text-xs text-muted-foreground">Online Job Application System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <NavLinks />
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {role?.replace("_", " ") || "Applicant"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {!isHRAdmin && !isReviewer && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.APPLICANT_APPLICATIONS)}>
                      <FileText className="mr-2 h-4 w-4" />
                      My Applications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.APPLICANT_PROFILE)}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.AUTH}>Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`${ROUTES.AUTH}?mode=register`}>Register</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
