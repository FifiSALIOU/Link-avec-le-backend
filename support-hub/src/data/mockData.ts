import { Ticket, User, Notification, TicketStats, TicketCategory, TicketTypeConfig, EmailTemplate, SystemSettings, RoleConfig } from "@/types/ticket";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean.dupont@entreprise.com",
    role: "user",
    avatar: "JD",
    department: "Marketing",
    isActive: true,
    createdAt: new Date("2024-06-15")
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie.martin@entreprise.com",
    role: "dsi",
    avatar: "MM",
    department: "DSI",
    isActive: true,
    createdAt: new Date("2024-01-10")
  },
  {
    id: "3",
    name: "Pierre Durand",
    email: "pierre.durand@entreprise.com",
    role: "adjoint",
    avatar: "PD",
    department: "DSI",
    isActive: true,
    createdAt: new Date("2024-02-20")
  },
  {
    id: "4",
    name: "Sophie Bernard",
    email: "sophie.bernard@entreprise.com",
    role: "technician",
    avatar: "SB",
    department: "Support Technique",
    specialization: "hardware",
    isActive: true,
    createdAt: new Date("2024-03-05")
  },
  {
    id: "5",
    name: "Lucas Moreau",
    email: "lucas.moreau@entreprise.com",
    role: "technician",
    avatar: "LM",
    department: "Support Technique",
    specialization: "software",
    isActive: true,
    createdAt: new Date("2024-03-15")
  },
  {
    id: "6",
    name: "Admin Système",
    email: "admin@entreprise.com",
    role: "admin",
    avatar: "AS",
    department: "Administration",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "7",
    name: "Claire Petit",
    email: "claire.petit@entreprise.com",
    role: "user",
    avatar: "CP",
    department: "Comptabilité",
    isActive: true,
    createdAt: new Date("2024-07-01")
  },
  {
    id: "8",
    name: "Thomas Leroy",
    email: "thomas.leroy@entreprise.com",
    role: "technician",
    avatar: "TL",
    department: "Support Technique",
    specialization: "hardware",
    isActive: true,
    createdAt: new Date("2024-04-10")
  },
  {
    id: "9",
    name: "Emma Richard",
    email: "emma.richard@entreprise.com",
    role: "user",
    avatar: "ER",
    department: "Ressources Humaines",
    isActive: false,
    createdAt: new Date("2024-05-20")
  }
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Ordinateur ne démarre plus",
    description: "Mon ordinateur portable ne démarre plus depuis ce matin. L'écran reste noir même après plusieurs tentatives.",
    type: "hardware",
    category: "Ordinateurs",
    subCategory: "Portable",
    priority: "high",
    status: "open",
    createdBy: mockUsers[0],
    createdAt: new Date("2025-01-05T09:00:00"),
    updatedAt: new Date("2025-01-05T09:00:00")
  },
  {
    id: "TKT-002",
    title: "Application SAP bloquée",
    description: "L'application SAP se bloque à chaque fois que j'essaie d'accéder au module de facturation.",
    type: "software",
    category: "Applications métier",
    subCategory: "SAP",
    priority: "medium",
    status: "assigned",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[4],
    createdAt: new Date("2025-01-04T14:30:00"),
    updatedAt: new Date("2025-01-05T10:00:00")
  },
  {
    id: "TKT-003",
    title: "Imprimante hors service",
    description: "L'imprimante de l'étage 2 n'imprime plus. Le voyant rouge clignote.",
    type: "hardware",
    category: "Périphériques",
    subCategory: "Imprimante",
    priority: "low",
    status: "in_progress",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[3],
    createdAt: new Date("2025-01-03T11:00:00"),
    updatedAt: new Date("2025-01-05T08:00:00")
  },
  {
    id: "TKT-004",
    title: "Mise à jour Windows échouée",
    description: "La mise à jour Windows 11 a échoué et maintenant l'ordinateur redémarre en boucle.",
    type: "software",
    category: "Système d'exploitation",
    subCategory: "Windows",
    priority: "high",
    status: "resolved",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[4],
    resolvedBy: mockUsers[4],
    createdAt: new Date("2025-01-02T16:00:00"),
    updatedAt: new Date("2025-01-04T12:00:00"),
    resolvedAt: new Date("2025-01-04T12:00:00"),
    resolution: "Restauration système effectuée. Mise à jour appliquée manuellement avec succès."
  },
  {
    id: "TKT-005",
    title: "Clavier défectueux",
    description: "Plusieurs touches de mon clavier ne fonctionnent plus correctement.",
    type: "hardware",
    category: "Périphériques",
    subCategory: "Clavier",
    priority: "medium",
    status: "delegated",
    createdBy: mockUsers[0],
    delegatedTo: mockUsers[2],
    createdAt: new Date("2025-01-05T08:00:00"),
    updatedAt: new Date("2025-01-05T09:30:00")
  },
  {
    id: "TKT-006",
    title: "Accès VPN impossible",
    description: "Je n'arrive plus à me connecter au VPN depuis mon domicile. Message d'erreur: authentification échouée.",
    type: "software",
    category: "Réseau",
    subCategory: "VPN",
    priority: "high",
    status: "reopened",
    createdBy: mockUsers[0],
    assignedTo: mockUsers[4],
    createdAt: new Date("2025-01-01T10:00:00"),
    updatedAt: new Date("2025-01-05T11:00:00"),
    reopenReason: "Le problème persiste malgré la réinitialisation du mot de passe."
  },
  {
    id: "TKT-007",
    title: "Écran secondaire non détecté",
    description: "Mon écran secondaire n'est plus détecté par l'ordinateur depuis la dernière mise à jour.",
    type: "hardware",
    category: "Périphériques",
    subCategory: "Écran",
    priority: "medium",
    status: "assigned",
    createdBy: mockUsers[6],
    assignedTo: mockUsers[3],
    createdAt: new Date("2025-01-04T09:00:00"),
    updatedAt: new Date("2025-01-05T14:00:00")
  },
  {
    id: "TKT-008",
    title: "Problème licence Office",
    description: "Ma licence Office affiche un message d'expiration alors qu'elle devrait être valide.",
    type: "software",
    category: "Applications métier",
    subCategory: "Microsoft Office",
    priority: "medium",
    status: "in_progress",
    createdBy: mockUsers[6],
    assignedTo: mockUsers[4],
    createdAt: new Date("2025-01-05T10:30:00"),
    updatedAt: new Date("2025-01-05T15:00:00")
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouveau ticket créé",
    message: "Jean Dupont a créé un nouveau ticket: Ordinateur ne démarre plus",
    type: "info",
    read: false,
    createdAt: new Date("2025-01-05T09:00:00"),
    ticketId: "TKT-001"
  },
  {
    id: "2",
    title: "Ticket assigné",
    message: "Le ticket TKT-002 vous a été assigné",
    type: "info",
    read: false,
    createdAt: new Date("2025-01-05T10:00:00"),
    ticketId: "TKT-002"
  },
  {
    id: "3",
    title: "Ticket résolu",
    message: "Le ticket TKT-004 a été résolu par Lucas Moreau",
    type: "success",
    read: true,
    createdAt: new Date("2025-01-04T12:00:00"),
    ticketId: "TKT-004"
  },
  {
    id: "4",
    title: "Ticket relancé",
    message: "Jean Dupont a relancé le ticket TKT-006 avec motif",
    type: "warning",
    read: false,
    createdAt: new Date("2025-01-05T11:00:00"),
    ticketId: "TKT-006"
  }
];

// Mock Categories
export const mockCategories: TicketCategory[] = [
  {
    id: "cat-1",
    name: "Ordinateurs",
    type: "hardware",
    subCategories: [
      { id: "sub-1-1", name: "Portable", isActive: true },
      { id: "sub-1-2", name: "Bureau", isActive: true },
      { id: "sub-1-3", name: "Station de travail", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "cat-2",
    name: "Périphériques",
    type: "hardware",
    subCategories: [
      { id: "sub-2-1", name: "Imprimante", isActive: true },
      { id: "sub-2-2", name: "Scanner", isActive: true },
      { id: "sub-2-3", name: "Clavier", isActive: true },
      { id: "sub-2-4", name: "Souris", isActive: true },
      { id: "sub-2-5", name: "Écran", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "cat-3",
    name: "Réseau",
    type: "hardware",
    subCategories: [
      { id: "sub-3-1", name: "Câblage", isActive: true },
      { id: "sub-3-2", name: "Wi-Fi", isActive: true },
      { id: "sub-3-3", name: "Switch", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "cat-4",
    name: "Applications métier",
    type: "software",
    subCategories: [
      { id: "sub-4-1", name: "SAP", isActive: true },
      { id: "sub-4-2", name: "Microsoft Office", isActive: true },
      { id: "sub-4-3", name: "CRM", isActive: true },
      { id: "sub-4-4", name: "ERP", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "cat-5",
    name: "Système d'exploitation",
    type: "software",
    subCategories: [
      { id: "sub-5-1", name: "Windows", isActive: true },
      { id: "sub-5-2", name: "macOS", isActive: true },
      { id: "sub-5-3", name: "Linux", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "cat-6",
    name: "Réseau",
    type: "software",
    subCategories: [
      { id: "sub-6-1", name: "VPN", isActive: true },
      { id: "sub-6-2", name: "Messagerie", isActive: true },
      { id: "sub-6-3", name: "Intranet", isActive: true }
    ],
    isActive: true,
    createdAt: new Date("2024-01-01")
  }
];

// Mock Ticket Types
export const mockTicketTypes: TicketTypeConfig[] = [
  {
    id: "type-1",
    name: "Matériel",
    code: "hardware",
    description: "Problèmes liés aux équipements physiques (ordinateurs, imprimantes, etc.)",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "type-2",
    name: "Applicatif",
    code: "software",
    description: "Problèmes liés aux logiciels et applications",
    isActive: true,
    createdAt: new Date("2024-01-01")
  }
];

// Mock Email Templates
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "email-1",
    name: "Création de ticket",
    subject: "Votre ticket #{ticketId} a été créé",
    body: "Bonjour {userName},\n\nVotre ticket #{ticketId} a été créé avec succès.\n\nTitre: {ticketTitle}\nPriorité: {ticketPriority}\n\nNous traiterons votre demande dans les meilleurs délais.\n\nCordialement,\nL'équipe Support",
    trigger: "ticket_created",
    isActive: true
  },
  {
    id: "email-2",
    name: "Ticket assigné",
    subject: "Ticket #{ticketId} assigné",
    body: "Bonjour {technicianName},\n\nLe ticket #{ticketId} vous a été assigné.\n\nTitre: {ticketTitle}\nPriorité: {ticketPriority}\nCréé par: {userName}\n\nMerci de le prendre en charge.\n\nCordialement,\nL'équipe DSI",
    trigger: "ticket_assigned",
    isActive: true
  },
  {
    id: "email-3",
    name: "Ticket résolu",
    subject: "Votre ticket #{ticketId} a été résolu",
    body: "Bonjour {userName},\n\nVotre ticket #{ticketId} a été résolu.\n\nRésolution: {resolution}\n\nSi le problème persiste, vous pouvez relancer le ticket.\n\nCordialement,\nL'équipe Support",
    trigger: "ticket_resolved",
    isActive: true
  },
  {
    id: "email-4",
    name: "Ticket relancé",
    subject: "Ticket #{ticketId} relancé",
    body: "Bonjour,\n\nLe ticket #{ticketId} a été relancé par {userName}.\n\nMotif: {reopenReason}\n\nMerci de le reprendre en charge.\n\nCordialement,\nL'équipe Support",
    trigger: "ticket_reopened",
    isActive: true
  },
  {
    id: "email-5",
    name: "Ticket délégué",
    subject: "Ticket #{ticketId} délégué",
    body: "Bonjour {adjointName},\n\nLe ticket #{ticketId} vous a été délégué par le DSI.\n\nTitre: {ticketTitle}\nPriorité: {ticketPriority}\n\nMerci de l'assigner à un technicien.\n\nCordialement,\nL'équipe DSI",
    trigger: "ticket_delegated",
    isActive: true
  }
];

// Mock System Settings
export const mockSystemSettings: SystemSettings = {
  companyName: "Mon Entreprise",
  companyEmail: "support@entreprise.com",
  emailNotificationsEnabled: true,
  autoAssignEnabled: false,
  maxTicketsPerTechnician: 10,
  ticketAutoCloseAfterDays: 7
};

// Mock Roles
export const mockRoles: RoleConfig[] = [
  {
    id: "role-1",
    name: "Utilisateur",
    code: "user",
    description: "Peut créer et suivre ses propres tickets",
    permissions: ["create_ticket", "view_own_tickets", "reopen_ticket", "validate_resolution"],
    isSystem: true
  },
  {
    id: "role-2",
    name: "DSI",
    code: "dsi",
    description: "Responsable du service informatique, peut déléguer ou assigner les tickets",
    permissions: ["view_all_tickets", "delegate_ticket", "assign_ticket", "view_reports", "manage_team"],
    isSystem: true
  },
  {
    id: "role-3",
    name: "Adjoint DSI",
    code: "adjoint",
    description: "Adjoint du DSI, peut assigner les tickets délégués aux techniciens",
    permissions: ["view_delegated_tickets", "assign_ticket", "view_technicians"],
    isSystem: true
  },
  {
    id: "role-4",
    name: "Technicien",
    code: "technician",
    description: "Résout les problèmes techniques assignés",
    permissions: ["view_assigned_tickets", "resolve_ticket", "add_comment"],
    isSystem: true
  },
  {
    id: "role-5",
    name: "Administrateur",
    code: "admin",
    description: "Accès complet au système",
    permissions: ["*"],
    isSystem: true
  }
];

// Stats Calculator
export const calculateStats = (tickets: Ticket[], userId?: string, role?: string): TicketStats => {
  const userTickets = userId && role === "user" 
    ? tickets.filter(t => t.createdBy.id === userId)
    : userId && role === "technician"
    ? tickets.filter(t => t.assignedTo?.id === userId)
    : tickets;

  return {
    total: userTickets.length,
    open: userTickets.filter(t => t.status === "open").length,
    inProgress: userTickets.filter(t => t.status === "in_progress" || t.status === "assigned").length,
    resolved: userTickets.filter(t => t.status === "resolved" || t.status === "closed").length,
    reopened: userTickets.filter(t => t.status === "reopened").length,
    delegated: userTickets.filter(t => t.status === "delegated").length,
    avgResolutionTime: "4.2h",
    satisfactionRate: 94
  };
};

// Stats by technician
export const getTechnicianStats = (tickets: Ticket[], technicianId: string) => {
  const techTickets = tickets.filter(t => t.assignedTo?.id === technicianId);
  return {
    assigned: techTickets.length,
    resolved: techTickets.filter(t => t.status === "resolved" || t.status === "closed").length,
    inProgress: techTickets.filter(t => t.status === "in_progress" || t.status === "assigned").length,
    reopened: techTickets.filter(t => t.status === "reopened").length
  };
};

// Stats for charts
export const getWeeklyStats = () => {
  return [
    { day: "Lun", created: 12, resolved: 10 },
    { day: "Mar", created: 8, resolved: 9 },
    { day: "Mer", created: 15, resolved: 12 },
    { day: "Jeu", created: 10, resolved: 14 },
    { day: "Ven", created: 7, resolved: 8 },
    { day: "Sam", created: 2, resolved: 3 },
    { day: "Dim", created: 1, resolved: 2 }
  ];
};

export const getMonthlyStats = () => {
  return [
    { month: "Jan", hardware: 45, software: 38 },
    { month: "Fév", hardware: 52, software: 42 },
    { month: "Mar", hardware: 48, software: 55 },
    { month: "Avr", hardware: 61, software: 48 },
    { month: "Mai", hardware: 55, software: 52 },
    { month: "Juin", hardware: 49, software: 45 }
  ];
};

export const getPriorityDistribution = (tickets: Ticket[]) => {
  return [
    { name: "Critique", value: tickets.filter(t => t.priority === "critical").length, color: "#dc2626" },
    { name: "Haute", value: tickets.filter(t => t.priority === "high").length, color: "#f97316" },
    { name: "Moyenne", value: tickets.filter(t => t.priority === "medium").length, color: "#eab308" },
    { name: "Basse", value: tickets.filter(t => t.priority === "low").length, color: "#22c55e" }
  ];
};

export const getStatusDistribution = (tickets: Ticket[]) => {
  return [
    { name: "Ouvert", value: tickets.filter(t => t.status === "open").length, color: "#3b82f6" },
    { name: "En cours", value: tickets.filter(t => t.status === "in_progress" || t.status === "assigned").length, color: "#f97316" },
    { name: "Délégué", value: tickets.filter(t => t.status === "delegated").length, color: "#8b5cf6" },
    { name: "Résolu", value: tickets.filter(t => t.status === "resolved" || t.status === "closed").length, color: "#22c55e" },
    { name: "Relancé", value: tickets.filter(t => t.status === "reopened").length, color: "#ef4444" }
  ];
};
