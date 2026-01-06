import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Notification, Ticket, TicketCategory, TicketTypeConfig, EmailTemplate, SystemSettings, RoleConfig } from '@/types/ticket';
import { 
  ticketsApi, 
  usersApi, 
  notificationsApi, 
  ticketConfigApi, 
  authApi,
  settingsApi 
} from '@/lib/api';
import { mapUser } from '@/lib/mappers';
import { toast } from 'sonner';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  categories: TicketCategory[];
  setCategories: React.Dispatch<React.SetStateAction<TicketCategory[]>>;
  ticketTypes: TicketTypeConfig[];
  setTicketTypes: React.Dispatch<React.SetStateAction<TicketTypeConfig[]>>;
  emailTemplates: EmailTemplate[];
  setEmailTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
  roles: RoleConfig[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  loadData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addCategory: (category: Omit<TicketCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, data: Partial<TicketCategory>) => void;
  deleteCategory: (id: string) => void;
  addTicketType: (type: Omit<TicketTypeConfig, 'id' | 'createdAt'>) => void;
  updateTicketType: (id: string, data: Partial<TicketTypeConfig>) => void;
  deleteTicketType: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeConfig[]>([]);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: '',
    companyEmail: '',
    emailNotificationsEnabled: false,
    autoAssignEnabled: false,
    maxTicketsPerTechnician: 10,
    ticketAutoCloseAfterDays: 30,
  });
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données depuis l'API
  const loadData = async (user?: User) => {
    const userToUse = user || currentUser;
    if (!userToUse) return;
    
    setIsLoading(true);
    try {
      // Charger les données en parallèle
      // Note: Pour les utilisateurs normaux, on ne charge pas tous les utilisateurs (nécessite permissions admin)
      const [ticketsData, notificationsData, categoriesData, typesData, rolesData] = await Promise.all([
        userToUse.role === 'user' 
          ? ticketsApi.getMyTickets() 
          : userToUse.role === 'technician'
          ? ticketsApi.getAssignedTickets()
          : ticketsApi.getAll(),
        notificationsApi.getAll(0, 50),
        ticketConfigApi.getCategories(),
        ticketConfigApi.getTypes(),
        authApi.getRoles(),
      ]);

      // Charger les utilisateurs seulement si l'utilisateur a les permissions nécessaires
      let usersData: User[] = [];
      try {
        if (userToUse.role === 'admin' || userToUse.role === 'dsi' || userToUse.role === 'adjoint') {
          usersData = await usersApi.getAll();
        }
      } catch (error: any) {
        console.warn('Impossible de charger les utilisateurs (permissions insuffisantes):', error.message);
        // On continue même si on ne peut pas charger les utilisateurs
      }

      console.log('Tickets chargés:', ticketsData.length, 'pour utilisateur:', userToUse.id, userToUse.name);
      console.log('Détails des tickets:', ticketsData);
      console.log('Utilisateurs chargés:', usersData.length);

      setTickets(ticketsData);
      setUsers(usersData);
      setNotifications(notificationsData);
      setCategories(categoriesData);
      setTicketTypes(typesData);
      setRoles(rolesData);

      // Charger les paramètres système si admin/DSI
      if (userToUse.role === 'admin' || userToUse.role === 'dsi') {
        try {
          const emailSettings = await settingsApi.getEmailSettings();
          setSystemSettings(prev => ({
            ...prev,
            companyEmail: emailSettings.sender_email,
            emailNotificationsEnabled: emailSettings.email_enabled,
          }));
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les données',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données quand l'utilisateur change
  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      // Réinitialiser les données si déconnexion
      setTickets([]);
      setUsers([]);
      setNotifications([]);
      setCategories([]);
      setTicketTypes([]);
      setRoles([]);
    }
  }, [currentUser]);

  // Charger le nombre de notifications non lues périodiquement
  useEffect(() => {
    if (!currentUser) return;

    const updateUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        // Mettre à jour les notifications pour refléter le bon nombre
        const allNotifications = await notificationsApi.getAll(0, 50);
        setNotifications(allNotifications);
      } catch (error) {
        console.error('Erreur lors de la mise à jour des notifications:', error);
      }
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [currentUser]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      toast.error('Erreur', {
        description: 'Impossible de marquer la notification comme lue',
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      toast.error('Erreur', {
        description: 'Impossible de marquer toutes les notifications comme lues',
      });
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // User management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    try {
      // Trouver le rôle correspondant
      const role = roles.find(r => r.code === userData.role);
      if (!role) {
        throw new Error('Rôle non trouvé');
      }

      const newUser = await usersApi.create({
        full_name: userData.name,
        email: userData.email,
        username: userData.email.split('@')[0], // Utiliser l'email comme base pour le username
        password: 'TempPassword123!', // Mot de passe temporaire, devrait être changé
        agency: userData.department,
        role_id: role.id,
        specialization: userData.specialization === 'hardware' ? 'materiel' : 
                        userData.specialization === 'software' ? 'applicatif' : undefined,
      });

      setUsers(prev => [...prev, mapUser(newUser)]);
      toast.success('Utilisateur créé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de créer l\'utilisateur',
      });
      throw error;
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const role = data.role ? roles.find(r => r.code === data.role) : undefined;
      
      const updatedUser = await usersApi.update(id, {
        full_name: data.name,
        email: data.email,
        agency: data.department,
        role_id: role?.id,
        actif: data.isActive,
        specialization: data.specialization === 'hardware' ? 'materiel' : 
                       data.specialization === 'software' ? 'applicatif' : undefined,
      });

      setUsers(prev => prev.map(u => u.id === id ? mapUser(updatedUser) : u));
      toast.success('Utilisateur mis à jour avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de mettre à jour l\'utilisateur',
      });
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await usersApi.delete(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      toast.error('Erreur', {
        description: error.message || 'Impossible de supprimer l\'utilisateur',
      });
      throw error;
    }
  };


  // Category management (pour l'instant, on garde la logique locale car l'API ne supporte peut-être pas encore la création/modification)
  const addCategory = (categoryData: Omit<TicketCategory, 'id' | 'createdAt'>) => {
    const newCategory: TicketCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      createdAt: new Date()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (id: string, data: Partial<TicketCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Ticket type management (pour l'instant, on garde la logique locale)
  const addTicketType = (typeData: Omit<TicketTypeConfig, 'id' | 'createdAt'>) => {
    const newType: TicketTypeConfig = {
      ...typeData,
      id: `type-${Date.now()}`,
      createdAt: new Date()
    };
    setTicketTypes(prev => [...prev, newType]);
  };

  const updateTicketType = (id: string, data: Partial<TicketTypeConfig>) => {
    setTicketTypes(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const deleteTicketType = (id: string) => {
    setTicketTypes(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        tickets,
        setTickets,
        notifications,
        setNotifications,
        users,
        setUsers,
        categories,
        setCategories,
        ticketTypes,
        setTicketTypes,
        emailTemplates,
        setEmailTemplates,
        systemSettings,
        setSystemSettings,
        roles,
        unreadNotificationsCount,
        isLoading,
        loadData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        addUser,
        updateUser,
        deleteUser,
        addCategory,
        updateCategory,
        deleteCategory,
        addTicketType,
        updateTicketType,
        deleteTicketType
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
