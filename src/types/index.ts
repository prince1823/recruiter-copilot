// Types for the real backend API integration
// Based on Postman API specification

export interface Applicant {
  id: number;
  applicant_id: number;
  recruiter_id: number;
  details: {
    age: number;
    gender: string;
    education_qualification: string;
    home_location: string;
    is_currently_employed: boolean;
    experience: number;
    industry: string;
    work_location: string | null;
    last_drawn_salary: number | null;
    willing_to_relocate: boolean;
    expected_salary: number;
  };
  status: string;
  created_at: string;
  updated_at: string;
  response: string;
  tags: string[];
}

export interface JobList {
  id: number;
  recruiter_id: number;
  list_name: string;
  list_description: string;
  applicants: number[];
  created_at: string;
  updated_at: string | null;
  updated_by: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface Conversation {
  sender_id: number;
  role: 'APPLICANT' | 'RECRUITER';
  ts: string;
  content: string;
  mid: string;
  msg_type: string;
}

export interface ConversationData {
  id: number;
  applicant_id: number;
  recruiter_id: number;
  conversations: Conversation[];
  annotations: any;
  created_at: string;
  updated_at: string;
}

export interface ListActionResponse {
  status: 'NO_CHANGE' | 'COMPLETED' | 'FAILED';
  applicants: number[];
}

export interface SendActionResponse {
  action_id: string;
  status: string;
  status_url: string;
}

export interface APIResponse<T> {
  data: T[];
  mid: string;
  ts: string | number;
}

// Legacy types for backward compatibility
export interface LegacyApplicant {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastMessageTime: string;
  location: string;
  pincode: string;
  experience: number;
  hasTwoWheeler: boolean;
  status: 'active' | 'disabled';
  tags: string[];
  lists: string[];
  hasCompletedConversation: boolean;
  createdAt?: string;
}

export interface LegacyJobList {
  id: string;
  listName: string;
  description?: string;
  creationDate: string;
  candidateCount: number;
  completedConversations: number;
  applicants?: LegacyApplicant[];
  status?: string;
  createdAt?: string;
  originalApplicantIds?: number[]; // Store original backend applicant IDs for debugging
}

export interface CandidateFilters {
  location: string[];
  pincodeRange: { min: number; max: number };
  experienceRange: { min: number; max: number };
  hasTwoWheeler: 'all' | 'yes' | 'no';
}

export interface ListFilters {
  location: string[];
  jobMandate: string[];
  ageRange: string[];
  sector: string[];
  dateRange: { from: string; to: string };
}