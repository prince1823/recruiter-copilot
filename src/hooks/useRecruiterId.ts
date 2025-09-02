import { useAuth } from '../contexts/AuthContext';

export const useRecruiterId = () => {
  const { recruiter } = useAuth();
  return recruiter?.recruiter_id || '918923325988'; // Fallback to default if not authenticated
};
