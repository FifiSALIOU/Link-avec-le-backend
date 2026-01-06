import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CategoryManagement } from "@/components/admin/CategoryManagement";

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Catégories
          </h2>
          <p className="text-muted-foreground">
            Gestion des catégories de tickets
          </p>
        </div>

        <CategoryManagement />
      </div>
    </DashboardLayout>
  );
}


