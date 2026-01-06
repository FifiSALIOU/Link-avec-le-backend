import { useApp } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, TrendingUp, Ticket, Users, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ReportsSection() {
  const { tickets, users } = useApp();
  const [period, setPeriod] = useState("month");

  const stats = {
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter(t => t.status === "resolved" || t.status === "closed").length,
    avgResolutionTime: "4.2h",
    reopenRate: Math.round((tickets.filter(t => t.status === "reopened").length / tickets.length) * 100) || 0,
    byType: {
      hardware: tickets.filter(t => t.type === "hardware").length,
      software: tickets.filter(t => t.type === "software").length
    },
    byPriority: {
      critical: tickets.filter(t => t.priority === "critical").length,
      high: tickets.filter(t => t.priority === "high").length,
      medium: tickets.filter(t => t.priority === "medium").length,
      low: tickets.filter(t => t.priority === "low").length
    }
  };

  const technicians = users.filter(u => u.role === "technician");
  const technicianStats = technicians.map(tech => ({
    ...tech,
    assigned: tickets.filter(t => t.assignedTo?.id === tech.id).length,
    resolved: tickets.filter(t => t.resolvedBy?.id === tech.id).length,
    inProgress: tickets.filter(t => t.assignedTo?.id === tech.id && (t.status === "in_progress" || t.status === "assigned")).length
  }));

  const exportReport = (format: "pdf" | "excel") => {
    toast.success(`Rapport exporté en ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary" />
              Rapports et statistiques
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => exportReport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => exportReport("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Ticket className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total tickets</p>
                <p className="text-2xl font-bold">{stats.totalTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux résolution</p>
                <p className="text-2xl font-bold">{Math.round((stats.resolvedTickets / stats.totalTickets) * 100) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temps moyen</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <Users className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux relance</p>
                <p className="text-2xl font-bold">{stats.reopenRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Type */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span>Matériel</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full" 
                      style={{ width: `${(stats.byType.hardware / stats.totalTickets) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary">{stats.byType.hardware}</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span>Applicatif</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${(stats.byType.software / stats.totalTickets) * 100}%` }}
                    />
                  </div>
                  <Badge variant="secondary">{stats.byType.software}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By Priority */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Répartition par priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Critique", value: stats.byPriority.critical, color: "bg-destructive" },
                { label: "Haute", value: stats.byPriority.high, color: "bg-secondary" },
                { label: "Moyenne", value: stats.byPriority.medium, color: "bg-warning" },
                { label: "Basse", value: stats.byPriority.low, color: "bg-success" }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span>{item.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.value / stats.totalTickets) * 100}%` }}
                      />
                    </div>
                    <Badge variant="secondary">{item.value}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Performance des techniciens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Spécialisation</TableHead>
                  <TableHead className="text-center">Assignés</TableHead>
                  <TableHead className="text-center">En cours</TableHead>
                  <TableHead className="text-center">Résolus</TableHead>
                  <TableHead className="text-center">Taux</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicianStats.map(tech => (
                  <TableRow key={tech.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary text-sm font-medium">
                          {tech.avatar}
                        </div>
                        <span className="font-medium">{tech.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {tech.specialization === "hardware" ? "Matériel" : "Applicatif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{tech.assigned}</TableCell>
                    <TableCell className="text-center">{tech.inProgress}</TableCell>
                    <TableCell className="text-center">{tech.resolved}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={tech.assigned > 0 && (tech.resolved / tech.assigned) >= 0.7 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                        {tech.assigned > 0 ? Math.round((tech.resolved / tech.assigned) * 100) : 0}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
