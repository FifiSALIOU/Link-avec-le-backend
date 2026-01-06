import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save } from "lucide-react";
import { toast } from "sonner";

export function SystemSettings() {
  const { systemSettings, setSystemSettings } = useApp();
  const [formData, setFormData] = useState(systemSettings);

  const handleSave = () => {
    setSystemSettings(formData);
    toast.success("Paramètres enregistrés");
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Settings className="h-5 w-5 text-secondary" />
          Paramètres système
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Info */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Informations entreprise</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email de support</Label>
              <Input
                type="email"
                value={formData.companyEmail}
                onChange={e => setFormData({ ...formData, companyEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Notifications</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
            <div>
              <p className="font-medium">Notifications par email</p>
              <p className="text-sm text-muted-foreground">Envoyer des emails pour les événements de tickets</p>
            </div>
            <Switch
              checked={formData.emailNotificationsEnabled}
              onCheckedChange={checked => setFormData({ ...formData, emailNotificationsEnabled: checked })}
            />
          </div>
        </div>

        {/* Ticket Settings */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Gestion des tickets</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Assignation automatique</p>
                <p className="text-sm text-muted-foreground">Assigner automatiquement selon la spécialisation</p>
              </div>
              <Switch
                checked={formData.autoAssignEnabled}
                onCheckedChange={checked => setFormData({ ...formData, autoAssignEnabled: checked })}
              />
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-muted/30">
              <Label>Max tickets par technicien</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={formData.maxTicketsPerTechnician}
                onChange={e => setFormData({ ...formData, maxTicketsPerTechnician: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-muted/30">
            <Label>Fermeture automatique après (jours)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Les tickets résolus seront automatiquement fermés après ce délai sans relance
            </p>
            <Input
              type="number"
              min={1}
              max={30}
              value={formData.ticketAutoCloseAfterDays}
              onChange={e => setFormData({ ...formData, ticketAutoCloseAfterDays: parseInt(e.target.value) || 7 })}
              className="max-w-xs"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} className="bg-secondary hover:bg-secondary/90">
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
