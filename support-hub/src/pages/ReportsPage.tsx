import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ReportsSection } from "@/components/admin/ReportsSection";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Rapports
          </h2>
          <p className="text-muted-foreground">
            Rapports et statistiques détaillées
          </p>
        </div>

        <ReportsSection />
      </div>
    </DashboardLayout>
  );
}


