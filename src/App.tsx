import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import LoginPage from "@/screens/LoginPage";
import RegisterPage from "@/screens/RegisterPage";
import ForgotPasswordPage from "@/screens/ForgotPasswordPage";
import DashboardRouter from "@/screens/DashboardRouter";
import AppointmentsPage from "@/screens/AppointmentsPage";
import MedicalRecordsPage from "@/screens/MedicalRecordsPage";
import AmbulanceTracking from "@/screens/AmbulanceTracking";
import HospitalDashboard from "@/screens/HospitalDashboard";
import WomenSafetyPage from "@/screens/WomenSafetyPage";
import FakeCalculator from "@/screens/FakeCalculator";
import AIRecommender from "@/screens/AIRecommender";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes: React.FC = () => {
  const { user } = useApp();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected - User */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/records" element={<ProtectedRoute><MedicalRecordsPage /></ProtectedRoute>} />
      <Route path="/ambulance" element={<ProtectedRoute><AmbulanceTracking /></ProtectedRoute>} />
      <Route path="/ai-doctor" element={<ProtectedRoute><AIRecommender /></ProtectedRoute>} />
      <Route path="/women-safety" element={<ProtectedRoute><WomenSafetyPage /></ProtectedRoute>} />
      <Route path="/calculator" element={<ProtectedRoute><FakeCalculator /></ProtectedRoute>} />

      {/* Protected - Admin */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><HospitalDashboard /></ProtectedRoute>} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
