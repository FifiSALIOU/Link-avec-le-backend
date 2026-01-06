export type UserRole = "user" | "dsi" | "adjoint" | "technician" | "admin";
export type TicketType = "hardware" | "software";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "assigned" | "delegated" | "in_progress" | "resolved" | "closed" | "reopened";
export type TechnicianSpecialization = "hardware" | "software";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  specialization?: TechnicianSpecialization;
  isActive?: boolean;
  createdAt?: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  category?: string;
  subCategory?: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: User;
  assignedTo?: User;
  delegatedTo?: User;
  resolvedBy?: User;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  reopenReason?: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  isInternal?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  ticketId?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  reopened: number;
  delegated: number;
  avgResolutionTime: string;
  satisfactionRate: number;
}

export interface DashboardKPIs {
  ticketsToday: number;
  ticketsThisWeek: number;
  pendingAssignment: number;
  overdue: number;
  avgResponseTime: string;
  resolutionRate: number;
}

// Categories and Types for Admin Management
export interface TicketCategory {
  id: string;
  name: string;
  type: TicketType;
  subCategories: SubCategory[];
  isActive: boolean;
  createdAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface TicketTypeConfig {
  id: string;
  name: string;
  code: TicketType;
  description: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: "ticket_created" | "ticket_assigned" | "ticket_resolved" | "ticket_reopened" | "ticket_delegated";
  isActive: boolean;
}

export interface SystemSettings {
  companyName: string;
  companyEmail: string;
  emailNotificationsEnabled: boolean;
  autoAssignEnabled: boolean;
  maxTicketsPerTechnician: number;
  ticketAutoCloseAfterDays: number;
}

export interface RoleConfig {
  id: string;
  name: string;
  code: UserRole;
  description: string;
  permissions: string[];
  isSystem: boolean;
}
