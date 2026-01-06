import { apiClient, apiFormRequest, setToken, removeToken } from './apiClient';
import { mapUser, mapTicket, mapNotification } from './mappers';
import { User, Ticket, Notification, TicketCategory, TicketTypeConfig, SystemSettings, RoleConfig } from '@/types/ticket';

// ==================== AUTHENTICATION ====================
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password'); // Requis pour OAuth2PasswordRequestForm
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    // scope est optionnel mais on peut le laisser vide
    
    const response = await apiFormRequest<TokenResponse>('/auth/token', formData);
    setToken(response.access_token);
    return response;
  },

  logout: () => {
    removeToken();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<any>('/auth/me');
    return mapUser(response);
  },

  getRoles: async (): Promise<RoleConfig[]> => {
    const response = await apiClient.get<any[]>('/auth/roles');
    return response.map(role => ({
      id: role.id,
      name: role.name,
      code: role.name.toLowerCase().replace(' ', '_') as any,
      description: role.description || '',
      permissions: role.permissions || [],
      isSystem: true,
    }));
  },
};

// ==================== TICKETS ====================
export interface CreateTicketData {
  title: string;
  description: string;
  type: 'materiel' | 'applicatif';
  priority: 'faible' | 'moyenne' | 'haute' | 'critique';
  category?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  type?: 'materiel' | 'applicatif';
  priority?: 'faible' | 'moyenne' | 'haute' | 'critique';
  category?: string;
  status?: string;
  technician_id?: string;
  resolution_summary?: string;
}

export const ticketsApi = {
  getAll: async (): Promise<Ticket[]> => {
    const response = await apiClient.get<any[]>('/tickets/');
    return response.map(mapTicket);
  },

  getMyTickets: async (): Promise<Ticket[]> => {
    try {
      const response = await apiClient.get<any[]>('/tickets/me');
      console.log('API getMyTickets - Réponse brute:', response);
      const mappedTickets = response.map(mapTicket);
      console.log('API getMyTickets - Tickets mappés:', mappedTickets);
      return mappedTickets;
    } catch (error: any) {
      console.error('Erreur lors de la récupération des tickets:', error);
      throw error;
    }
  },

  getAssignedTickets: async (): Promise<Ticket[]> => {
    const response = await apiClient.get<any[]>('/tickets/assigned');
    return response.map(mapTicket);
  },

  getById: async (id: string): Promise<Ticket> => {
    const response = await apiClient.get<any>(`/tickets/${id}`);
    return mapTicket(response);
  },

  create: async (data: CreateTicketData): Promise<Ticket> => {
    const response = await apiClient.post<any>('/tickets/', data);
    return mapTicket(response);
  },

  update: async (id: string, data: UpdateTicketData): Promise<Ticket> => {
    const response = await apiClient.put<any>(`/tickets/${id}`, data);
    return mapTicket(response);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tickets/${id}`);
  },

  assign: async (id: string, technicianId: string, reason?: string, notes?: string): Promise<Ticket> => {
    const response = await apiClient.put<any>(`/tickets/${id}/assign`, {
      technician_id: technicianId,
      reason,
      notes,
    });
    return mapTicket(response);
  },

  delegate: async (id: string, adjointId: string, reason?: string, notes?: string): Promise<Ticket> => {
    const response = await apiClient.put<any>(`/tickets/${id}/delegate-adjoint`, {
      adjoint_id: adjointId,
      reason,
      notes,
    });
    return mapTicket(response);
  },

  resolve: async (id: string, resolutionSummary: string): Promise<Ticket> => {
    const response = await apiClient.put<any>(`/tickets/${id}/status`, {
      status: 'resolu',
      resolution_summary: resolutionSummary,
    });
    return mapTicket(response);
  },

  validate: async (id: string, validated: boolean, rejectionReason?: string): Promise<Ticket> => {
    const response = await apiClient.put<any>(`/tickets/${id}/validate`, {
      validated,
      rejection_reason: rejectionReason,
    });
    return mapTicket(response);
  },

  reopen: async (id: string, technicianId?: string, reason?: string, notes?: string): Promise<Ticket> => {
    // Si technicianId est fourni, utiliser l'endpoint pour réassigner
    if (technicianId) {
      const response = await apiClient.put<any>(`/tickets/${id}/reopen`, {
        technician_id: technicianId,
        reason,
        notes,
      });
      return mapTicket(response);
    } else {
      // Sinon, réouverture par l'utilisateur
      const response = await apiClient.put<any>(`/tickets/${id}/reopen-by-user`);
      return mapTicket(response);
    }
  },
};

// ==================== USERS ====================
export interface CreateUserData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  agency?: string;
  phone?: string;
  role_id: string;
  specialization?: string;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  agency?: string;
  phone?: string;
  role_id?: string;
  actif?: boolean;
  specialization?: string;
  max_tickets_capacity?: number;
  notes?: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<any[]>('/users/');
    return response.map(mapUser);
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<any>(`/users/${id}`);
    return mapUser(response);
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post<any>('/users/', data);
    return mapUser(response);
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<any>(`/users/${id}`, data);
    return mapUser(response);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getTechnicians: async (): Promise<User[]> => {
    const response = await apiClient.get<any[]>('/users/technicians');
    return response.map(mapUser);
  },

  getTechnicianStats: async (technicianId: string): Promise<any> => {
    return await apiClient.get<any>(`/users/technicians/${technicianId}/stats`);
  },

  resetPassword: async (id: string, newPassword?: string): Promise<void> => {
    await apiClient.post(`/users/${id}/reset-password`, {
      new_password: newPassword,
    });
  },
};

// ==================== NOTIFICATIONS ====================
export const notificationsApi = {
  getAll: async (skip = 0, limit = 50, unreadOnly = false): Promise<Notification[]> => {
    const response = await apiClient.get<any[]>(
      `/notifications/?skip=${skip}&limit=${limit}&unread_only=${unreadOnly}`
    );
    return response.map(mapNotification);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ unread_count: number }>('/notifications/unread/count');
    return response.unread_count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.put<any>(`/notifications/${id}/read`);
    return mapNotification(response);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },
};

// ==================== SETTINGS ====================
export interface EmailSettings {
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  sender_email: string;
  sender_name: string;
  use_tls: boolean;
  verify_ssl: boolean;
  email_enabled: boolean;
}

export const settingsApi = {
  getEmailSettings: async (): Promise<EmailSettings> => {
    return await apiClient.get<EmailSettings>('/settings/email');
  },

  updateEmailSettings: async (settings: Partial<EmailSettings>): Promise<EmailSettings> => {
    return await apiClient.put<EmailSettings>('/settings/email', settings);
  },

  testEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
    return await apiClient.post<{ success: boolean; message: string }>('/settings/email/test', email);
  },
};

// ==================== TICKET CONFIG ====================
export const ticketConfigApi = {
  getTypes: async (): Promise<TicketTypeConfig[]> => {
    const response = await apiClient.get<any[]>('/ticket-config/types');
    return response.map(type => ({
      id: type.id,
      name: type.label,
      code: type.code === 'materiel' ? 'hardware' : 'software',
      description: type.label,
      isActive: type.is_active,
      createdAt: new Date(),
    }));
  },

  getCategories: async (typeCode?: string): Promise<TicketCategory[]> => {
    const url = typeCode 
      ? `/ticket-config/categories?type_code=${typeCode}`
      : '/ticket-config/categories';
    const response = await apiClient.get<any[]>(url);
    return response.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: cat.type_code === 'materiel' ? 'hardware' : 'software',
      subCategories: [],
      isActive: cat.is_active,
      createdAt: new Date(),
    }));
  },
};

