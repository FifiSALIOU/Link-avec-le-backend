import { Ticket, TicketStatus, TicketPriority, TicketType } from "@/types/ticket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Monitor,
  Wrench,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Eye,
  UserPlus,
  Forward,
  CheckCircle2,
  RotateCcw,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  MessageSquare,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onAssign?: (ticket: Ticket) => void;
  onReassign?: (ticket: Ticket) => void;
  onDelegate?: (ticket: Ticket) => void;
  onEscalate?: (ticket: Ticket) => void;
  onResolve?: (ticket: Ticket) => void;
  onValidate?: (ticket: Ticket) => void;
  onReopen?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
  onTakeCharge?: (ticket: Ticket) => void;
  onAddComment?: (ticket: Ticket) => void;
  onRequestInfo?: (ticket: Ticket) => void;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "En attente d'assignation", className: "bg-info/10 text-info border-info/30" },
  assigned: { label: "Assigné au technicien", className: "bg-secondary/10 text-secondary border-secondary/30" },
  delegated: { label: "Délégué", className: "bg-warning/10 text-warning border-warning/30" },
  in_progress: { label: "En cours", className: "bg-primary/10 text-primary border-primary/30" },
  resolved: { label: "Résolu", className: "bg-success/10 text-success border-success/30" },
  closed: { label: "Cloturé", className: "bg-muted text-muted-foreground border-muted" },
  reopened: { label: "Rejeté", className: "bg-destructive/10 text-destructive border-destructive/30" },
};

const priorityConfig: Record<TicketPriority, { label: string; className: string }> = {
  low: { label: "Basse", className: "bg-muted text-muted-foreground" },
  medium: { label: "Moyenne", className: "bg-info/10 text-info" },
  high: { label: "Haute", className: "bg-warning/10 text-warning" },
  critical: { label: "Critique", className: "bg-destructive/10 text-destructive" },
};

export function TicketCard({
  ticket,
  onView,
  onAssign,
  onReassign,
  onDelegate,
  onEscalate,
  onResolve,
  onValidate,
  onReopen,
  onEdit,
  onDelete,
  onTakeCharge,
  onAddComment,
  onRequestInfo,
}: TicketCardProps) {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  const isCreator = currentUser?.id === ticket.createdBy.id;
  const isAssignedTechnician = ticket.assignedTo?.id === currentUser?.id;
  
  // Actions pour l'utilisateur créateur selon le statut du ticket
  // Le backend gérera les restrictions réelles
  const isUserRole = currentUser?.role === "user";
  const canViewDetails = isCreator; // Toujours disponible pour le créateur
  const canEdit = isCreator; // Toujours visible, backend bloquera si nécessaire
  const canDelete = isCreator; // Toujours visible, backend bloquera si nécessaire
  const canValidate = isCreator && ticket.status === "resolved"; // Uniquement si résolu
  const canRelance = isCreator && ticket.status === "resolved"; // Rejeter et relancer si résolu
  
  // Conditions pour chaque action selon le rôle et le statut (pour autres rôles)
  const canAssign = (currentUser?.role === "dsi" || currentUser?.role === "adjoint" || currentUser?.role === "admin") 
    && (ticket.status === "open" || ticket.status === "delegated");
  const canReassign = (currentUser?.role === "dsi" || currentUser?.role === "adjoint" || currentUser?.role === "admin")
    && ticket.assignedTo && (ticket.status === "assigned" || ticket.status === "in_progress");
  const canDelegate = currentUser?.role === "dsi" && (ticket.status === "open" || ticket.status === "delegated");
  const canEscalate = (currentUser?.role === "adjoint" || currentUser?.role === "dsi" || currentUser?.role === "admin")
    && ticket.status !== "closed" && ticket.status !== "resolved";
  const canResolve = isAssignedTechnician && (ticket.status === "assigned" || ticket.status === "in_progress");
  const canReopen = isCreator && ticket.status === "closed";
  const canTakeCharge = isAssignedTechnician && ticket.status === "assigned";
  // Les commentaires sont gérés via la modal de détails, pas directement depuis la card
  const canRequestInfo = isAssignedTechnician && (ticket.status === "assigned" || ticket.status === "in_progress");

  return (
    <div className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 shadow-card transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      {/* Priority indicator */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-xl",
          ticket.priority === "critical" && "bg-destructive",
          ticket.priority === "high" && "bg-warning",
          ticket.priority === "medium" && "bg-info",
          ticket.priority === "low" && "bg-muted-foreground/30"
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 pl-3">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-mono text-muted-foreground">
              {ticket.id}
            </span>
            <Badge variant="outline" className={cn("text-xs", status.className)}>
              {status.label}
            </Badge>
            <Badge variant="secondary" className={cn("text-xs", priority.className)}>
              {priority.label}
            </Badge>
            <Badge variant="outline" className="text-xs gap-1">
              {ticket.type === "hardware" ? (
                <Wrench className="h-3 w-3" />
              ) : (
                <Monitor className="h-3 w-3" />
              )}
              {ticket.type === "hardware" ? "Matériel" : "Applicatif"}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground truncate mb-2 group-hover:text-secondary transition-colors">
            {ticket.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {ticket.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-muted">
                  {ticket.createdBy.avatar}
                </AvatarFallback>
              </Avatar>
              <span>{ticket.createdBy.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(ticket.createdAt, {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3" />
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[10px] bg-secondary/20 text-secondary">
                    {ticket.assignedTo.avatar}
                  </AvatarFallback>
                </Avatar>
                <span>{ticket.assignedTo.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/tickets/${ticket.id}`)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            
            {/* Actions Utilisateur (créateur) - Uniquement pour les utilisateurs normaux */}
            {isUserRole && isCreator && (
              <>
                <DropdownMenuSeparator />
                {/* Modifier et Supprimer : toujours visibles, backend gère les restrictions */}
                <DropdownMenuItem onClick={() => onEdit?.(ticket)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(ticket)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
                
                {/* Valider et Relancer : uniquement si résolu */}
                {ticket.status === "resolved" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onValidate?.(ticket)} className="text-success">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Valider
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReopen?.(ticket)} className="text-warning">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Rejeter et relancer
                    </DropdownMenuItem>
                  </>
                )}
              </>
            )}

            {/* Actions DSI/Adjoint/Admin - Uniquement si l'utilisateur est DSI, Adjoint ou Admin */}
            {(currentUser?.role === "dsi" || currentUser?.role === "adjoint" || currentUser?.role === "admin") && (
              <>
                {canAssign && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAssign?.(ticket)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assigner
                    </DropdownMenuItem>
                  </>
                )}
                {canReassign && (
                  <DropdownMenuItem onClick={() => onReassign?.(ticket)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réassigner
                  </DropdownMenuItem>
                )}
                {canDelegate && (
                  <DropdownMenuItem onClick={() => onDelegate?.(ticket)}>
                    <Forward className="h-4 w-4 mr-2" />
                    Déléguer à Adjoint DSI
                  </DropdownMenuItem>
                )}
                {canEscalate && (
                  <DropdownMenuItem onClick={() => onEscalate?.(ticket)} className="text-warning">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Escalader la priorité
                  </DropdownMenuItem>
                )}
              </>
            )}

            {/* Actions Technicien - Uniquement si l'utilisateur est technicien */}
            {currentUser?.role === "technician" && (
              <>
                {canTakeCharge && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onTakeCharge?.(ticket)} className="text-primary">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Prendre en charge
                    </DropdownMenuItem>
                  </>
                )}
                {canResolve && (
                  <DropdownMenuItem onClick={() => onResolve?.(ticket)} className="text-success">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marquer résolu
                  </DropdownMenuItem>
                )}
                {canRequestInfo && (
                  <DropdownMenuItem onClick={() => onRequestInfo?.(ticket)}>
                    <Info className="h-4 w-4 mr-2" />
                    Demander des informations
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
