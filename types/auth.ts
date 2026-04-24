// Authentication and RBAC Types

export interface Role {
  id: string;
  name: 'CEO' | 'Manager' | 'Senior Officer' | 'Junior Officer' | 'Intern';
  description: string;
  level: number;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role_id: string;
  role?: Role;
  avatar_url?: string;
  phone_number?: string;
  department?: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SignupRequest {
  id: string;
  auth_user_id?: string | null;
  username?: string | null;
  full_name: string;
  email: string;
  phone_number?: string | null;
  user_type: 'student' | 'teacher' | 'client' | 'team_member';
  status: 'pending' | 'approved' | 'rejected';
  department?: string | null;
  title?: string | null;
  role_id?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  team_type?: string;
  captain_id?: string;
  captain?: User;
  created_by?: string;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
  team_members?: TeamMember[]; // Alias for compatibility
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  user?: User;
  joined_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id?: string;
  team?: Team;
  status: 'active' | 'on-hold' | 'completed' | 'archived' | 'planning' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  due_date?: string;
  end_date?: string; // Additional property
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  project?: Project;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'in_progress';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string;
  created_by?: string;
  creator?: User;
  assignments?: TaskAssignment[];
  task_assignments?: TaskAssignment[]; // Alias for compatibility
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  assigned_by?: string;
  assigned_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id?: string;
  user?: User;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  uploaded_at: string;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  created_at: string;
}

export interface Permission {
  id: string;
  user_id: string;
  permission_type: 'view_team_tasks' | 'view_user_tasks' | 'view_all_tasks';
  target_id?: string;
  granted_by?: string;
  granted_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user?: User;
  action: string;
  entity_type: 'user' | 'task' | 'project' | 'team';
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Permission helpers
export const ROLE_LEVELS = {
  CEO: 1,
  Manager: 2,
  'Senior Officer': 3,
  'Junior Officer': 4,
  Intern: 5,
} as const;

export const canManageUsers = (role: Role) => role.level <= 2; // CEO or Manager
export const canDeleteUsers = (role: Role) => role.level === 1; // CEO only
export const canManagePermissions = (role: Role) => role.level <= 2; // CEO or Manager
export const canViewAllTasks = (role: Role) => role.level <= 2; // CEO or Manager
export const isTeamCaptain = (userId: string, team: Team) => team.captain_id === userId;

// Task status colors
export const TASK_STATUS_COLORS = {
  'todo': 'bg-gray-500',
  'in-progress': 'bg-blue-500',
  'review': 'bg-yellow-500',
  'completed': 'bg-green-500',
} as const;

// Priority colors
export const PRIORITY_COLORS = {
  'low': 'bg-gray-400',
  'medium': 'bg-blue-400',
  'high': 'bg-orange-400',
  'urgent': 'bg-red-500',
} as const;

// Project status colors
export const PROJECT_STATUS_COLORS = {
  'active': 'bg-green-500',
  'on-hold': 'bg-yellow-500',
  'completed': 'bg-blue-500',
  'archived': 'bg-gray-500',
} as const;

// Testimonial Types
export interface TestimonialLink {
  id: string;
  token: string;
  email?: string;
  expires_at: string;
  used: boolean;
  used_at?: string;
  created_by?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  link_id?: string;
  link?: TestimonialLink;
  name: string;
  email: string;
  company?: string;
  position?: string;
  message: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  image_url?: string;
  approved_by?: string;
  approved_by_user?: User;
  approved_at?: string;
  rejected_by?: string;
  rejected_by_user?: User;
  rejected_at?: string;
  created_at: string;
}

export const canManageTestimonials = (role: Role) => role.level <= 2; // CEO or Manager

// Payment System Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'mobile_banking' | 'card' | 'crypto' | 'other';
  account_details: Record<string, string | number>;
  instructions?: string;
  is_active: boolean;
  display_order: number;
  icon_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  user?: User;
  payment_method_id?: string;
  payment_method?: PaymentMethod;
  
  // Transaction Details
  transaction_id: string;
  amount: number;
  currency: string;
  
  // Purchase Details
  purchase_type: 'course' | 'service' | 'product' | 'other';
  purchase_id: string;
  purchase_details?: Record<string, unknown>;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  
  // Review Information
  reviewed_by?: string;
  reviewed_by_user?: User;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Client Database Types
export interface ClientMediaItem {
  name: string;
  type: string;
  dataUrl: string;
  size?: number;
}

export interface ClientSocialLink {
  platform: string;
  url: string;
}

export interface ClientRecord {
  id: string;
  client_id: string;
  client_status:
    | 'Initial'
    | '1st Attack'
    | 'Fellows'
    | 'Attack Plan Done'
    | 'Replied'
    | 'Project Planning'
    | 'Project Revision'
    | 'Project Running'
    | 'Re Follow Up'
    | 'Cold'
    | 'Connected'
    | 'Re Cold'
    | 'Follow Up'
    | 'Black Listed'
    | 'Not Client'
    | 'Client';
  possibility: 'High' | 'Medium' | 'Low';
  client_name: string;
  business_name: string;
  client_description?: string;
  client_business_type?: string;
  client_found_from?: string;
  client_media?: ClientMediaItem[];
  important_links?: string[];
  social_links?: ClientSocialLink[];
  phone_numbers?: string[];
  whatsapp_numbers?: string[];
  imo_numbers?: string[];
  emails?: string[];
  country?: string;
  address?: string;
  consultation_time_local?: string;
  consultation_timezone?: string;
  consultation_time_bdt?: string;
  cold_email?: string;
  cold_message?: string;
  follow_up_emails?: string[];
  follow_up_messages?: string[];
  comment?: string;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface PaymentVerificationLog {
  id: string;
  transaction_id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'refunded' | 'updated';
  performed_by?: string;
  performed_by_user?: User;
  notes?: string;
  created_at: string;
}

export const canManagePayments = (role: Role) => role.level <= 2; // CEO or Manager


