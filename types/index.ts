export interface Applicant {
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
  lists: string[]; // Array of list IDs this applicant belongs to
  hasCompletedConversation: boolean;
}

export interface JobList {
  id: string;
  listName: string;
  creationDate: string;
  candidateCount: number;
  completedConversations: number;
}

export interface CandidateFilters {
  location: string[];
  pincodeRange: { min: number; max: number };
  experienceRange: { min: number; max: number };
  hasTwoWheeler: 'all' | 'yes' | 'no';
}

export interface ListFilters {
  selectedLists: string[];
}