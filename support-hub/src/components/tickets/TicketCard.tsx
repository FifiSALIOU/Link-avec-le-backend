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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onAssign?: (ticket: Ticket) => void;
  onDelegate?: (ticket: Ticket) => void;
  onResolve?: (ticket: Ticket) => void;
  onReopen?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
}

const statusConfig: Record<TicketStatus, { label: string; className: string }> = {
  open: { label: "Ouvert", className: "bg-info/10 text-info border-info/30" },
  assigned: { label: "Assigné", className: "bg-secondary/10 text-secondary border-secondary/30" },
  delegated: { label: "Délégué", className: "bg-warning/10 text-warning border-warning/30" },
  in_progress: { label: "En cours", className: "bg-primary/10 text-primary border-primary/30" },
  resolved: { label: "Résolu", className: "bg-success/10 text-success border-success/30" },
  closed: { label: "Fermé", className: "bg-muted text-muted-foreground border-muted" },
  reopened: { label: "Relancé", className: "bg-destructive/10 text-destructive border-destructive/30" },
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
  onDelegate,
  onResolve,
  onReopen,
  onEdit,
  onDelete,
}: TicketCardProps) {
  const { currentUser } = useApp();
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  const isCreator = currentUser?.id === ticket.createdBy.id;
  const canEditOrDelete = isCreator && ticket.status === "open" && !ticket.assignedTo;
  
  const showAssign = currentUser?.role === "dsi" || currentUser?.role === "adjoint";
  const showDelegate = currentUser?.role === "dsi";
  const showResolve = currentUser?.role === "technician" && ticket.assignedTo?.id === currentUser.id;
  const showValidate = currentUser?.role === "user" && ticket.status === "resolved";

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
            <DropdownMenuItem onClick={() => onView?.(ticket)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            {canEditOrDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(ticket)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(ticket)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
            {showAssign && ticket.status === "open" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onAssign?.(ticket)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assigner
                </DropdownMenuItem>
              </>
            )}
            {showDelegate && ticket.status === "open" && (
              <DropdownMenuItem onClick={() => onDelegate?.(ticket)}>
                <Forward className="h-4 w-4 mr-2" />
                Déléguer
              </DropdownMenuItem>
            )}
            {showResolve && ticket.status === "in_progress" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onResolve?.(ticket)} className="text-success">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marquer résolu
                </DropdownMenuItem>
              </>
            )}
            {showValidate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onResolve?.(ticket)} className="text-success">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Valider
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReopen?.(ticket)} className="text-warning">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Relancer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
