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

// Get allowed recruiters from environment variable (for demo mode only)
const getRecruitersFromEnv = (): Recruiter[] => {
  try {
    const recruitersEnv = import.meta.env.VITE_DEMO_RECRUITERS;
    if (recruitersEnv) {
      return JSON.parse(recruitersEnv);
    }
  } catch (error) {
    console.warn('Failed to parse VITE_DEMO_RECRUITERS from environment');
  }
  
  // Fallback to demo data (should NOT be used in production)
  console.warn('🚨 Using hardcoded demo recruiters. Configure VITE_DEMO_RECRUITERS in production!');
  return [
    {
      id: 'demo-1',
      email: 'demo@example.com',
      name: 'Demo User',
      contact_no: '+1 555-0100',
      recruiter_id: 'demo-user-id',
      created_at: new Date().toISOString()
    }
  ];
};

export const ALLOWED_RECRUITERS = getRecruitersFromEnv();
