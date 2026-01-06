import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Ticket, TicketStatus, TicketType, TicketPriority } from "@/types/ticket";
import { ticketsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  RotateCcw,
  User,
  Calendar,
  MessageSquare,
  History,
  Clock,
  Monitor,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, setTickets, loadData } = useApp();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  
  // État pour l'édition
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<TicketType>("hardware");
  const [editPriority, setEditPriority] = useState<TicketPriority>("medium");
  const [editCategory, setEditCategory] = useState("");
  
  // État pour validation/relance
  const [validationReason, setValidationReason] = useState("");
  const [isValidationAccepted, setIsValidationAccepted] = useState(true);
  const [reopenReason, setReopenReason] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const ticketData = await ticketsApi.getById(id);
        setTicket(ticketData);
        
        // Pré-remplir les champs d'édition
        setEditTitle(ticketData.title);
        setEditDescription(ticketData.description);
        setEditType(ticketData.type);
        setEditPriority(ticketData.priority);
        setEditCategory(ticketData.category || "");
        
        // Charger les commentaires et l'historique
        try {
          const commentsData = await ticketsApi.getComments(id);
          setComments(commentsData);
        } catch (err) {
          console.error('Erreur lors du chargement des commentaires:', err);
        }
        
        try {
          const historyData = await ticketsApi.getHistory(id);
          setHistory(historyData);
        } catch (err) {
          console.error('Erreur lors du chargement de l\'historique:', err);
        }
      } catch (error: any) {
        console.error('Erreur lors du chargement du ticket:', error);
        toast.error("Impossible de charger les détails du ticket");
        navigate("/tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const handleEdit = async () => {
    if (!ticket || !editTitle.trim() || !editDescription.trim()) {
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

      const updatedTicket = await ticketsApi.update(ticket.id, {
        title: editTitle,
        description: editDescription,
        type: typeMap[editType],
        priority: priorityMap[editPriority],
        category: editCategory || undefined,
      });

      setTicket(updatedTicket);
      toast.success("Ticket modifié avec succès");
      setShowEditModal(false);
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la modification du ticket:', error);
      
      let errorMessage = "Erreur lors de la modification du ticket";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("en cours de traitement")) {
          if (ticket?.status === "closed") {
            errorMessage = "Ce ticket est déjà clôturé. Modification impossible.";
          } else if (ticket?.status === "resolved") {
            errorMessage = "Ce ticket est déjà résolu. Modification impossible.";
          } else if (ticket?.assignedTo || ticket?.status === "assigned" || ticket?.status === "in_progress") {
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
    if (!ticket) return;

    try {
      await ticketsApi.delete(ticket.id);
      toast.success("Ticket supprimé avec succès");
      navigate("/tickets");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du ticket:', error);
      
      let errorMessage = "Erreur lors de la suppression du ticket";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("en cours de traitement")) {
          if (ticket.status === "closed") {
            errorMessage = "Ce ticket est déjà clôturé. Suppression impossible.";
          } else if (ticket.status === "resolved") {
            errorMessage = "Ce ticket est déjà résolu. Suppression impossible.";
          } else if (ticket.assignedTo || ticket.status === "assigned" || ticket.status === "in_progress") {
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

  const handleValidate = async () => {
    if (!ticket) return;

    try {
      const rejectionReason = !isValidationAccepted && validationReason.trim() 
        ? validationReason 
        : undefined;
      
      const updatedTicket = await ticketsApi.validate(
        ticket.id,
        isValidationAccepted,
        rejectionReason
      );
      
      setTicket(updatedTicket);
      toast.success(isValidationAccepted ? "Résolution validée avec succès" : "Résolution rejetée");
      setShowValidateModal(false);
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

  const handleReopen = async () => {
    if (!ticket || !reopenReason.trim()) {
      toast.error("Veuillez saisir un motif de relance");
      return;
    }

    try {
      const updatedTicket = await ticketsApi.reopen(ticket.id);
      
      // Ajouter un commentaire avec le motif de relance
      try {
        await ticketsApi.addComment(ticket.id, `Motif de relance: ${reopenReason}`, "public");
      } catch (commentError) {
        console.error('Erreur lors de l\'ajout du commentaire:', commentError);
        // Ne pas bloquer la relance si le commentaire échoue
      }
      
      // Recharger le ticket pour avoir les commentaires à jour
      const refreshedTicket = await ticketsApi.getById(ticket.id);
      setTicket(refreshedTicket);
      
      toast.success("Ticket relancé avec succès");
      setShowReopenModal(false);
      setReopenReason("");
      
      if (currentUser) {
        await loadData(currentUser);
      }
    } catch (error: any) {
      console.error('Erreur lors de la relance:', error);
      toast.error(error.message || "Erreur lors de la relance du ticket");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Chargement..." subtitle="Chargement des détails du ticket">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout title="Ticket introuvable" subtitle="Le ticket demandé n'existe pas">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Le ticket demandé n'existe pas ou vous n'avez pas les permissions pour le voir.</p>
          <Button asChild>
            <Link to="/tickets">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux tickets
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isCreator = currentUser?.id === ticket.createdBy.id;
  const isUserRole = currentUser?.role === "user";

  return (
    <DashboardLayout title="Détails du ticket" subtitle={`Ticket ${ticket.id}`}>
      <div className="space-y-6">
        {/* Bouton Retour */}
        <Button variant="ghost" asChild>
          <Link to="/tickets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux tickets
          </Link>
        </Button>

        {/* Carte principale */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-3">{ticket.title}</h1>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={cn(
                  ticket.status === "open" && "bg-info/10 text-info border-info/30",
                  ticket.status === "assigned" && "bg-secondary/10 text-secondary border-secondary/30",
                  ticket.status === "in_progress" && "bg-primary/10 text-primary border-primary/30",
                  ticket.status === "resolved" && "bg-success/10 text-success border-success/30",
                  ticket.status === "closed" && "bg-muted text-muted-foreground border-muted",
                  ticket.status === "reopened" && "bg-destructive/10 text-destructive border-destructive/30",
                  ticket.status === "delegated" && "bg-warning/10 text-warning border-warning/30",
                )}>
                  {ticket.status === "open" && "En attente d'assignation"}
                  {ticket.status === "assigned" && "Assigné au technicien"}
                  {ticket.status === "in_progress" && "En cours"}
                  {ticket.status === "resolved" && "Résolu"}
                  {ticket.status === "closed" && "Cloturé"}
                  {ticket.status === "reopened" && "Rejeté"}
                  {ticket.status === "delegated" && "Délégué"}
                </Badge>
                <Badge variant="secondary" className={cn(
                  ticket.priority === "low" && "bg-muted text-muted-foreground",
                  ticket.priority === "medium" && "bg-info/10 text-info",
                  ticket.priority === "high" && "bg-warning/10 text-warning",
                  ticket.priority === "critical" && "bg-destructive/10 text-destructive",
                )}>
                  {ticket.priority === "low" && "Basse"}
                  {ticket.priority === "medium" && "Moyenne"}
                  {ticket.priority === "high" && "Haute"}
                  {ticket.priority === "critical" && "Critique"}
                </Badge>
                <Badge variant="outline">
                  {ticket.type === "hardware" ? (
                    <><Wrench className="h-3 w-3 mr-1" /> Matériel</>
                  ) : (
                    <><Monitor className="h-3 w-3 mr-1" /> Applicatif</>
                  )}
                </Badge>
                {ticket.category && (
                  <Badge variant="outline">{ticket.category}</Badge>
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
              {ticket.description}
            </p>
          </div>

          {/* Informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Créé par
              </h3>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{ticket.createdBy.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{ticket.createdBy.name}</p>
                  {ticket.createdBy.email && (
                    <p className="text-sm text-muted-foreground">{ticket.createdBy.email}</p>
                  )}
                </div>
              </div>
            </div>
            {ticket.assignedTo && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigné à
                </h3>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{ticket.assignedTo.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.assignedTo.name}</p>
                    {ticket.assignedTo.email && (
                      <p className="text-sm text-muted-foreground">{ticket.assignedTo.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Dates importantes
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Créé le:</span>
                  <span className="font-medium">{format(ticket.createdAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/50 rounded">
                  <span className="text-muted-foreground">Modifié le:</span>
                  <span className="font-medium">{format(ticket.updatedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Résolu le:</span>
                    <span className="font-medium">{format(ticket.resolvedAt, "dd/MM/yyyy à HH:mm", { locale: fr })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Résolution */}
          {ticket.resolution && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Résolution
              </h3>
              <p className="text-muted-foreground bg-success/10 p-4 rounded-lg border border-success/20">
                {ticket.resolution}
              </p>
            </div>
          )}

          {/* Raison de rejet */}
          {ticket.reopenReason && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Raison de relance
              </h3>
              <p className="text-muted-foreground bg-warning/10 p-4 rounded-lg border border-warning/20">
                {ticket.reopenReason}
              </p>
            </div>
          )}

          {/* Historique */}
          {history && history.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique
              </h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.reason || "Changement de statut"}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.user?.full_name || "Système"} • {format(new Date(item.changed_at), "dd MMM, HH:mm", { locale: fr })}
                        </p>
                        {item.old_status && item.new_status && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Statut: {item.old_status} → {item.new_status}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaires */}
          {comments && comments.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Commentaires ({comments.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {comment.user?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{comment.user?.full_name || "Utilisateur"}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                      {comment.type === "internal" && (
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
          {isUserRole && isCreator && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              {ticket.status === "resolved" && (
                <>
                  <Button 
                    variant="default" 
                    className="bg-success hover:bg-success/90"
                    onClick={() => setShowValidateModal(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Valider
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-warning border-warning"
                    onClick={() => {
                      setIsValidationAccepted(false);
                      setShowValidateModal(true);
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rejeter et relancer
                  </Button>
                </>
              )}
              {ticket.status === "closed" && (
                <Button 
                  variant="outline" 
                  className="text-warning border-warning"
                  onClick={() => setShowReopenModal(true)}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Relancer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le ticket</DialogTitle>
            <DialogDescription>
              Modifiez les informations du ticket {ticket?.id}
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
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editType} onValueChange={(v) => setEditType(v as TicketType)}>
                  <SelectTrigger id="edit-type">
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
                  <SelectTrigger id="edit-priority">
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
              Êtes-vous sûr de vouloir supprimer le ticket {ticket?.id} ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {ticket && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{ticket.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {ticket.description.substring(0, 100)}...
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

      {/* Validate Modal */}
      <Dialog open={showValidateModal} onOpenChange={setShowValidateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la résolution</DialogTitle>
            <DialogDescription>
              Votre ticket {ticket?.id} a été résolu. Validez-vous la résolution ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {ticket?.resolution && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="font-medium mb-2">Résumé de la résolution:</p>
                <p className="text-sm">{ticket.resolution}</p>
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

      {/* Reopen Modal */}
      <Dialog open={showReopenModal} onOpenChange={setShowReopenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Relancer le ticket</DialogTitle>
            <DialogDescription>
              Expliquez pourquoi le ticket {ticket?.id} doit être relancé
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <p className="text-sm">
                Vous pourrez relancer votre ticket s'il a été clôturé automatiquement dans les 7 derniers jours.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reopen-reason">Motif de relance *</Label>
              <Textarea
                id="reopen-reason"
                placeholder="Décrivez le problème rencontré..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowReopenModal(false);
                setReopenReason("");
              }}>
                Annuler
              </Button>
              <Button 
                onClick={handleReopen} 
                className="bg-warning hover:bg-warning/90"
                disabled={!reopenReason.trim()}
              >
                Relancer le ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

