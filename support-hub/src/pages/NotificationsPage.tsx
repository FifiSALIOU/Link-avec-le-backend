import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, Check, CheckCheck, Ticket, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const typeConfig = {
  info: { icon: Info, className: "bg-info/10 text-info border-info/30" },
  success: { icon: CheckCircle2, className: "bg-success/10 text-success border-success/30" },
  warning: { icon: AlertTriangle, className: "bg-warning/10 text-warning border-warning/30" },
  error: { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={`${unreadCount} notification(s) non lue(s)`}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-secondary" />
            <span className="font-semibold">{notifications.length} notifications</span>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              onClick={markAllNotificationsAsRead}
              className="text-secondary"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "relative p-4 rounded-xl border transition-all duration-200",
                    notification.read
                      ? "bg-card border-border"
                      : "bg-card border-secondary/30 shadow-glow"
                  )}
                >
                  {!notification.read && (
                    <div className="absolute top-4 right-4">
                      <div className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse" />
                    </div>
                  )}

                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
                        config.className
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(notification.createdAt, {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3">
                        {notification.ticketId && (
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/tickets`}>
                              <Ticket className="h-3 w-3 mr-1" />
                              {notification.ticketId}
                            </Link>
                          </Button>
                        )}

                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="text-secondary"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
              <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas de notification pour le moment
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
