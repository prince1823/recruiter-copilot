import { useAuth } from '../contexts/AuthContext';

export const useRecruiterId = () => {
  const { recruiter } = useAuth();
  return recruiter?.recruiter_id || '919398404151'; // Fallback to default if not authenticated
};
