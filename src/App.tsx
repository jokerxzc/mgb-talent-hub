import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vacancies from "./pages/Vacancies";
import ApplicantDashboard from "./pages/dashboard/ApplicantDashboard";
import NotFound from "./pages/NotFound";

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
            
            {/* Applicant routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["applicant"]}>
                  <ApplicantDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* HR Admin routes - placeholder */}
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["hr_admin"]}>
                  <ApplicantDashboard />
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
