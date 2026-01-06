import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RoleManagement } from "@/components/admin/RoleManagement";

export default function RolesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Rôles
          </h2>
          <p className="text-muted-foreground">
            Gestion des rôles et des permissions
          </p>
        </div>

        <RoleManagement />
      </div>
    </DashboardLayout>
  );
}


