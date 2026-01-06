import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserManagement } from "@/components/admin/UserManagement";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Utilisateurs
          </h2>
          <p className="text-muted-foreground">
            Gestion des utilisateurs du système
          </p>
        </div>

        <UserManagement />
      </div>
    </DashboardLayout>
  );
}


