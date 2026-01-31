// Firebase Database Types (matching your Supabase schema)

export interface Company {
  id: string;
  userId: string;
  name: string;
  industry?: string;
  foundedDate?: string;
  teamSize?: number;
  fundingStage?: string;
  monthlyBurn?: number;
  currentCash?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  paymentMethod?: string;
  vendor?: string;
  aiConfidence?: number;
  needsReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: string;
  companyId: string;
  date: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  channel?: string;
  customerName?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Forecast {
  id: string;
  companyId: string;
  name: string;
  type: 'baseline' | 'scenario';
  assumptions: Record<string, any>;
  results: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIInsight {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface DataImport {
  id: string;
  companyId: string;
  filename: string;
  fileType: string;
  rowsImported: number;
  status: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

