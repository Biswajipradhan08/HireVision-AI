
export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  number: string;
  education: string;
  city: string;
  isAuthenticated: boolean;
  photoURL?: string;
  authMethod?: 'email' | 'google' | 'otp';
  subscriptionPlan?: 'free' | 'premium';
  subscriptionExpiresAt?: string;
  isOTPVerified?: boolean;
}

export interface OTPVerification {
  phone: string;
  otp: string;
  attempts: number;
  createdAt: string;
  expiresAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'Free' | 'Premium';
  price: number;
  currency: string;
  features: string[];
  duration: number; // in days
}

export interface PaymentOrder {
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  plan: 'premium';
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  expiresAt: string;
}

export interface InterviewSession {
  id: string;
  company: string;
  role: string;
  round: InterviewRound;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  score?: number;
  feedback?: string;
  resumeText?: string;
  jdText?: string;
  lastSynced?: string;
}

export type InterviewRound = 'HR Screening' | 'Technical Round' | 'Managerial Round' | 'HR Round (Offer)';

export interface AnalysisResult {
  matchPercentage: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface TranscriptionItem {
  speaker: 'Candidate' | 'Interviewer';
  text: string;
  timestamp: number;
}
