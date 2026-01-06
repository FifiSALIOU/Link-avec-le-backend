import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TicketCategory, TicketType, SubCategory } from "@/types/ticket";
import { Plus, Pencil, Trash2, FolderTree, Tag, Wrench, Monitor } from "lucide-react";
import { toast } from "sonner";

export function CategoryManagement() {
  const { categories, ticketTypes, addCategory, updateCategory, deleteCategory } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TicketCategory | null>(null);
  const [newSubCategory, setNewSubCategory] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "hardware" as TicketType,
    subCategories: [] as SubCategory[],
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast.success("Catégorie mise à jour");
    } else {
      addCategory(formData);
      toast.success("Catégorie ajoutée");
    }
    handleClose();
  };

  const handleEdit = (category: TicketCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      subCategories: category.subCategories,
      isActive: category.isActive
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      type: "hardware",
      subCategories: [],
      isActive: true
    });
    setNewSubCategory("");
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast.success("Catégorie supprimée");
  };

  const addSubCategory = () => {
    if (newSubCategory.trim()) {
      setFormData({
        ...formData,
        subCategories: [
          ...formData.subCategories,
          { id: `sub-${Date.now()}`, name: newSubCategory.trim(), isActive: true }
        ]
      });
      setNewSubCategory("");
    }
  };

  const removeSubCategory = (id: string) => {
    setFormData({
      ...formData,
      subCategories: formData.subCategories.filter(s => s.id !== id)
    });
  };

  const hardwareCategories = categories.filter(c => c.type === "hardware");
  const softwareCategories = categories.filter(c => c.type === "software");

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-secondary" />
            Catégories et sous-catégories
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90" onClick={() => handleClose()}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de la catégorie</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Périphériques"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de ticket</Label>
                  <Select value={formData.type} onValueChange={(v: TicketType) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.filter(t => t.isActive).map(type => (
                        <SelectItem key={type.code} value={type.code}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sous-catégories</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newSubCategory}
                      onChange={e => setNewSubCategory(e.target.value)}
                      placeholder="Ajouter une sous-catégorie"
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSubCategory())}
                    />
                    <Button type="button" variant="outline" onClick={addSubCategory}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.subCategories.map(sub => (
                      <Badge key={sub.id} variant="secondary" className="gap-1">
                        {sub.name}
                        <button type="button" onClick={() => removeSubCategory(sub.id)} className="ml-1 hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleClose}>Annuler</Button>
                  <Button type="submit" className="bg-secondary hover:bg-secondary/90">
                    {editingCategory ? "Modifier" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-4">
          {/* Hardware Categories */}
          <AccordionItem value="hardware" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-secondary" />
                <span className="font-medium">Matériel</span>
                <Badge variant="secondary">{hardwareCategories.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {hardwareCategories.map(cat => (
                  <div key={cat.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cat.name}</span>
                        <Badge variant={cat.isActive ? "outline" : "secondary"} className="text-xs">
                          {cat.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cat.subCategories.map(sub => (
                          <Badge key={sub.id} variant="secondary" className="text-xs">{sub.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Software Categories */}
          <AccordionItem value="software" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-primary" />
                <span className="font-medium">Applicatif</span>
                <Badge variant="secondary">{softwareCategories.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {softwareCategories.map(cat => (
                  <div key={cat.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{cat.name}</span>
                        <Badge variant={cat.isActive ? "outline" : "secondary"} className="text-xs">
                          {cat.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cat.subCategories.map(sub => (
                          <Badge key={sub.id} variant="secondary" className="text-xs">{sub.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
