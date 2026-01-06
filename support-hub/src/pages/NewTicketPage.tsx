import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { TicketType, TicketPriority, Ticket } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Monitor, Wrench, AlertTriangle, AlertCircle, Info, Flame, Send, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const typeOptions = [
  {
    value: "hardware" as TicketType,
    label: "Matériel",
    description: "Problèmes d'ordinateur, imprimante, câbles...",
    icon: Wrench,
  },
  {
    value: "software" as TicketType,
    label: "Applicatif",
    description: "Problèmes logiciels, applications, accès...",
    icon: Monitor,
  },
];

const priorityOptions = [
  {
    value: "low" as TicketPriority,
    label: "Basse",
    description: "Peut attendre quelques jours",
    icon: Info,
    color: "text-muted-foreground",
  },
  {
    value: "medium" as TicketPriority,
    label: "Moyenne",
    description: "À traiter dans les 24-48h",
    icon: AlertCircle,
    color: "text-info",
  },
  {
    value: "high" as TicketPriority,
    label: "Haute",
    description: "Urgent, impacte le travail",
    icon: AlertTriangle,
    color: "text-warning",
  },
  {
    value: "critical" as TicketPriority,
    label: "Critique",
    description: "Bloquant, intervention immédiate",
    icon: Flame,
    color: "text-destructive",
  },
];

export default function NewTicketPage() {
  const navigate = useNavigate();
  const { currentUser, setTickets, addNotification } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "" as TicketType | "",
    priority: "medium" as TicketPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.type) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!currentUser) {
      toast.error("Vous devez être connecté");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newTicket: Ticket = {
      id: `TKT-${String(Date.now()).slice(-3)}`,
      title: formData.title,
      description: formData.description,
      type: formData.type as TicketType,
      priority: formData.priority,
      status: "open",
      createdBy: currentUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTickets((prev) => [newTicket, ...prev]);

    addNotification({
      title: "Ticket créé",
      message: `Votre ticket ${newTicket.id} a été créé avec succès`,
      type: "success",
      read: false,
      ticketId: newTicket.id,
    });

    toast.success("Ticket créé avec succès!", {
      description: `Votre ticket ${newTicket.id} a été soumis`,
    });

    setIsSubmitting(false);
    navigate("/tickets");
  };

  return (
    <DashboardLayout
      title="Nouveau ticket"
      subtitle="Signalez votre problème"
    >
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Créer un ticket
            </CardTitle>
            <CardDescription>
              Décrivez votre problème en détail pour une résolution rapide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Type de problème <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {typeOptions.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                        formData.type === type.value
                          ? "border-secondary bg-secondary/5 shadow-glow"
                          : "border-border hover:border-secondary/50 hover:bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "p-2.5 rounded-lg",
                          formData.type === type.value
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{type.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Titre du problème <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Mon ordinateur ne démarre plus"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="h-12"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description détaillée <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre problème en détail. Quand est-ce arrivé? Qu'avez-vous essayé? Y a-t-il des messages d'erreur?"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
              </div>

              {/* Priority */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Niveau de priorité
                </Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, priority: priority.value })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-200",
                        formData.priority === priority.value
                          ? "border-secondary bg-secondary/5"
                          : "border-border hover:border-secondary/50"
                      )}
                    >
                      <priority.icon className={cn("h-5 w-5", priority.color)} />
                      <span className="text-sm font-medium">{priority.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {priorityOptions.find((p) => p.value === formData.priority)?.description}
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-secondary hover:bg-secondary/90"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Soumettre le ticket</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
