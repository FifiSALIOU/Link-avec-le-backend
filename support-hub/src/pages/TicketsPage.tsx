import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Ticket, TicketStatus, TicketType, TicketPriority } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ticketsApi } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  Ticket as TicketIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Wrench,
  User,
  Calendar,
  MessageSquare,
  History,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";

const statusFilters: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "open", label: "Ouverts" },
  { value: "assigned", label: "Assignés" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolus" },
  { value: "reopened", label: "Relancés" },
];

export default function TicketsPage() {
  const { tickets, currentUser, users, setTickets, addNotification, loadData } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TicketType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  
  // État pour l'édition
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<TicketType>("hardware");
  const [editPriority, setEditPriority] = useState<TicketPriority>("medium");
  const [editCategory, setEditCategory] = useState("");

  // Recharger les données si elles ne sont pas disponibles
  useEffect(() => {
    if (currentUser && tickets.length === 0) {
      console.log('TicketsPage - Rechargement des données car aucun ticket disponible');
      loadData(currentUser);
    }
  }, [currentUser, tickets.length, loadData]);

  // Debug logs
  console.log('TicketsPage - Tickets disponibles:', tickets.length);
  console.log('TicketsPage - Current user:', currentUser?.id, currentUser?.name, currentUser?.role);
  if (tickets.length > 0) {
    console.log('TicketsPage - Détails des tickets:', tickets.map(t => ({
      id: t.id,
      title: t.title,
      createdBy: t.createdBy?.id,
      currentUserId: currentUser?.id
    })));
  }

  // Filter tickets based on user role and filters
  // Note: Pour les utilisateurs, les tickets sont déjà filtrés par l'API (getMyTickets)
  // Donc on ne re-filtre que si nécessaire pour les autres rôles
  let filteredTickets = [...tickets];

  // Role-based filtering (seulement pour les rôles qui ont besoin d'un filtrage supplémentaire)
  // Les utilisateurs normaux ont déjà leurs tickets filtrés par l'API
  if (currentUser?.role === "technician") {
    filteredTickets = filteredTickets.filter(t => t.assignedTo?.id === currentUser.id);
  } else if (currentUser?.role === "adjoint") {
    filteredTickets = filteredTickets.filter(t => t.status === "delegated" || t.delegatedTo?.id === currentUser.id);
  }
  // Pour les utilisateurs, on utilise directement les tickets déjà filtrés par l'API
  
  console.log('TicketsPage - Tickets après filtrage par rôle:', filteredTickets.length);

  // Apply filters
  if (statusFilter !== "all") {
    filteredTickets = filteredTickets.filter(t => t.status === statusFilter);
  }
  if (typeFilter !== "all") {
    filteredTickets = filteredTickets.filter(t => t.type === typeFilter);
  }
  if (priorityFilter !== "all") {
    filteredTickets = filteredTickets.filter(t => t.priority === priorityFilter);
  }
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredTickets = filteredTickets.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query)
    );
  }

  const technicians = users.filter(u => u.role === "technician");
  const adjoint = users.find(u => u.role === "adjoint");

  const handleAssign = () => {
    if (!selectedTicket || !selectedTechnician) return;

    const technician = users.find(u => u.id === selectedTechnician);
    if (!technician) return;

    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id
          ? { ...t, status: "assigned" as TicketStatus, assignedTo: technician, updatedAt: new Date() }
          : t
      )
    );

    addNotification({
      title: "Ticket assigné",
      message: `Le ticket ${selectedTicket.id} a été assigné à ${technician.name}`,
      type: "info",
      read: false,
      ticketId: selectedTicket.id,
    });

    toast.success("Ticket assigné avec succès");
    setShowAssignModal(false);
    setSelectedTicket(null);
    setSelectedTechnician("");
  };

  const handleDelegate = () => {
    if (!selectedTicket || !adjoint) return;

    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id
          ? { ...t, status: "delegated" as TicketStatus, delegatedTo: adjoint, updatedAt: new Date() }
          : t
      )
    );

    addNotification({
      title: "Ticket délégué",
      message: `Le ticket ${selectedTicket.id} a été délégué à ${adjoint.name}`,
      type: "info",
      read: false,
      ticketId: selectedTicket.id,
    });

    toast.success("Ticket délégué avec succès");
    setShowDelegateModal(false);
    setSelectedTicket(null);
  };

  const handleReopen = () => {
    if (!selectedTicket || !reopenReason.trim()) {
      toast.error("Veuillez saisir un motif de relance");
      return;
    }

    setTickets(prev =>
      prev.map(t =>
        t.id === selectedTicket.id
          ? { ...t, status: "reopened" as TicketStatus, reopenReason, updatedAt: new Date() }
          : t
      )
    );

    addNotification({
      title: "Ticket relancé",
      message: `Le ticket ${selectedTicket.id} a été relancé: ${reopenReason}`,
      type: "warning",
      read: false,
      ticketId: selectedTicket.id,
    });

    toast.success("Ticket relancé avec succès");
    setShowReopenModal(false);
    setSelectedTicket(null);
    setReopenReason("");
  };

  const handleEdit = async () => {
    if (!selectedTicket || !editTitle.trim() || !editDescription.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Mapper les valeurs frontend vers backend
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
      
      // Recharger les données
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
      
      // Recharger les données
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du ticket:', error);
      toast.error(error.message || "Erreur lors de la suppression du ticket");
    }
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

  return (
    <DashboardLayout title="Tickets" subtitle="Gérez tous vos tickets">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 flex gap-3 items-center w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, titre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {currentUser?.role === "user" && (
            <Button asChild className="bg-secondary hover:bg-secondary/90">
              <Link to="/tickets/new">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TicketType | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous types</SelectItem>
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

          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TicketIcon className="h-4 w-4" />
          <span>{filteredTickets.length} ticket(s) trouvé(s)</span>
        </div>

        {/* Tickets List */}
        <div className="grid gap-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onView={(t) => {
                  setSelectedTicket(t);
                  setShowDetailsModal(true);
                }}
                onAssign={(t) => {
                  setSelectedTicket(t);
                  setShowAssignModal(true);
                }}
                onDelegate={(t) => {
                  setSelectedTicket(t);
                  setShowDelegateModal(true);
                }}
                onReopen={(t) => {
                  setSelectedTicket(t);
                  setShowReopenModal(true);
                }}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
              <TicketIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun ticket trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Ajustez vos filtres ou créez un nouveau ticket
              </p>
              {currentUser?.role === "user" && (
                <Button asChild className="bg-secondary hover:bg-secondary/90">
                  <Link to="/tickets/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un ticket
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Assign Modal */}
        <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner le ticket</DialogTitle>
              <DialogDescription>
                Sélectionnez un technicien pour assigner le ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Type de ticket</Label>
                <Badge variant="outline" className="text-sm">
                  {selectedTicket?.type === "hardware" ? (
                    <><Wrench className="h-3 w-3 mr-1" /> Matériel</>
                  ) : (
                    <><Monitor className="h-3 w-3 mr-1" /> Applicatif</>
                  )}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label>Technicien</Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter(t => t.specialization === selectedTicket?.type)
                      .map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">{tech.avatar}</AvatarFallback>
                            </Avatar>
                            {tech.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAssign} className="bg-secondary hover:bg-secondary/90">
                  Assigner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delegate Modal */}
        <Dialog open={showDelegateModal} onOpenChange={setShowDelegateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Déléguer le ticket</DialogTitle>
              <DialogDescription>
                Le ticket {selectedTicket?.id} sera délégué à l'Adjoint DSI
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {adjoint && (
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarFallback>{adjoint.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{adjoint.name}</p>
                    <p className="text-sm text-muted-foreground">Adjoint DSI</p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDelegateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleDelegate} className="bg-secondary hover:bg-secondary/90">
                  Déléguer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reopen Modal */}
        <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Relancer le ticket</DialogTitle>
              <DialogDescription>
                Expliquez pourquoi le ticket {selectedTicket?.id} n'est pas résolu
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motif de relance</Label>
                <Textarea
                  id="reason"
                  placeholder="Décrivez le problème rencontré..."
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReopenModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleReopen} variant="destructive">
                  Relancer le ticket
                </Button>
              </div>
            </div>
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
    </DashboardLayout>
  );
}
