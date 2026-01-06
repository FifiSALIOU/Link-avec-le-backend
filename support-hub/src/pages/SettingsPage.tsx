import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SystemSettings } from "@/components/admin/SystemSettings";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Paramètres
          </h2>
          <p className="text-muted-foreground">
            Configuration du système et des paramètres généraux
          </p>
        </div>

        <SystemSettings />
      </div>
    </DashboardLayout>
  );
}


