import { useAuth } from '../contexts/AuthContext';

export const useRecruiterId = () => {
  const { recruiter } = useAuth();
  return recruiter?.recruiter_id || '917892511187'; // Fallback to default if not authenticated
};
