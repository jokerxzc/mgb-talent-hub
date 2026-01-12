import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { User, LogOut, LayoutDashboard, FileText, Briefcase, Menu, X, ChevronRight, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next"; // Import useTranslation

export function MainHeader() {
  const { user, role, signOut, isHRAdmin, isReviewer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation(); // Initialize useTranslation

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileMenuOpen(false);
  };

  const getDashboardRoute = () => {
    if (isHRAdmin) return ROUTES.HR_DASHBOARD;
    if (isReviewer) return ROUTES.REVIEWER_DASHBOARD;
    return ROUTES.APPLICANT_DASHBOARD;
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: ROUTES.HOME, label: t("home") },
    { path: ROUTES.VACANCIES, label: t("job_vacancies") },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="h-10 w-10 flex-shrink-0"
            >
              <img src="/mgb-logo.png" alt="MGB Logo" className="h-full w-full object-contain" />
            </motion.div>
            <div className="hidden sm:block">
              <p className="font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                {t("mgb_region_2")}
              </p>
              <p className="text-xs text-muted-foreground">{t("online_job_application_system")}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors relative",
                  isActive(link.path) 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")} className={cn(i18n.language === "en" && "bg-muted font-medium")}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("fil")} className={cn(i18n.language === "fil" && "bg-muted font-medium")}>
                Filipino
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("my_account")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {role === "hr_admin" ? t("hr_administrator") : role === "reviewer" ? t("reviewer") : t("applicant")}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardRoute())}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("dashboard")}
                </DropdownMenuItem>
                {!isHRAdmin && !isReviewer && (
                  <>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.APPLICANT_APPLICATIONS)}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t("my_applications")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(ROUTES.APPLICANT_PROFILE)}>
                      <User className="mr-2 h-4 w-4" />
                      {t("profile")}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("sign_out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to={ROUTES.AUTH}>{t("sign_in")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to={`${ROUTES.AUTH}?mode=register`}>{t("register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm md:hidden z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg md:hidden z-50"
            >
              <nav className="container py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors",
                        isActive(link.path)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {link.label}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="my-3 border-t" />

                {/* Auth buttons for mobile */}
                {!user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2 px-4"
                  >
                    <Button asChild className="w-full" size="lg">
                      <Link to={`${ROUTES.AUTH}?mode=register`}>{t("register")}</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link to={ROUTES.AUTH}>{t("sign_in")}</Link>
                    </Button>
                  </motion.div>
                )}

                {/* User menu for mobile */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-1"
                  >
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {role === "hr_admin" ? t("hr_administrator") : role === "reviewer" ? t("reviewer") : t("applicant")}
                      </p>
                    </div>
                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t("dashboard")}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    {!isHRAdmin && !isReviewer && (
                      <>
                        <Link
                          to={ROUTES.APPLICANT_APPLICATIONS}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {t("my_applications")}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                        <Link
                          to={ROUTES.APPLICANT_PROFILE}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {t("profile")}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("sign_out")}
                    </button>
                  </motion.div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}