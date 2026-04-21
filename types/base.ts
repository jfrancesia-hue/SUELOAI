export type UserRole = 'investor' | 'developer' | 'admin';
export type ProjectStatus = 'draft' | 'funding' | 'funded' | 'in_progress' | 'completed' | 'cancelled';
export type InvestmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';
export type TransactionType = 'investment' | 'return' | 'fee' | 'refund';
export type DocumentType = 'contract' | 'deed' | 'report' | 'certificate' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string | null;
  dni: string | null;
  company_name: string | null;
  avatar_url: string | null;
  kyc_verified: boolean;
  total_invested: number;
  total_returns: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  developer_id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ProjectStatus;
  total_value: number;
  token_price: number;
  total_tokens: number;
  sold_tokens: number;
  min_investment: number;
  expected_return: number;
  return_period_months: number;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  gallery_urls: string[];
  documents_url: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
  developer?: Profile;
  investments?: Investment[];
}

export interface Investment {
  id: string;
  investor_id: string;
  project_id: string;
  tokens_purchased: number;
  amount: number;
  status: InvestmentStatus;
  contract_hash: string | null;
  contract_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  investor?: Profile;
  project?: Project;
}

export interface Transaction {
  id: string;
  user_id: string;
  investment_id: string | null;
  project_id: string | null;
  type: TransactionType;
  amount: number;
  description: string | null;
  reference_code: string;
  created_at: string;
  project?: Project;
}

export interface Document {
  id: string;
  project_id: string | null;
  investment_id: string | null;
  uploaded_by: string;
  type: DocumentType;
  title: string;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
}

export interface HashRecord {
  id: string;
  document_id: string | null;
  investment_id: string | null;
  project_id: string | null;
  hash: string;
  algorithm: string;
  data_snapshot: Record<string, unknown> | null;
  verified: boolean;
  verification_url: string | null;
  created_by: string;
  created_at: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  location: string;
  address?: string;
  total_value: number;
  token_price: number;
  total_tokens: number;
  min_investment: number;
  expected_return: number;
  return_period_months: number;
  start_date?: string;
  end_date?: string;
}

export interface CreateInvestmentInput {
  project_id: string;
  tokens_purchased: number;
}

export interface InvestorStats {
  total_invested: number;
  total_returns: number;
  active_investments: number;
  projects_count: number;
}

export interface DeveloperStats {
  total_projects: number;
  total_raised: number;
  active_projects: number;
  total_investors: number;
}
