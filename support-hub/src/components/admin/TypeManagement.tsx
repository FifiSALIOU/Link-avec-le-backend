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
import { TicketTypeConfig, TicketType } from "@/types/ticket";
import { Plus, Pencil, Trash2, Layers, Wrench, Monitor } from "lucide-react";
import { toast } from "sonner";

export function TypeManagement() {
  const { ticketTypes, addTicketType, updateTicketType, deleteTicketType } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingType, setEditingType] = useState<TicketTypeConfig | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "" as TicketType,
    description: "",
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateTicketType(editingType.id, formData);
      toast.success("Type mis à jour");
    } else {
      addTicketType(formData);
      toast.success("Type ajouté");
    }
    handleClose();
  };

  const handleEdit = (type: TicketTypeConfig) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description,
      isActive: type.isActive
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
      code: "" as TicketType,
      description: "",
      isActive: true
    });
  };

  const handleDelete = (id: string) => {
    deleteTicketType(id);
    toast.success("Type supprimé");
  };

  const toggleActive = (type: TicketTypeConfig) => {
    updateTicketType(type.id, { isActive: !type.isActive });
    toast.success(type.isActive ? "Type désactivé" : "Type activé");
  };

  const getTypeIcon = (code: string) => {
    return code === "hardware" ? Wrench : Monitor;
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Layers className="h-5 w-5 text-secondary" />
            Types de tickets
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90" onClick={() => handleClose()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingType ? "Modifier le type" : "Nouveau type"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom du type</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Réseau"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code (identifiant technique)</Label>
                  <Input
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value as TicketType })}
                    placeholder="ex: network"
                    required
                    disabled={!!editingType}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description du type de ticket..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Actif</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={checked => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>Annuler</Button>
                  <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                    {editingType ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {ticketTypes.map(type => {
            const Icon = getTypeIcon(type.code);
            return (
              <div
                key={type.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:border-secondary/50 transition-colors"
              >
                <div className={`p-3 rounded-lg ${type.code === "hardware" ? "bg-secondary/10" : "bg-primary/10"}`}>
                  <Icon className={`h-6 w-6 ${type.code === "hardware" ? "text-secondary" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{type.name}</h4>
                    <Badge variant={type.isActive ? "default" : "secondary"} className={type.isActive ? "bg-success/10 text-success" : ""}>
                      {type.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  <p className="text-xs text-muted-foreground/70 mt-2">Code: {type.code}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(type)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(type.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
