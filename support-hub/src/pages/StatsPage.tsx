import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { getWeeklyStats, getMonthlyStats, getPriorityDistribution, getStatusDistribution } from "@/data/mockData";
import { WeeklyTicketsChart } from "@/components/charts/WeeklyTicketsChart";
import { MonthlyTicketsChart } from "@/components/charts/MonthlyTicketsChart";
import { DistributionChart } from "@/components/charts/DistributionChart";

export default function StatsPage() {
  const { tickets } = useApp();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Statistiques
          </h2>
          <p className="text-muted-foreground">
            Analyse des données et tendances des tickets
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyTicketsChart data={getWeeklyStats()} />
          <MonthlyTicketsChart data={getMonthlyStats()} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <DistributionChart title="Répartition par priorité" data={getPriorityDistribution(tickets)} />
          <DistributionChart title="Répartition par statut" data={getStatusDistribution(tickets)} />
        </div>
      </div>
    </DashboardLayout>
  );
}


