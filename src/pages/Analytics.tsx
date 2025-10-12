import { useHealthAnalytics } from "@/hooks/useHealthAnalytics";
import { HealthScoreCard } from "@/components/analytics/HealthScoreCard";
import { RiskAssessmentPanel } from "@/components/analytics/RiskAssessmentPanel";
import { PregnancyProgressTracker } from "@/components/analytics/PregnancyProgressTracker";
import { InfantGrowthTracker } from "@/components/analytics/InfantGrowthTracker";
import { HealthMetricsTimeline } from "@/components/analytics/HealthMetricsTimeline";
import { AppointmentsSummaryCard } from "@/components/analytics/AppointmentsSummaryCard";
import { CarePlanStatus } from "@/components/analytics/CarePlanStatus";
import { DataQualityIndicator } from "@/components/analytics/DataQualityIndicator";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { analytics, loading, error, refetch } = useHealthAnalytics();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-lg text-muted-foreground">{error || 'No analytics data available'}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your health journey and care progress
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Primary Widgets */}
        <HealthScoreCard
          score={analytics.healthMetrics.healthScore.score}
          grade={analytics.healthMetrics.healthScore.grade}
          insights={analytics.healthMetrics.healthScore.insights}
        />

        <RiskAssessmentPanel
          level={analytics.riskAssessment.level}
          score={analytics.riskAssessment.score}
          factors={analytics.riskAssessment.factors}
          activeConditions={analytics.riskAssessment.activeConditions}
          activeMedications={analytics.riskAssessment.activeMedications}
        />

        {/* Pregnancy Progress (if pregnant) */}
        {analytics.pregnancy && (
          <PregnancyProgressTracker
            currentWeek={analytics.pregnancy.currentWeek}
            currentDay={analytics.pregnancy.currentDay}
            dueDate={analytics.pregnancy.dueDate}
            trimester={analytics.pregnancy.trimester}
            daysUntilDue={analytics.pregnancy.daysUntilDue}
            nextMilestones={analytics.pregnancy.nextMilestones}
            expectedWeightGain={analytics.pregnancy.expectedWeightGain}
          />
        )}

        {/* Appointments Summary */}
        <AppointmentsSummaryCard
          total={analytics.appointments.total}
          upcoming={analytics.appointments.upcoming}
          completed={analytics.appointments.completed}
        />

        {/* Care Plan Status */}
        <CarePlanStatus
          pendingScreenings={analytics.upcomingCare.pendingScreenings}
          dueVaccinations={analytics.upcomingCare.dueVaccinations}
        />

        {/* Data Quality Indicator */}
        <DataQualityIndicator
          completeness={analytics.dataQuality.completeness}
          recency={analytics.dataQuality.recency}
          consistency={analytics.dataQuality.consistency}
        />
      </div>

      {/* Health Metrics Timeline (Full Width) */}
      <HealthMetricsTimeline
        weightGain={analytics.healthMetrics.weightGain}
        bloodPressure={analytics.healthMetrics.bloodPressure}
      />
    </div>
  );
}
