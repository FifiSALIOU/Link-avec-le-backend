import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/ticket";
import { Users, Shield, Briefcase } from "lucide-react";

interface TeamMemberCardProps {
  member: User;
  showDepartment?: boolean;
}

const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  dsi: "DSI",
  adjoint: "Adjoint DSI",
  technician: "Technicien",
  admin: "Administrateur"
};

const roleColors: Record<string, string> = {
  user: "bg-info/10 text-info",
  dsi: "bg-secondary/10 text-secondary",
  adjoint: "bg-primary/10 text-primary",
  technician: "bg-success/10 text-success",
  admin: "bg-destructive/10 text-destructive"
};

export function TeamMemberCard({ member, showDepartment = true }: TeamMemberCardProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
          {member.avatar}
        </div>
        <div>
          <p className="font-medium text-foreground">{member.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {showDepartment && member.department && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {member.department}
              </span>
            )}
          </div>
        </div>
      </div>
      <Badge className={`${roleColors[member.role]} border-0`}>
        {roleLabels[member.role]}
      </Badge>
    </div>
  );
}

interface TeamListProps {
  title: string;
  members: User[];
  emptyMessage?: string;
}

export function TeamList({ title, members, emptyMessage = "Aucun membre" }: TeamListProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Users className="h-4 w-4 text-secondary" />
          {title}
          <Badge variant="secondary" className="ml-auto">{members.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {members.length > 0 ? (
          members.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
