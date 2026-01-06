import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  BarChart3,
  Wrench,
  Monitor,
  UserCog,
  ClipboardList,
  Layers,
  FolderTree
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const roleMenuItems = {
  user: [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
    { icon: PlusCircle, label: "Nouveau ticket", path: "/tickets/new" },
    { icon: Ticket, label: "Mes tickets", path: "/tickets" },
  ],
  dsi: [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
    { icon: ClipboardList, label: "Tous les tickets", path: "/tickets" },
    { icon: Users, label: "Équipe", path: "/team" },
    { icon: BarChart3, label: "Statistiques", path: "/stats" },
  ],
  adjoint: [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
    { icon: ClipboardList, label: "Tickets délégués", path: "/tickets" },
    { icon: Wrench, label: "Techniciens", path: "/technicians" },
    { icon: BarChart3, label: "Statistiques", path: "/stats" },
  ],
  technician: [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
    { icon: Ticket, label: "Mes assignations", path: "/tickets" },
    { icon: Monitor, label: "En cours", path: "/tickets/in-progress" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Tableau de bord", path: "/dashboard" },
    { icon: ClipboardList, label: "Tous les tickets", path: "/tickets" },
    { icon: Users, label: "Utilisateurs", path: "/users" },
    { icon: UserCog, label: "Rôles", path: "/roles" },
    { icon: Layers, label: "Types", path: "/types" },
    { icon: FolderTree, label: "Catégories", path: "/categories" },
    { icon: BarChart3, label: "Rapports", path: "/reports" },
    { icon: Settings, label: "Paramètres", path: "/settings" },
  ],
};

const roleLabels = {
  user: "Utilisateur",
  dsi: "DSI",
  adjoint: "Adjoint DSI",
  technician: "Technicien",
  admin: "Administrateur",
};

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser, setCurrentUser, unreadNotificationsCount } = useApp();

  if (!currentUser) return null;

  const menuItems = roleMenuItems[currentUser.role] || roleMenuItems.user;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl" />
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="font-display font-bold text-sidebar-foreground text-lg">
              HelpDesk
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Gestion des tickets
            </span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className={cn(
        "p-4 border-b border-sidebar-border",
        collapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed ? "flex-col" : ""
        )}>
          <Avatar className="h-10 w-10 bg-sidebar-primary">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
              {currentUser.avatar || currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex flex-col animate-fade-in overflow-hidden">
              <span className="font-medium text-sidebar-foreground truncate">
                {currentUser.name}
              </span>
              <span className="text-xs text-sidebar-primary font-medium">
                {roleLabels[currentUser.role]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                  "group-hover:scale-110",
                  isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
                )}
              />
              {!collapsed && (
                <span className="font-medium animate-fade-in truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Bottom Actions */}
      <div className="p-3 space-y-1">
        <Link
          to="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-sidebar-accent text-sidebar-foreground relative"
          )}
        >
          <Bell className="h-5 w-5 flex-shrink-0 text-sidebar-foreground/70" />
          {!collapsed && (
            <span className="font-medium animate-fade-in">Notifications</span>
          )}
          {unreadNotificationsCount > 0 && (
            <span className={cn(
              "absolute flex items-center justify-center h-5 min-w-5 px-1 text-xs font-bold rounded-full",
              "bg-secondary text-secondary-foreground",
              collapsed ? "top-1 right-1" : "right-3"
            )}>
              {unreadNotificationsCount}
            </span>
          )}
        </Link>

        <button
          onClick={() => {
            setCurrentUser(null);
            // Nettoyer le token
            localStorage.removeItem('access_token');
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-destructive/10 text-sidebar-foreground hover:text-destructive"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && (
            <span className="font-medium animate-fade-in">Déconnexion</span>
          )}
        </button>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 h-6 w-6 rounded-full",
          "bg-sidebar-primary text-sidebar-primary-foreground",
          "hover:bg-secondary hover:scale-110 transition-all duration-200",
          "shadow-lg border-2 border-background"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}
