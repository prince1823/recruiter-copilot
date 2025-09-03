import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';

export const useRecruiterId = () => {
  const { recruiter } = useAuth();
  return recruiter?.recruiter_id || API_CONFIG.DEFAULT_USER_ID; // Fallback to configured default
};
