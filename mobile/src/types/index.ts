export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
}

export interface Application {
  _id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  dateApplied?: string;
  notes?: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Technical'
  | 'Onsite'
  | 'Offer'
  | 'Accepted'
  | 'Rejected';

export interface ApplicationRef {
  _id: string;
  company: string;
  role: string;
}

export interface Interview {
  _id: string;
  application?: ApplicationRef | string;
  scheduledAt: string;
  type: InterviewType;
  interviewerName?: string;
  interviewerRole?: string;
  location?: string;
  prepNotes?: string;
  reflection?: string;
  rating?: number;
}

export type InterviewType =
  | 'Phone'
  | 'Video'
  | 'Technical'
  | 'Onsite'
  | 'Behavioral'
  | 'Other';

export interface Contact {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  linkedIn?: string;
  notes?: string;
  application?: ApplicationRef | string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
