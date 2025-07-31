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
    lists: string[];
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
      location: string[];
      jobMandate: string[];
      ageRange: string[];
      sector: string[];
      dateRange: { from: string; to: string };
  }