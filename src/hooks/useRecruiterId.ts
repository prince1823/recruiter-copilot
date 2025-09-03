import { getStoredUserId } from '../lib/auth-utils';

export const useRecruiterId = () => {
  return getStoredUserId() || '';
};