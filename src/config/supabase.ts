// Demo mode - no Supabase client needed
export const supabase = null;

// Define the recruiter interface
export interface Recruiter {
  id: string;
  email: string;
  name: string;
  contact_no: string;
  recruiter_id: string;
  created_at: string;
}

// Define the allowed recruiters
export const ALLOWED_RECRUITERS = [
  {
    email: 'pratibha.s@qmail.quesscorp.com',
    name: 'Pratibha S',
    contact_no: '+91 78925 11187',
    recruiter_id: '918923325988'
  },
  {
    email: 'soniya.m@quesscorp.com',
    name: 'Soniya M',
    contact_no: '+91 78297 86993',
    recruiter_id: '918923325989'
  },
  {
    email: 'rakesh.kb@quesscorp.com',
    name: 'Rakesh',
    contact_no: '+91 87627 50612',
    recruiter_id: '918923325990'
  },
  {
    email: 'shivnarayan.mewada@qmail.quesscorp.com',
    name: 'Shivnarayan Mewada',
    contact_no: '+91 93984 04151',
    recruiter_id: '918923325991'
  }
];
