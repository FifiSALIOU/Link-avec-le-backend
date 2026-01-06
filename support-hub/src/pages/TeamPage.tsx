import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { getTechnicianStats } from "@/data/mockData";
import { Wrench } from "lucide-react";
import { TechnicianCard } from "@/components/team/TechnicianCard";
import { TeamList } from "@/components/team/TeamMemberCard";

export default function TeamPage() {
  const { tickets, users } = useApp();

  const technicians = users.filter(u => u.role === "technician");
  const teamMembers = users.filter(u => ["dsi", "adjoint", "technician"].includes(u.role));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Équipe
          </h2>
          <p className="text-muted-foreground">
            Gestion des membres de l'équipe DSI et des techniciens
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TeamList 
            title="Membres de l'équipe DSI" 
            members={teamMembers} 
          />
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold flex items-center gap-2">
              <Wrench className="h-5 w-5 text-secondary" />
              Techniciens
            </h3>
            <div className="space-y-3">
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
      </div>
    </DashboardLayout>
  );
}


