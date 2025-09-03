// Mock Supabase client for Docker deployment
export const supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
};

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
    recruiter_id: '917892511187'
  },
  {
    email: 'soniya.m@quesscorp.com',
    name: 'Soniya M',
    contact_no: '+91 7829786993',
    recruiter_id: '917829786993'
  },
  {
    email: 'rakesh.kb@quesscorp.com',
    name: 'Rakesh',
    contact_no: '+91 8762750612',
    recruiter_id: '918762750612'
  },
  {
    email: 'shivnarayan.mewada@qmail.quesscorp.com',
    name: 'Shivnarayan Mewada',
    contact_no: '+91 9398404151',
    recruiter_id: '919398404151'
  }
];

