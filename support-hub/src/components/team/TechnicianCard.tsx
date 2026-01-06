import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/ticket";
import { Wrench, Monitor, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface TechnicianCardProps {
  technician: User;
  stats: {
    assigned: number;
    resolved: number;
    inProgress: number;
    reopened: number;
  };
}

export function TechnicianCard({ technician, stats }: TechnicianCardProps) {
  const specializationLabel = technician.specialization === "hardware" ? "Matériel" : "Applicatif";
  const SpecIcon = technician.specialization === "hardware" ? Wrench : Monitor;
  
  return (
    <Card className="border-border/50 hover:border-secondary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold text-lg">
            {technician.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">{technician.name}</h4>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <SpecIcon className="h-3 w-3" />
                {specializationLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{technician.email}</p>
            
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-info">
                  <Clock className="h-3 w-3" />
                  <span className="font-semibold text-sm">{stats.inProgress}</span>
                </div>
                <span className="text-xs text-muted-foreground">En cours</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-secondary">
                  <Wrench className="h-3 w-3" />
                  <span className="font-semibold text-sm">{stats.assigned}</span>
                </div>
                <span className="text-xs text-muted-foreground">Assignés</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-semibold text-sm">{stats.resolved}</span>
                </div>
                <span className="text-xs text-muted-foreground">Résolus</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-semibold text-sm">{stats.reopened}</span>
                </div>
                <span className="text-xs text-muted-foreground">Relancés</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
