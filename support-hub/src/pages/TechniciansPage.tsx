import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { getTechnicianStats } from "@/data/mockData";
import { TechnicianCard } from "@/components/team/TechnicianCard";

export default function TechniciansPage() {
  const { tickets, users } = useApp();

  const technicians = users.filter(u => u.role === "technician");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Techniciens
          </h2>
          <p className="text-muted-foreground">
            Gestion des techniciens et de leur charge de travail
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-display font-semibold">
            Équipe technique ({technicians.length} techniciens)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {technicians.map(tech => (
              <TechnicianCard 
                key={tech.id} 
                technician={tech} 
                stats={getTechnicianStats(tickets, tech.id)} 
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


