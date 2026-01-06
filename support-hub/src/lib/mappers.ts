import { User, Ticket, Notification, TicketStatus, TicketPriority, TicketType, UserRole } from '@/types/ticket';

// Mapper les rôles du backend vers le frontend
const mapRoleToUserRole = (roleName: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'Utilisateur': 'user',
    'DSI': 'dsi',
    'Adjoint DSI': 'adjoint',
    'Secrétaire DSI': 'adjoint',
    'Technicien': 'technician',
    'Admin': 'admin',
  };
  return roleMap[roleName] || 'user';
};

// Mapper les statuts du backend vers le frontend
const mapStatusToFrontend = (status: string): TicketStatus => {
  const statusMap: Record<string, TicketStatus> = {
    'en_attente_analyse': 'open',
    'assigne_technicien': 'assigned',
    'en_cours': 'in_progress',
    'resolu': 'resolved',
    'rejete': 'reopened',
    'cloture': 'closed',
  };
  return statusMap[status] || 'open';
};

// Mapper les priorités du backend vers le frontend
const mapPriorityToFrontend = (priority: string): TicketPriority => {
  const priorityMap: Record<string, TicketPriority> = {
    'faible': 'low',
    'moyenne': 'medium',
    'haute': 'high',
    'critique': 'critical',
  };
  return priorityMap[priority] || 'medium';
};

// Mapper les types du backend vers le frontend
const mapTypeToFrontend = (type: string): TicketType => {
  const typeMap: Record<string, TicketType> = {
    'materiel': 'hardware',
    'applicatif': 'software',
  };
  return typeMap[type] || 'hardware';
};

// Mapper un utilisateur du backend vers le frontend
export const mapUser = (backendUser: any): User => {
  const roleName = backendUser.role?.name || '';
  const initials = backendUser.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '';

  // S'assurer que l'ID est une string pour la cohérence
  const userId = typeof backendUser.id === 'string' ? backendUser.id : String(backendUser.id);

  return {
    id: userId,
    name: backendUser.full_name,
    email: backendUser.email,
    role: mapRoleToUserRole(roleName),
    avatar: initials,
    department: backendUser.agency,
    specialization: backendUser.specialization === 'materiel' ? 'hardware' : 
                     backendUser.specialization === 'applicatif' ? 'software' : undefined,
    isActive: backendUser.actif,
    createdAt: backendUser.created_at ? new Date(backendUser.created_at) : new Date(),
  };
};

// Mapper un ticket du backend vers le frontend
export const mapTicket = (backendTicket: any): Ticket => {
  // Déterminer le statut : si secretary_id existe mais pas technician_id, c'est un ticket délégué
  let status = mapStatusToFrontend(backendTicket.status);
  if (backendTicket.secretary_id && !backendTicket.technician_id && backendTicket.status === 'en_attente_analyse') {
    status = 'delegated';
  }

  // S'assurer que l'ID est une string pour la cohérence
  const ticketId = typeof backendTicket.id === 'string' ? backendTicket.id : String(backendTicket.id);
  const creatorId = backendTicket.creator_id ? (typeof backendTicket.creator_id === 'string' ? backendTicket.creator_id : String(backendTicket.creator_id)) : null;

  // Mapper le créateur - s'assurer que l'ID correspond
  let createdBy;
  if (backendTicket.creator) {
    createdBy = mapUser(backendTicket.creator);
    // S'assurer que l'ID du créateur correspond à creator_id
    if (creatorId && createdBy.id !== creatorId) {
      createdBy.id = creatorId;
    }
  } else if (creatorId) {
    createdBy = {
      id: creatorId,
      name: 'Unknown',
      email: '',
      role: 'user' as UserRole,
    };
  } else {
    // Fallback si aucun ID n'est disponible
    createdBy = {
      id: 'unknown',
      name: 'Unknown',
      email: '',
      role: 'user' as UserRole,
    };
  }

  return {
    id: ticketId,
    title: backendTicket.title,
    description: backendTicket.description,
    type: mapTypeToFrontend(backendTicket.type),
    category: backendTicket.category,
    priority: mapPriorityToFrontend(backendTicket.priority),
    status,
    createdBy,
    assignedTo: backendTicket.technician ? mapUser(backendTicket.technician) : undefined,
    delegatedTo: backendTicket.secretary ? mapUser(backendTicket.secretary) : undefined,
    resolvedBy: backendTicket.technician && (backendTicket.status === 'resolu' || backendTicket.status === 'cloture') ? mapUser(backendTicket.technician) : undefined,
    createdAt: new Date(backendTicket.created_at),
    updatedAt: backendTicket.updated_at ? new Date(backendTicket.updated_at) : new Date(backendTicket.created_at),
    resolvedAt: backendTicket.resolved_at ? new Date(backendTicket.resolved_at) : undefined,
    resolution: backendTicket.resolution_summary,
    reopenReason: backendTicket.rejection_reason,
    comments: backendTicket.comments?.map((c: any) => ({
      id: c.id,
      content: c.content,
      author: mapUser(c.user || { id: c.user_id, full_name: 'Unknown', email: '', role: { name: 'Utilisateur' }, actif: true }),
      createdAt: new Date(c.created_at),
      isInternal: c.type === 'interne',
    })) || [],
  };
};

// Mapper une notification du backend vers le frontend
export const mapNotification = (backendNotification: any): Notification => {
  return {
    id: backendNotification.id,
    title: backendNotification.type?.replace('_', ' ') || 'Notification',
    message: backendNotification.message,
    type: 'info', // Le backend n'a pas de type info/success/warning/error, on utilise 'info' par défaut
    read: backendNotification.read,
    createdAt: new Date(backendNotification.created_at),
    ticketId: backendNotification.ticket_id,
  };
};

