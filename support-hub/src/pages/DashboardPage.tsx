import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { KPICard } from "@/components/dashboard/KPICard";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Ticket, TicketStatus, TicketType, TicketPriority } from "@/types/ticket";
import { ticketsApi } from "@/lib/api";
import { calculateStats, getWeeklyStats, getMonthlyStats, getPriorityDistribution, getStatusDistribution, getTechnicianStats } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Ticket as TicketIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  Wrench,
  Monitor,
  Forward,
  RotateCcw,
  BarChart3,
  Settings,
  Mail,
  Shield,
  FileText,
  FolderTree,
  Layers,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";

// Components
import { WeeklyTicketsChart } from "@/components/charts/WeeklyTicketsChart";
import { MonthlyTicketsChart } from "@/components/charts/MonthlyTicketsChart";
import { DistributionChart } from "@/components/charts/DistributionChart";
import { TechnicianCard } from "@/components/team/TechnicianCard";
import { EmailManagement } from "@/components/admin/EmailManagement";

// Role-specific dashboard content
function UserDashboard() {
  const { tickets, currentUser, setTickets, loadData } = useApp();
  const navigate = useNavigate();
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // État pour l'édition
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<TicketType>("hardware");
  const [editPriority, setEditPriority] = useState<TicketPriority>("medium");
  const [editCategory, setEditCategory] = useState("");
  
  // Les tickets sont déjà filtrés par l'API pour les utilisateurs (getMyTickets)
  // Donc on utilise directement tickets sans re-filtrer
  const userTickets = tickets;
  const stats = calculateStats(tickets, currentUser?.id, "user");
  const recentTickets = userTickets.slice(0, 3);
  
  console.log('UserDashboard - Tickets disponibles:', tickets.length);
  console.log('UserDashboard - Current user:', currentUser?.id, currentUser?.name);

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const openEditModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditType(ticket.type);
    setEditPriority(ticket.priority);
    setEditCategory(ticket.category || "");
    setShowEditModal(true);
  };

  const openDeleteModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDeleteModal(true);
  };

  const handleEdit = async () => {
    if (!selectedTicket || !editTitle.trim() || !editDescription.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const typeMap: Record<TicketType, 'materiel' | 'applicatif'> = {
        hardware: 'materiel',
        software: 'applicatif',
      };
      
      const priorityMap: Record<TicketPriority, 'faible' | 'moyenne' | 'haute' | 'critique'> = {
        low: 'faible',
        medium: 'moyenne',
        high: 'haute',
        critical: 'critique',
      };

      const updatedTicket = await ticketsApi.update(selectedTicket.id, {
        title: editTitle,
        description: editDescription,
        type: typeMap[editType],
        priority: priorityMap[editPriority],
        category: editCategory || undefined,
      });

      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket modifié avec succès");
      setShowEditModal(false);
      setSelectedTicket(null);
      setEditTitle("");
      setEditDescription("");
      setEditCategory("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du ticket:', error);
      toast.error(error.message || "Erreur lors de la modification du ticket");
    }
  };

  const handleDelete = async () => {
    if (!selectedTicket) return;

    try {
      await ticketsApi.delete(selectedTicket.id);
      
      setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));

      toast.success("Ticket supprimé avec succès");
      setShowDeleteModal(false);
      setSelectedTicket(null);
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du ticket:', error);
      toast.error(error.message || "Erreur lors de la suppression du ticket");
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Bonjour, {currentUser?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-muted-foreground">
            Voici un aperçu de vos tickets
          </p>
        </div>
        <Button asChild className="bg-secondary hover:bg-secondary/90">
          <Link to="/tickets/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau ticket
          </Link>
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de mes tickets"
          value={stats.total}
          icon={TicketIcon}
          iconColor="primary"
        />
        <KPICard
          title="En attente"
          value={stats.open}
          icon={Clock}
          iconColor="warning"
          change="+2 cette semaine"
          changeType="neutral"
        />
        <KPICard
          title="En cours de traitement"
          value={stats.inProgress}
          icon={TrendingUp}
          iconColor="info"
        />
        <KPICard
          title="Résolus"
          value={stats.resolved}
          icon={CheckCircle2}
          iconColor="success"
          change="+5 ce mois"
          changeType="positive"
        />
      </div>

      {/* Recent Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold">Tickets récents</h3>
          <Button variant="ghost" asChild>
            <Link to="/tickets" className="text-secondary">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {recentTickets.length > 0 ? (
            recentTickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket}
                onView={handleViewDetails}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <TicketIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore créé de ticket
              </p>
              <Button asChild className="bg-secondary hover:bg-secondary/90">
                <Link to="/tickets/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer mon premier ticket
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du ticket</DialogTitle>
            <DialogDescription>
              Informations complètes du ticket {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedTicket.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn(
                      selectedTicket.status === "open" && "bg-info/10 text-info border-info/30",
                      selectedTicket.status === "assigned" && "bg-secondary/10 text-secondary border-secondary/30",
                      selectedTicket.status === "in_progress" && "bg-primary/10 text-primary border-primary/30",
                      selectedTicket.status === "resolved" && "bg-success/10 text-success border-success/30",
                      selectedTicket.status === "closed" && "bg-muted text-muted-foreground border-muted",
                      selectedTicket.status === "reopened" && "bg-destructive/10 text-destructive border-destructive/30",
                    )}>
                      {selectedTicket.status === "open" && "Ouvert"}
                      {selectedTicket.status === "assigned" && "Assigné"}
                      {selectedTicket.status === "in_progress" && "En cours"}
                      {selectedTicket.status === "resolved" && "Résolu"}
                      {selectedTicket.status === "closed" && "Fermé"}
                      {selectedTicket.status === "reopened" && "Relancé"}
                    </Badge>
                    <Badge variant="secondary" className={cn(
                      selectedTicket.priority === "low" && "bg-muted text-muted-foreground",
                      selectedTicket.priority === "medium" && "bg-info/10 text-info",
                      selectedTicket.priority === "high" && "bg-warning/10 text-warning",
                      selectedTicket.priority === "critical" && "bg-destructive/10 text-destructive",
                    )}>
                      {selectedTicket.priority === "low" && "Basse"}
                      {selectedTicket.priority === "medium" && "Moyenne"}
                      {selectedTicket.priority === "high" && "Haute"}
                      {selectedTicket.priority === "critical" && "Critique"}
                    </Badge>
                    <Badge variant="outline">
                      {selectedTicket.type === "hardware" ? (
                        <><Wrench className="h-3 w-3 mr-1" /> Matériel</>
                      ) : (
                        <><Monitor className="h-3 w-3 mr-1" /> Applicatif</>
                      )}
                    </Badge>
                    {selectedTicket.category && (
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </h3>
                <p className="text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Informations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Créé par
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{selectedTicket.createdBy.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.createdBy.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedTicket.createdBy.email}</p>
                    </div>
                  </div>
                </div>
                {selectedTicket.assignedTo && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assigné à
                    </h3>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{selectedTicket.assignedTo.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTicket.assignedTo.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedTicket.assignedTo.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Dates importantes
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Créé le:</span>
                      <span className="font-medium">{format(selectedTicket.createdAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Modifié le:</span>
                      <span className="font-medium">{format(selectedTicket.updatedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                    </div>
                    {selectedTicket.resolvedAt && (
                      <div className="flex justify-between p-2 bg-muted/50 rounded">
                        <span className="text-muted-foreground">Résolu le:</span>
                        <span className="font-medium">{format(selectedTicket.resolvedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Résolution */}
              {selectedTicket.resolution && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Résolution
                  </h3>
                  <p className="text-muted-foreground bg-success/10 p-4 rounded-lg border border-success/20">
                    {selectedTicket.resolution}
                  </p>
                </div>
              )}

              {/* Raison de rejet */}
              {selectedTicket.reopenReason && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    Raison de relance
                  </h3>
                  <p className="text-muted-foreground bg-warning/10 p-4 rounded-lg border border-warning/20">
                    {selectedTicket.reopenReason}
                  </p>
                </div>
              )}

              {/* Commentaires */}
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Commentaires ({selectedTicket.comments.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{comment.author.avatar}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{comment.author.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(comment.createdAt, "dd/MM/yyyy à HH:mm", { locale: fr })}
                              </p>
                            </div>
                          </div>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-xs">Interne</Badge>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Fermer
                </Button>
                {currentUser?.id === selectedTicket.createdBy.id && 
                 selectedTicket.status === "open" && 
                 !selectedTicket.assignedTo && (
                  <>
                    <Button variant="outline" onClick={() => {
                      setShowDetailsModal(false);
                      openEditModal(selectedTicket);
                    }}>
                      Modifier
                    </Button>
                    <Button variant="destructive" onClick={() => {
                      setShowDetailsModal(false);
                      openDeleteModal(selectedTicket);
                    }}>
                      Supprimer
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le ticket</DialogTitle>
            <DialogDescription>
              Modifiez les informations du ticket {selectedTicket?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre *</Label>
              <Input
                id="edit-title"
                placeholder="Titre du ticket"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Description détaillée du problème..."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v as TicketType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Matériel
                      </div>
                    </SelectItem>
                    <SelectItem value="software">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Applicatif
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priorité</Label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as TicketPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie (optionnel)</Label>
              <Input
                id="edit-category"
                placeholder="Ex: Réseau, Logiciel, Matériel..."
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit} className="bg-secondary hover:bg-secondary/90">
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le ticket</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le ticket {selectedTicket?.id} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTicket && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedTicket.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTicket.description.substring(0, 100)}...
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DSIDashboard() {
  const { tickets } = useApp();
  const stats = calculateStats(tickets);
  const pendingTickets = tickets.filter(t => t.status === "open" || t.status === "reopened");
  const recentTickets = pendingTickets.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Tableau de bord DSI 🎯
        </h2>
        <p className="text-muted-foreground">
          Vue d'ensemble des tickets et de l'équipe
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total tickets"
          value={stats.total}
          icon={TicketIcon}
          iconColor="primary"
        />
        <KPICard
          title="En attente d'action"
          value={stats.open}
          icon={AlertTriangle}
          iconColor="warning"
          change={stats.open > 0 ? "À traiter" : ""}
          changeType="neutral"
        />
        <KPICard
          title="Délégués"
          value={stats.delegated}
          icon={Forward}
          iconColor="info"
        />
        <KPICard
          title="Relancés"
          value={stats.reopened}
          icon={RotateCcw}
          iconColor="destructive"
          change={stats.reopened > 0 ? "Attention requise" : ""}
          changeType="negative"
        />
        <KPICard
          title="Taux de résolution"
          value={`${stats.satisfactionRate}%`}
          icon={TrendingUp}
          iconColor="success"
          change="+3% ce mois"
          changeType="positive"
        />
      </div>

      {/* Tickets Section */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold">
            Tickets en attente d'action ({pendingTickets.length})
          </h3>
          <Button variant="ghost" asChild>
            <Link to="/tickets" className="text-secondary">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {recentTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AdjointDashboard() {
  const { tickets } = useApp();
  const delegatedTickets = tickets.filter(t => t.status === "delegated");
  const stats = calculateStats(tickets);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Espace Adjoint DSI 📋
        </h2>
        <p className="text-muted-foreground">
          Gestion des tickets délégués
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tickets délégués"
          value={delegatedTickets.length}
          icon={Forward}
          iconColor="secondary"
        />
        <KPICard
          title="À assigner"
          value={delegatedTickets.length}
          icon={Users}
          iconColor="warning"
        />
        <KPICard
          title="En cours"
          value={stats.inProgress}
          icon={Clock}
          iconColor="info"
        />
        <KPICard
          title="Résolus aujourd'hui"
          value={2}
          icon={CheckCircle2}
          iconColor="success"
        />
      </div>

      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-display font-semibold">
          Tickets délégués à assigner
        </h3>
        <div className="grid gap-4">
          {delegatedTickets.length > 0 ? (
            delegatedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <CheckCircle2 className="h-12 w-12 mx-auto text-success/50 mb-4" />
              <p className="text-muted-foreground">
                Aucun ticket délégué en attente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TechnicianDashboard() {
  const { tickets, currentUser } = useApp();
  const myTickets = tickets.filter(t => t.assignedTo?.id === currentUser?.id);
  const inProgress = myTickets.filter(t => t.status === "in_progress" || t.status === "assigned");
  const stats = calculateStats(tickets, currentUser?.id, "technician");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Espace Technicien 🔧
        </h2>
        <p className="text-muted-foreground">
          Vos tickets assignés
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tickets assignés"
          value={myTickets.length}
          icon={TicketIcon}
          iconColor="primary"
        />
        <KPICard
          title="En cours"
          value={inProgress.length}
          icon={Wrench}
          iconColor="secondary"
        />
        <KPICard
          title="Résolus ce mois"
          value={stats.resolved}
          icon={CheckCircle2}
          iconColor="success"
          change="+12 vs mois dernier"
          changeType="positive"
        />
        <KPICard
          title="Temps moyen résolution"
          value={stats.avgResolutionTime}
          icon={Clock}
          iconColor="info"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold">
          Mes tickets en cours ({inProgress.length})
        </h3>
        <div className="grid gap-4">
          {inProgress.length > 0 ? (
            inProgress.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <CheckCircle2 className="h-12 w-12 mx-auto text-success/50 mb-4" />
              <p className="text-muted-foreground">
                Aucun ticket en cours. Excellent travail !
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { tickets, users } = useApp();
  const stats = calculateStats(tickets);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Administration 🛠️
        </h2>
        <p className="text-muted-foreground">
          Vue globale du système
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KPICard
          title="Total tickets"
          value={stats.total}
          icon={TicketIcon}
          iconColor="primary"
        />
        <KPICard
          title="Utilisateurs"
          value={users.length}
          icon={Users}
          iconColor="info"
        />
        <KPICard
          title="Techniciens"
          value={users.filter(u => u.role === "technician").length}
          icon={Wrench}
          iconColor="secondary"
        />
        <KPICard
          title="Taux résolution"
          value={`${stats.satisfactionRate}%`}
          icon={TrendingUp}
          iconColor="success"
        />
        <KPICard
          title="Tickets ouverts"
          value={stats.open}
          icon={AlertTriangle}
          iconColor="warning"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="gap-2">
            <TicketIcon className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <WeeklyTicketsChart data={getWeeklyStats()} />
            <MonthlyTicketsChart data={getMonthlyStats()} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2 mt-6">
            <DistributionChart title="Répartition par priorité" data={getPriorityDistribution(tickets)} />
            <DistributionChart title="Répartition par statut" data={getStatusDistribution(tickets)} />
          </div>
        </TabsContent>

        <TabsContent value="emails" className="mt-6">
          <EmailManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser } = useApp();

  const getDashboardContent = () => {
    switch (currentUser?.role) {
      case "user":
        return <UserDashboard />;
      case "dsi":
        return <DSIDashboard />;
      case "adjoint":
        return <AdjointDashboard />;
      case "technician":
        return <TechnicianDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <DashboardLayout
      title="Tableau de bord"
      subtitle={`Vue d'ensemble de votre activité`}
    >
      {getDashboardContent()}
    </DashboardLayout>
  );
}
