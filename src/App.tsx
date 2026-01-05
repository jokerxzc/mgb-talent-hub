import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Public pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vacancies from "./pages/Vacancies";
import VacancyDetail from "./pages/VacancyDetail";
import NotFound from "./pages/NotFound";

// Applicant pages
import ApplicantDashboard from "./pages/dashboard/ApplicantDashboard";
import Profile from "./pages/applicant/Profile";
import Documents from "./pages/applicant/Documents";
import Applications from "./pages/applicant/Applications";

// HR Admin pages
import HRDashboard from "./pages/hr/HRDashboard";
import HRVacancies from "./pages/hr/HRVacancies";
import HRApplications from "./pages/hr/HRApplications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/vacancies" element={<Vacancies />} />
            <Route path="/vacancies/:id" element={<VacancyDetail />} />
            
            {/* Applicant routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["applicant"]}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["applicant"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-documents"
              element={
                <ProtectedRoute allowedRoles={["applicant"]}>
                  <Documents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute allowedRoles={["applicant"]}>
                  <Applications />
                </ProtectedRoute>
              }
            />
            
            {/* HR Admin routes */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <HRDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/vacancies"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <HRVacancies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr/applications"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <HRApplications />
                </ProtectedRoute>
              }
            />
            
            {/* Reviewer routes - placeholder */}
            <Route
              path="/reviewer"
              element={
                <ProtectedRoute allowedRoles={["reviewer"]}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
