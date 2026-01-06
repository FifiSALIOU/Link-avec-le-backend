import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TypeManagement } from "@/components/admin/TypeManagement";

export default function TypesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Types
          </h2>
          <p className="text-muted-foreground">
            Gestion des types de tickets
          </p>
        </div>

        <TypeManagement />
      </div>
    </DashboardLayout>
  );
}


