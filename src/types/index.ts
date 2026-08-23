export type SaturationLevel = 'low' | 'medium' | 'high';
export type PlanType = 'free' | 'pro';
export type UserRole = 'user' | 'admin';
export type SponsorTier = 'starter' | 'featured';

export interface ICompetitor {
  name: string;
  description: string;
  pricing: string;
  url: string;
}

export interface ScanResult {
  competitors: ICompetitor[];
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
}

export interface IScanDocument {
  _id: string;
  userId: string | null;
  ideaText: string;
  competitors: ICompetitor[];
  saturationScore: SaturationLevel;
  saturationReasoning: string;
  gapAnalysis: string;
  shareSlug: string;
  featured?: boolean;
  createdAt: Date;
}

export interface IUserDocument {
  _id: string;
  email: string;
  role: UserRole;
  plan: PlanType;
  suspended?: boolean;
  adminNotes?: string;
  stripeCustomerId?: string;
  scansUsedThisMonth: number;
  scansResetDate: Date;
  createdAt: Date;
}

export interface ISponsorDocument {
  _id: string;
  name: string;
  url: string;
  description: string;
  iconText?: string;
  tier: SponsorTier;
  active: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: Date;
}

export interface ISiteConfigDocument {
  _id?: string;
  freeTierMonthlyLimit: number;
  proMonthlyPrice: number;
  proYearlyPrice: number;
  estimatedCostPerScan: number;
  updatedAt?: Date;
}

export interface IAdminLogDocument {
  _id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  targetType?: string;
  note?: string;
  timestamp: Date;
}

export interface SessionPayload {
  userId: string;
  email: string;
  plan: PlanType;
  role?: UserRole;
}

export interface ScanAPIResponse {
  success: boolean;
  data?: IScanDocument;
  error?: string;
  rateLimited?: boolean;
  message?: string;
}
