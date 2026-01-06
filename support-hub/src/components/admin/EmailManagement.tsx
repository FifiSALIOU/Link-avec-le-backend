import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmailTemplate } from "@/types/ticket";
import { Mail, Pencil, Eye, Send, TicketPlus, UserPlus, CheckCircle, RotateCcw, Forward } from "lucide-react";
import { toast } from "sonner";

const triggerIcons: Record<string, typeof Mail> = {
  ticket_created: TicketPlus,
  ticket_assigned: UserPlus,
  ticket_resolved: CheckCircle,
  ticket_reopened: RotateCcw,
  ticket_delegated: Forward
};

const triggerLabels: Record<string, string> = {
  ticket_created: "Création de ticket",
  ticket_assigned: "Assignation de ticket",
  ticket_resolved: "Résolution de ticket",
  ticket_reopened: "Relance de ticket",
  ticket_delegated: "Délégation de ticket"
};

export function EmailManagement() {
  const { emailTemplates, setEmailTemplates } = useApp();
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    isActive: true
  });

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      setEmailTemplates(prev =>
        prev.map(t => t.id === editingTemplate.id ? { ...t, ...formData } : t)
      );
      toast.success("Template mis à jour");
    }
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingTemplate(null);
    setFormData({ name: "", subject: "", body: "", isActive: true });
  };

  const toggleActive = (template: EmailTemplate) => {
    setEmailTemplates(prev =>
      prev.map(t => t.id === template.id ? { ...t, isActive: !t.isActive } : t)
    );
    toast.success(template.isActive ? "Template désactivé" : "Template activé");
  };

  const sendTestEmail = (template: EmailTemplate) => {
    toast.success(`Email de test envoyé pour "${template.name}"`);
  };

  return (
    <>
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Mail className="h-5 w-5 text-secondary" />
            Configuration des emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-3">
            {emailTemplates.map(template => {
              const Icon = triggerIcons[template.trigger];
              return (
                <AccordionItem key={template.id} value={template.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Icon className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{triggerLabels[template.trigger]}</p>
                      </div>
                      <Badge variant={template.isActive ? "default" : "secondary"} className={template.isActive ? "bg-success/10 text-success ml-2" : "ml-2"}>
                        {template.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Sujet</Label>
                        <p className="text-sm font-medium mt-1">{template.subject}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Corps du message</Label>
                        <pre className="text-sm bg-muted/30 p-3 rounded-lg mt-1 whitespace-pre-wrap font-sans">
                          {template.body}
                        </pre>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={template.isActive}
                            onCheckedChange={() => toggleActive(template)}
                          />
                          <span className="text-sm text-muted-foreground">Activer les notifications</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setPreviewTemplate(template)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => sendTestEmail(template)}>
                            <Send className="h-4 w-4 mr-1" />
                            Test
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-dashed border-border">
            <h4 className="font-medium text-sm mb-2">Variables disponibles</h4>
            <div className="flex flex-wrap gap-2">
              {["{userName}", "{technicianName}", "{adjointName}", "{ticketId}", "{ticketTitle}", "{ticketPriority}", "{resolution}", "{reopenReason}"].map(v => (
                <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Sujet</Label>
              <Input
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Corps du message</Label>
              <Textarea
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                rows={8}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>Annuler</Button>
              <Button type="submit" className="bg-secondary hover:bg-secondary/90">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de l'email</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="border-b border-border pb-3 mb-3">
                  <p className="text-sm text-muted-foreground">De: <span className="text-foreground">support@entreprise.com</span></p>
                  <p className="text-sm text-muted-foreground">À: <span className="text-foreground">utilisateur@exemple.com</span></p>
                  <p className="text-sm text-muted-foreground">Sujet: <span className="text-foreground font-medium">{previewTemplate.subject.replace("{ticketId}", "TKT-001")}</span></p>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {previewTemplate.body
                    .replace("{userName}", "Jean Dupont")
                    .replace("{technicianName}", "Sophie Bernard")
                    .replace("{adjointName}", "Pierre Durand")
                    .replace("{ticketId}", "TKT-001")
                    .replace("{ticketTitle}", "Ordinateur ne démarre plus")
                    .replace("{ticketPriority}", "Haute")
                    .replace("{resolution}", "Problème résolu par remplacement du composant défectueux.")
                    .replace("{reopenReason}", "Le problème persiste.")}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
