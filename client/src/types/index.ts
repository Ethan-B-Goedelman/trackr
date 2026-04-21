export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Application {
  _id: string;
  user: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  jobUrl?: string;
  dateApplied: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Phone Screen'
  | 'Technical'
  | 'Onsite'
  | 'Offer'
  | 'Accepted'
  | 'Rejected';

export interface Interview {
  _id: string;
  user: string;
  application: Application;
  scheduledAt: string;
  type: InterviewType;
  interviewerName?: string;
  interviewerRole?: string;
  location?: string;
  prepNotes?: string;
  reflection?: string;
  rating?: number | null;
  createdAt: string;
}

export type InterviewType = 'Phone' | 'Video' | 'Technical' | 'Onsite' | 'Behavioral' | 'Other';

export interface Contact {
  _id: string;
  user: string;
  application?: Application;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  linkedIn?: string;
  notes?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pages: number;
  limit: number;
}
