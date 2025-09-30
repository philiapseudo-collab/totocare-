import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/AuthForm";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import Vaccinations from "./pages/Vaccinations";
import ClinicVisits from "./pages/ClinicVisits";
import ReproductiveHealth from "./pages/ReproductiveHealth";
import Screenings from "./pages/Screenings";
import Conditions from "./pages/Conditions";
import Journal from "./pages/Journal";
import Guides from "./pages/Guides";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import ChecklistDetail from "./pages/ChecklistDetail";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";
import { useProfile } from "./hooks/useProfile";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  // Redirect to profile setup if profile is not completed
  if (profile && !profile.profile_completed && window.location.pathname !== '/profile-setup') {
    return <ProfileSetup />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/vaccinations" element={<Vaccinations />} />
          <Route path="/clinic-visits" element={<ClinicVisits />} />
          <Route path="/reproductive-health" element={<ReproductiveHealth />} />
          <Route path="/screenings" element={<Screenings />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/checklist-detail" element={<ChecklistDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="nurturecare-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthenticatedApp />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
