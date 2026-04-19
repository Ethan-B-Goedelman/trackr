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

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
