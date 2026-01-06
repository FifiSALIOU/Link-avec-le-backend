import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { notifications, unreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } = useApp();

  const unreadNotifications = notifications.filter(n => !n.read).slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-6">
      {/* Title Section */}
      <div className="flex flex-col">
        {title && (
          <h1 className="font-display text-xl font-bold text-foreground">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un ticket..."
            className="w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-secondary"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {unreadNotificationsCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadNotificationsCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-secondary hover:text-secondary/80"
                  onClick={markAllNotificationsAsRead}
                >
                  Tout marquer comme lu
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {unreadNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Aucune nouvelle notification
              </div>
            ) : (
              unreadNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Badge
                      variant={
                        notification.type === "success"
                          ? "default"
                          : notification.type === "warning"
                          ? "secondary"
                          : notification.type === "error"
                          ? "destructive"
                          : "outline"
                      }
                      className={cn(
                        "text-xs",
                        notification.type === "success" && "bg-success",
                        notification.type === "warning" && "bg-warning",
                        notification.type === "info" && "bg-info"
                      )}
                    >
                      {notification.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(notification.createdAt, {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </span>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="justify-center">
              <Link to="/notifications" className="text-secondary font-medium">
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
