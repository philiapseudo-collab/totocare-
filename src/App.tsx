import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QuickActionFAB } from "@/components/QuickActionFAB";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { useProfile } from "./hooks/useProfile";
import { useEffect, lazy, Suspense } from "react";
import { medicationNotificationService } from "./lib/medicationNotifications";
import { MedicationAlertModal } from "./components/MedicationAlertModal";
import { registerServiceWorker } from "./lib/serviceWorkerRegistration";
import { PageLoader } from "@/components/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SmartBackButton } from "@/components/SmartBackButton";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { NetworkStatus } from "@/components/NetworkStatus";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Core pages imported directly to avoid dynamic import issues
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";

// Lazy load the rest of pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardFamilyPlanning = lazy(() => import("./pages/DashboardFamilyPlanning"));
const MyCycle = lazy(() => import("./pages/MyCycle"));
const CycleOnboarding = lazy(() => import("./pages/CycleOnboarding"));
const CycleCalendar = lazy(() => import("./pages/CycleCalendar"));
// Onboarding and Auth are imported statically above
const Vaccinations = lazy(() => import("./pages/Vaccinations"));
const Conditions = lazy(() => import("./pages/Conditions"));
const Journal = lazy(() => import("./pages/Journal"));
const Guides = lazy(() => import("./pages/Guides"));
const Support = lazy(() => import("./pages/Support"));
const FAQ = lazy(() => import("./pages/FAQ"));
const About = lazy(() => import("./pages/About"));
const ChecklistDetail = lazy(() => import("./pages/ChecklistDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Profile = lazy(() => import("./pages/Profile"));
const Checklist = lazy(() => import("./pages/Checklist"));
const QuickAdd = lazy(() => import("./pages/QuickAdd"));
const Upcoming = lazy(() => import("./pages/Upcoming"));
const RecentActivityPage = lazy(() => import("./pages/RecentActivity"));
const AddInfant = lazy(() => import("./pages/AddInfant"));
const Medications = lazy(() => import("./pages/Medications"));
const Donate = lazy(() => import("./pages/Donate"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotificationSettings = lazy(() => import("./pages/NotificationSettings"));
const SymptomChecker = lazy(() => import("./pages/SymptomChecker"));
const MedicationAlert = lazy(() => import("./pages/MedicationAlert"));
const MedicationAnalytics = lazy(() => import("./pages/MedicationAnalytics"));

// QueryClient is provided in main.tsx, no need to create it here

const AuthenticatedApp = () => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Check if user needs journey selection
  const needsJourneySelection = profile && !(profile as any).user_journey;

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
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Redirect to onboarding (journey selection) if user hasn't selected a journey yet
  if (needsJourneySelection && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to profile setup only if profile is incomplete AND user has selected a journey
  // Allow access to all other pages even if profile is incomplete
  if (profile && (profile as any).user_journey && !profile.profile_completed && (location.pathname === '/' || location.pathname === '/dashboard')) {
    return <Navigate to="/profile-setup" replace />;
  }

  // Redirect away from profile setup if already completed
  if (profile && profile.profile_completed && location.pathname === '/profile-setup') {
    return <Navigate to="/" replace />;
  }

  return (
    <ErrorBoundary>
      <NetworkStatus />
      <PullToRefresh>
        <div className="min-h-screen bg-background pb-20 md:pb-6">
          <AppHeader />
          <main className="container mx-auto px-4 py-4 sm:py-6">
            <div className="flex items-center gap-2 mb-4">
              <SmartBackButton />
            </div>
            <Breadcrumbs />
            <Suspense fallback={<PageLoader />}>
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
              <Route path="/medication-analytics" element={<MedicationAnalytics />} />
              <Route path="/my-cycle" element={<MyCycle />} />
              <Route path="/cycle-onboarding" element={<CycleOnboarding />} />
              <Route path="/cycle-calendar" element={<CycleCalendar />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
          {user && <QuickActionFAB />}
          {user && <MedicationAlertModal />}
          <MobileBottomNav />
        </div>
      </PullToRefresh>
    </ErrorBoundary>
  );
};

const App = () => (
  <LanguageProvider>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="lea-maternease-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthenticatedApp />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </LanguageProvider>
);

export default App;
