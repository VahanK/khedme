export type UserRole = 'freelancer' | 'client'
export type ProjectStatus = 'open' | 'in_progress' | 'in_review' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

export interface Profile {
  id: string
  email: string
  full_name?: string
  role?: UserRole
  created_at: string
  updated_at: string
}

export interface ServicePackage {
  name: string
  description: string
  price_min: string
  price_max: string
}

export interface FreelancerProfile {
  id: string
  title?: string
  bio?: string
  skills?: string[]
  languages?: string[]
  hourly_rate?: number
  portfolio_url?: string
  avatar_url?: string
  availability?: AvailabilityStatus
  years_of_experience?: number
  service_packages?: ServicePackage[]
  completed_projects: number
  rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface ClientProfile {
  id: string
  company_name?: string
  company_description?: string
  company_website?: string
  avatar_url?: string
  total_projects_posted: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  freelancer_id?: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  status: ProjectStatus
  deadline?: string
  required_skills?: string[]
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  project_id: string
  freelancer_id: string
  cover_letter: string
  proposed_budget: number
  estimated_duration?: string
  status: ProposalStatus
  created_at: string
  updated_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  uploaded_by: string
  file_name: string
  file_path: string
  file_size?: number
  file_type?: string
  created_at: string
}

export interface FileComment {
  id: string
  file_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  project_id?: string
  participant_1_id: string
  participant_2_id: string
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Review {
  id: string
  project_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment?: string
  created_at: string
}

// Extended types with relations
export interface ProjectWithDetails extends Project {
  client?: Profile & { client_profile?: ClientProfile }
  freelancer?: Profile & { freelancer_profile?: FreelancerProfile }
  files?: ProjectFile[]
  proposals?: Proposal[]
}

export interface FreelancerWithProfile extends Profile {
  freelancer_profile?: FreelancerProfile
}

export interface ClientWithProfile extends Profile {
  client_profile?: ClientProfile
}

export interface ProjectFileWithDetails extends ProjectFile {
  uploader?: Profile
  comments?: (FileComment & { user?: Profile })[]
}

export interface FileCommentWithUser extends FileComment {
  user?: Profile
}

// Escrow System Types
export type EscrowStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'verified_held'
  | 'pending_release'
  | 'released'
  | 'disputed'
  | 'refunded'

export type EscrowTransactionType =
  | 'payment_submitted'
  | 'payment_verified'
  | 'release_requested'
  | 'payment_released'
  | 'refund_issued'
  | 'dispute_opened'

export interface EscrowTransaction {
  id: string
  project_id: string
  transaction_type: EscrowTransactionType
  amount?: number
  transaction_id?: string
  payment_method?: string
  notes?: string
  performed_by?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface ProjectWithEscrow extends Project {
  escrow_status?: EscrowStatus
  escrow_amount?: number
  freelancer_payout_amount?: number
  platform_fee_amount?: number
  platform_fee_percentage?: number
  payment_proof_url?: string
  payment_submitted_at?: string
  escrow_verified_at?: string
  escrow_verified_by?: string
  escrow_release_requested_at?: string
  escrow_released_at?: string
  escrow_released_by?: string
  contact_shared_at?: string
}

export interface EscrowTransactionWithDetails extends EscrowTransaction {
  project?: Project
  performer?: Profile
}

export interface ProjectWithFullDetails extends ProjectWithEscrow {
  client?: Profile & { client_profile?: ClientProfile }
  freelancer?: Profile & { freelancer_profile?: FreelancerProfile }
  files?: ProjectFile[]
  proposals?: Proposal[]
  escrow_transactions?: EscrowTransaction[]
}

// Deliverables System Types
export type DeliverableStatus = 'submitted' | 'under_review' | 'needs_revision' | 'approved' | 'rejected'
export type DeliverableRevisionStatus = 'pending' | 'in_progress' | 'completed'

export interface Deliverable {
  id: string
  project_id: string
  file_id?: string
  title: string
  description?: string
  status: DeliverableStatus
  revision_number: number
  submitted_by: string
  submitted_at: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface DeliverableRevision {
  id: string
  deliverable_id: string
  requested_by: string
  revision_notes: string
  status: DeliverableRevisionStatus
  created_at: string
  completed_at?: string
}

export interface DeliverableWithDetails extends Deliverable {
  file?: ProjectFile
  submitter?: Profile
  reviewer?: Profile
  revisions?: DeliverableRevision[]
}

export interface DeliverableRevisionWithDetails extends DeliverableRevision {
  requester?: Profile
  deliverable?: Deliverable
}

// Notification Types
export type NotificationType = 'new_project' | 'new_message'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
  is_read: boolean
  metadata?: {
    project_id?: string
    conversation_id?: string
    sender_id?: string
    message_id?: string
    project_title?: string
    client_id?: string
  }
  created_at: string
}
