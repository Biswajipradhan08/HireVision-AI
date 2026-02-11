
export interface UserProfile {
  name: string;
  email: string;
  number: string;
  education: string;
  city: string;
  isAuthenticated: boolean;
  photoURL?: string;
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
