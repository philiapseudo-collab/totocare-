import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n/config";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DashboardFamilyPlanning from "./pages/DashboardFamilyPlanning";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Vaccinations from "./pages/Vaccinations";
import Conditions from "./pages/Conditions";
import Journal from "./pages/Journal";
import Guides from "./pages/Guides";
import Support from "./pages/Support";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import ChecklistDetail from "./pages/ChecklistDetail";
import NotFound from "./pages/NotFound";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import Checklist from "./pages/Checklist";
import QuickAdd from "./pages/QuickAdd";
import Upcoming from "./pages/Upcoming";
import RecentActivityPage from "./pages/RecentActivity";
import AddInfant from "./pages/AddInfant";
import Medications from "./pages/Medications";
import Donate from "./pages/Donate";
import Analytics from "./pages/Analytics";
import NotificationSettings from "./pages/NotificationSettings";
import SymptomChecker from "./pages/SymptomChecker";
import MedicationAlert from "./pages/MedicationAlert";
import { useProfile } from "./hooks/useProfile";
import { useEffect } from "react";
import { medicationNotificationService } from "./lib/medicationNotifications";
import { MedicationAlertModal } from "./components/MedicationAlertModal";
import { registerServiceWorker } from "./lib/serviceWorkerRegistration";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Check if user needs onboarding
  const needsOnboarding = profile && !(profile as any).user_journey;

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log("[App] Service Worker registered successfully");
      }
    });
  }, []);

  // Initialize medication notifications when user is authenticated
  useEffect(() => {
    if (user && profile?.id) {
      // Only start monitoring, don't auto-request permission
      // User will explicitly enable notifications in settings
      medicationNotificationService.startMonitoring(profile.id);
      
      return () => {
        medicationNotificationService.stopMonitoring();
      };
    }
  }, [user, profile?.id]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Redirect to onboarding if user hasn't selected a journey yet
  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to profile setup only if profile is incomplete AND user is trying to access dashboard
  // Allow access to all other pages even if profile is incomplete
  if (profile && !profile.profile_completed && (location.pathname === '/' || location.pathname === '/dashboard')) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Redirect away from profile setup if already completed
  if (profile && profile.profile_completed && location.pathname === '/profile-setup') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-4 sm:py-6">
        <Routes>
          <Route path="/" element={
            (profile as any)?.user_journey === 'family_planning' 
              ? <DashboardFamilyPlanning /> 
              : <Dashboard />
          } />
          <Route path="/dashboard" element={
            (profile as any)?.user_journey === 'family_planning' 
              ? <DashboardFamilyPlanning /> 
              : <Dashboard />
          } />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/checklist" element={<Checklist />} />
          <Route path="/quick-add" element={<QuickAdd />} />
          <Route path="/upcoming" element={<Upcoming />} />
          <Route path="/recent-activity" element={<RecentActivityPage />} />
          <Route path="/add-infant" element={<AddInfant />} />
          <Route path="/vaccinations" element={<Vaccinations />} />
          <Route path="/conditions" element={<Conditions />} />
          <Route path="/medications" element={<Medications />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/support" element={<Support />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/checklist-detail" element={<ChecklistDetail />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/medication-alert" element={<MedicationAlert />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {user && <QuickActionFAB />}
      {user && <MedicationAlertModal />}
    </div>
  );
};

const App = () => (
  <I18nextProvider i18n={i18n}>
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="lea-maternease-ui-theme">
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
    </LanguageProvider>
  </I18nextProvider>
);

export default App;
