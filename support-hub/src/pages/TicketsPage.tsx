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
import { Link, useNavigate } from "react-router-dom";
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
  { value: "open", label: "En attente d'assignation" },
  { value: "assigned", label: "Assignés au technicien" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Résolus" },
  { value: "reopened", label: "Rejetés" },
  { value: "closed", label: "Cloturés" },
];

export default function TicketsPage() {
  const navigate = useNavigate();
  const { tickets, currentUser, users, setTickets, addNotification, loadData } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TicketType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showTakeChargeModal, setShowTakeChargeModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [validationReason, setValidationReason] = useState("");
  const [isValidationAccepted, setIsValidationAccepted] = useState(true);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentType, setCommentType] = useState<"public" | "internal">("public");
  const [requestInfoContent, setRequestInfoContent] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
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

  const handleAssign = async () => {
    if (!selectedTicket || !selectedTechnician) {
      toast.error("Veuillez sélectionner un technicien");
      return;
    }

    try {
      const updatedTicket = await ticketsApi.assign(
        selectedTicket.id,
        selectedTechnician,
        undefined,
        assignNotes || undefined
      );
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket assigné avec succès");
      setShowAssignModal(false);
      setSelectedTicket(null);
      setSelectedTechnician("");
      setAssignNotes("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error(error.message || "Erreur lors de l'assignation du ticket");
    }
  };

  const handleReassign = async () => {
    if (!selectedTicket || !selectedTechnician) {
      toast.error("Veuillez sélectionner un technicien");
      return;
    }

    try {
      const updatedTicket = await ticketsApi.reassign(
        selectedTicket.id,
        selectedTechnician,
        undefined,
        assignNotes || undefined
      );
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket réassigné avec succès");
      setShowReassignModal(false);
      setSelectedTicket(null);
      setSelectedTechnician("");
      setAssignNotes("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la réassignation:', error);
      toast.error(error.message || "Erreur lors de la réassignation du ticket");
    }
  };

  const handleDelegate = async () => {
    if (!selectedTicket || !adjoint) {
      toast.error("Adjoint DSI non trouvé");
      return;
    }

    try {
      const updatedTicket = await ticketsApi.delegate(
        selectedTicket.id,
        adjoint.id,
        undefined,
        assignNotes || undefined
      );
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket délégué avec succès");
      setShowDelegateModal(false);
      setSelectedTicket(null);
      setAssignNotes("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la délégation:', error);
      toast.error(error.message || "Erreur lors de la délégation du ticket");
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket) return;

    try {
      const updatedTicket = await ticketsApi.escalate(selectedTicket.id);
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Priorité du ticket escaladée avec succès");
      setShowEscalateModal(false);
      setSelectedTicket(null);
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'escalade:', error);
      toast.error(error.message || "Erreur lors de l'escalade du ticket");
    }
  };

  const handleReopen = async () => {
    if (!selectedTicket) return;

    try {
      // Réouverture par l'utilisateur (pas de technicien fourni)
      const updatedTicket = await ticketsApi.reopen(selectedTicket.id);
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket relancé avec succès");
      setShowReopenModal(false);
      setSelectedTicket(null);
      setReopenReason("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la relance:', error);
      toast.error(error.message || "Erreur lors de la relance du ticket");
    }
  };

  const handleValidate = async () => {
    if (!selectedTicket) return;

    try {
      const rejectionReason = !isValidationAccepted && validationReason.trim() 
        ? validationReason 
        : undefined;
      
      const updatedTicket = await ticketsApi.validate(
        selectedTicket.id,
        isValidationAccepted,
        rejectionReason
      );
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success(isValidationAccepted ? "Résolution validée avec succès" : "Résolution rejetée");
      setShowValidateModal(false);
      setSelectedTicket(null);
      setValidationReason("");
      setIsValidationAccepted(true);
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la validation:', error);
      toast.error(error.message || "Erreur lors de la validation");
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolutionSummary.trim()) {
      toast.error("Veuillez saisir un résumé de la résolution");
      return;
    }

    try {
      const updatedTicket = await ticketsApi.resolve(selectedTicket.id, resolutionSummary);
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket marqué comme résolu");
      setShowResolveModal(false);
      setSelectedTicket(null);
      setResolutionSummary("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la résolution:', error);
      toast.error(error.message || "Erreur lors de la résolution du ticket");
    }
  };

  const handleTakeCharge = async () => {
    if (!selectedTicket) return;

    try {
      const updatedTicket = await ticketsApi.updateStatus(
        selectedTicket.id,
        "en_cours"
      );
      
      setTickets(prev =>
        prev.map(t => t.id === selectedTicket.id ? updatedTicket : t)
      );

      toast.success("Ticket pris en charge");
      setShowTakeChargeModal(false);
      setSelectedTicket(null);
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la prise en charge:', error);
      toast.error(error.message || "Erreur lors de la prise en charge");
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !commentContent.trim()) {
      toast.error("Veuillez saisir un commentaire");
      return;
    }

    try {
      await ticketsApi.addComment(selectedTicket.id, commentContent, commentType);
      
      toast.success("Commentaire ajouté avec succès");
      setShowCommentModal(false);
      setSelectedTicket(null);
      setCommentContent("");
      setCommentType("public");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
      toast.error(error.message || "Erreur lors de l'ajout du commentaire");
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedTicket || !requestInfoContent.trim()) {
      toast.error("Veuillez saisir votre demande");
      return;
    }

    try {
      await ticketsApi.addComment(selectedTicket.id, requestInfoContent, "internal");
      
      toast.success("Demande d'information envoyée");
      setShowRequestInfoModal(false);
      setSelectedTicket(null);
      setRequestInfoContent("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la demande d\'information:', error);
      toast.error(error.message || "Erreur lors de la demande d'information");
    }
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
      
      // Gestion des erreurs spécifiques du backend
      let errorMessage = "Erreur lors de la modification du ticket";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("en cours de traitement")) {
          // Déterminer un message plus spécifique selon le statut
          if (selectedTicket.status === "closed") {
            errorMessage = "Ce ticket est déjà clôturé. Modification impossible.";
          } else if (selectedTicket.status === "resolved") {
            errorMessage = "Ce ticket est déjà résolu. Modification impossible.";
          } else if (selectedTicket.assignedTo || selectedTicket.status === "assigned" || selectedTicket.status === "in_progress") {
            errorMessage = "Ce ticket est déjà assigné. Modification impossible.";
          } else {
            errorMessage = "Ce ticket est déjà en cours de traitement. Modification impossible.";
          }
        } else {
          errorMessage = detail;
        }
      }
      
      toast.error(errorMessage);
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
      
      // Gestion des erreurs spécifiques du backend
      let errorMessage = "Erreur lors de la suppression du ticket";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("en cours de traitement")) {
          // Déterminer un message plus spécifique selon le statut
          if (selectedTicket.status === "closed") {
            errorMessage = "Ce ticket est déjà clôturé. Suppression impossible.";
          } else if (selectedTicket.status === "resolved") {
            errorMessage = "Ce ticket est déjà résolu. Suppression impossible.";
          } else if (selectedTicket.assignedTo || selectedTicket.status === "assigned" || selectedTicket.status === "in_progress") {
            errorMessage = "Ce ticket est déjà assigné. Suppression impossible.";
          } else {
            errorMessage = "Ce ticket est déjà en cours de traitement. Suppression impossible.";
          }
        } else {
          errorMessage = detail;
        }
      }
      
      toast.error(errorMessage);
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
                  navigate(`/tickets/${t.id}`);
                }}
                onAssign={(t) => {
                  setSelectedTicket(t);
                  setShowAssignModal(true);
                }}
                onReassign={(t) => {
                  setSelectedTicket(t);
                  setShowReassignModal(true);
                }}
                onDelegate={(t) => {
                  setSelectedTicket(t);
                  setShowDelegateModal(true);
                }}
                onEscalate={(t) => {
                  setSelectedTicket(t);
                  setShowEscalateModal(true);
                }}
                onResolve={(t) => {
                  setSelectedTicket(t);
                  setShowResolveModal(true);
                }}
                onValidate={(t) => {
                  setSelectedTicket(t);
                  setShowValidateModal(true);
                }}
                onReopen={(t) => {
                  setSelectedTicket(t);
                  setShowReopenModal(true);
                }}
                onTakeCharge={(t) => {
                  setSelectedTicket(t);
                  setShowTakeChargeModal(true);
                }}
                onAddComment={(t) => {
                  setSelectedTicket(t);
                  setShowCommentModal(true);
                }}
                onRequestInfo={(t) => {
                  setSelectedTicket(t);
                  setShowRequestInfoModal(true);
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
              <div className="space-y-2">
                <Label htmlFor="assign-notes">Notes (optionnel)</Label>
                <Textarea
                  id="assign-notes"
                  placeholder="Instructions spéciales pour le technicien..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowAssignModal(false);
                  setAssignNotes("");
                }}>
                  Annuler
                </Button>
                <Button onClick={handleAssign} className="bg-secondary hover:bg-secondary/90">
                  Assigner
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reassign Modal */}
        <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réassigner le ticket</DialogTitle>
              <DialogDescription>
                Sélectionnez un nouveau technicien pour réassigner le ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Technicien actuel</Label>
                {selectedTicket?.assignedTo && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{selectedTicket.assignedTo.avatar}</AvatarFallback>
                    </Avatar>
                    <span>{selectedTicket.assignedTo.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Nouveau technicien</Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter(t => t.id !== selectedTicket?.assignedTo?.id && t.specialization === selectedTicket?.type)
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
              <div className="space-y-2">
                <Label htmlFor="reassign-notes">Notes (optionnel)</Label>
                <Textarea
                  id="reassign-notes"
                  placeholder="Raison de la réassignation..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowReassignModal(false);
                  setAssignNotes("");
                }}>
                  Annuler
                </Button>
                <Button onClick={handleReassign} className="bg-secondary hover:bg-secondary/90">
                  Réassigner
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
              <div className="space-y-2">
                <Label htmlFor="delegate-notes">Notes (optionnel)</Label>
                <Textarea
                  id="delegate-notes"
                  placeholder="Instructions pour l'Adjoint DSI..."
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowDelegateModal(false);
                  setAssignNotes("");
                }}>
                  Annuler
                </Button>
                <Button onClick={handleDelegate} className="bg-secondary hover:bg-secondary/90">
                  Déléguer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Escalate Modal */}
        <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Escalader la priorité</DialogTitle>
              <DialogDescription>
                La priorité du ticket {selectedTicket?.id} sera augmentée. Êtes-vous sûr ?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <p className="text-sm">
                  <strong>Priorité actuelle:</strong>{" "}
                  {selectedTicket?.priority === "low" && "Basse"}
                  {selectedTicket?.priority === "medium" && "Moyenne"}
                  {selectedTicket?.priority === "high" && "Haute"}
                  {selectedTicket?.priority === "critical" && "Critique"}
                </p>
                <p className="text-sm mt-2">
                  <strong>Nouvelle priorité:</strong>{" "}
                  {selectedTicket?.priority === "low" && "Moyenne"}
                  {selectedTicket?.priority === "medium" && "Haute"}
                  {selectedTicket?.priority === "high" && "Critique"}
                  {selectedTicket?.priority === "critical" && "Déjà maximale"}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEscalateModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleEscalate} className="bg-warning hover:bg-warning/90">
                  Escalader
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

        {/* Validate Modal */}
        <Dialog open={showValidateModal} onOpenChange={setShowValidateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valider la résolution</DialogTitle>
              <DialogDescription>
                Votre ticket {selectedTicket?.id} a été résolu. Validez-vous la résolution ?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTicket?.resolution && (
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <p className="font-medium mb-2">Résumé de la résolution:</p>
                  <p className="text-sm">{selectedTicket.resolution}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Action</Label>
                <div className="flex gap-4">
                  <Button
                    variant={isValidationAccepted ? "default" : "outline"}
                    onClick={() => setIsValidationAccepted(true)}
                    className="flex-1"
                  >
                    Valider
                  </Button>
                  <Button
                    variant={!isValidationAccepted ? "destructive" : "outline"}
                    onClick={() => setIsValidationAccepted(false)}
                    className="flex-1"
                  >
                    Rejeter
                  </Button>
                </div>
              </div>
              {!isValidationAccepted && (
                <div className="space-y-2">
                  <Label htmlFor="validation-reason">Motif de rejet *</Label>
                  <Textarea
                    id="validation-reason"
                    placeholder="Expliquez pourquoi la résolution n'est pas satisfaisante..."
                    value={validationReason}
                    onChange={(e) => setValidationReason(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowValidateModal(false);
                  setValidationReason("");
                  setIsValidationAccepted(true);
                }}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleValidate} 
                  className={isValidationAccepted ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
                  disabled={!isValidationAccepted && !validationReason.trim()}
                >
                  {isValidationAccepted ? "Valider" : "Rejeter"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Resolve Modal */}
        <Dialog open={showResolveModal} onOpenChange={setShowResolveModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marquer comme résolu</DialogTitle>
              <DialogDescription>
                Remplissez le résumé de la résolution pour le ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resolution-summary">Résumé de la résolution *</Label>
                <Textarea
                  id="resolution-summary"
                  placeholder="Décrivez comment vous avez résolu le problème..."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowResolveModal(false);
                  setResolutionSummary("");
                }}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleResolve} 
                  className="bg-success hover:bg-success/90"
                  disabled={!resolutionSummary.trim()}
                >
                  Marquer résolu
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Take Charge Modal */}
        <Dialog open={showTakeChargeModal} onOpenChange={setShowTakeChargeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prendre en charge</DialogTitle>
              <DialogDescription>
                Vous allez commencer à traiter le ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm">
                  Le statut du ticket passera à "En cours" une fois que vous aurez pris en charge.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowTakeChargeModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleTakeCharge} className="bg-primary hover:bg-primary/90">
                  Prendre en charge
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Comment Modal */}
        <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un commentaire</DialogTitle>
              <DialogDescription>
                Ajoutez un commentaire au ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comment-type">Type de commentaire</Label>
                <Select value={commentType} onValueChange={(v) => setCommentType(v as "public" | "internal")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public (visible par l'utilisateur)</SelectItem>
                    <SelectItem value="internal">Interne (visible uniquement par l'équipe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment-content">Commentaire *</Label>
                <Textarea
                  id="comment-content"
                  placeholder="Votre commentaire..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowCommentModal(false);
                  setCommentContent("");
                  setCommentType("public");
                }}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddComment} 
                  className="bg-secondary hover:bg-secondary/90"
                  disabled={!commentContent.trim()}
                >
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Info Modal */}
        <Dialog open={showRequestInfoModal} onOpenChange={setShowRequestInfoModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Demander des informations</DialogTitle>
              <DialogDescription>
                Demandez des informations complémentaires pour le ticket {selectedTicket?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm">
                  Votre demande sera envoyée à l'utilisateur créateur du ticket.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="request-info-content">Demande *</Label>
                <Textarea
                  id="request-info-content"
                  placeholder="Quelles informations avez-vous besoin ?"
                  value={requestInfoContent}
                  onChange={(e) => setRequestInfoContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowRequestInfoModal(false);
                  setRequestInfoContent("");
                }}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleRequestInfo} 
                  className="bg-secondary hover:bg-secondary/90"
                  disabled={!requestInfoContent.trim()}
                >
                  Envoyer
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
    </DashboardLayout>
  );
}
