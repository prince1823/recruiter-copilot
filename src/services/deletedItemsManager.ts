// Service to manage deleted items using localStorage for persistence

const DELETED_APPLICANTS_KEY = 'deletedApplicants';
const DELETED_LISTS_KEY = 'deletedLists';

// Applicant deletion management
export const addDeletedApplicant = (applicantId: string): void => {
  try {
    const deletedApplicants = getDeletedApplicants();
    if (!deletedApplicants.includes(applicantId)) {
      deletedApplicants.push(applicantId);
      localStorage.setItem(DELETED_APPLICANTS_KEY, JSON.stringify(deletedApplicants));
      console.log(`🗑️ Added applicant ${applicantId} to deleted list`);
    }
  } catch (error) {
    console.error('Error adding deleted applicant:', error);
  }
};

export const getDeletedApplicants = (): string[] => {
  try {
    const deleted = localStorage.getItem(DELETED_APPLICANTS_KEY);
    return deleted ? JSON.parse(deleted) : [];
  } catch (error) {
    console.error('Error getting deleted applicants:', error);
    return [];
  }
};

export const removeDeletedApplicant = (applicantId: string): void => {
  try {
    const deletedApplicants = getDeletedApplicants();
    const updated = deletedApplicants.filter(id => id !== applicantId);
    localStorage.setItem(DELETED_APPLICANTS_KEY, JSON.stringify(updated));
    console.log(`🔄 Removed applicant ${applicantId} from deleted list`);
  } catch (error) {
    console.error('Error removing deleted applicant:', error);
  }
};

export const clearDeletedApplicants = (): void => {
  try {
    localStorage.removeItem(DELETED_APPLICANTS_KEY);
    console.log('🗑️ Cleared all deleted applicants');
  } catch (error) {
    console.error('Error clearing deleted applicants:', error);
  }
};

// List deletion management
export const addDeletedList = (listId: string): void => {
  try {
    const deletedLists = getDeletedLists();
    if (!deletedLists.includes(listId)) {
      deletedLists.push(listId);
      localStorage.setItem(DELETED_LISTS_KEY, JSON.stringify(deletedLists));
      console.log(`🗑️ Added list ${listId} to deleted list`);
    }
  } catch (error) {
    console.error('Error adding deleted list:', error);
  }
};

export const getDeletedLists = (): string[] => {
  try {
    const deleted = localStorage.getItem(DELETED_LISTS_KEY);
    return deleted ? JSON.parse(deleted) : [];
  } catch (error) {
    console.error('Error getting deleted lists:', error);
    return [];
  }
};

export const removeDeletedList = (listId: string): void => {
  try {
    const deletedLists = getDeletedLists();
    const updated = deletedLists.filter(id => id !== listId);
    localStorage.setItem(DELETED_LISTS_KEY, JSON.stringify(updated));
    console.log(`🔄 Removed list ${listId} from deleted list`);
  } catch (error) {
    console.error('Error removing deleted list:', error);
  }
};

export const clearDeletedLists = (): void => {
  try {
    localStorage.removeItem(DELETED_LISTS_KEY);
    console.log('🗑️ Cleared all deleted lists');
  } catch (error) {
    console.error('Error clearing deleted lists:', error);
  }
};

// Utility functions to filter out deleted items
export const filterDeletedApplicants = <T extends { id: string }>(applicants: T[]): T[] => {
  const deletedIds = getDeletedApplicants();
  return applicants.filter(applicant => !deletedIds.includes(applicant.id));
};

export const filterDeletedLists = <T extends { id: string }>(lists: T[]): T[] => {
  const deletedIds = getDeletedLists();
  return lists.filter(list => !deletedIds.includes(list.id));
};

// Debug functions
export const getDeletedItemsSummary = () => {
  return {
    deletedApplicants: getDeletedApplicants(),
    deletedLists: getDeletedLists(),
    deletedApplicantsCount: getDeletedApplicants().length,
    deletedListsCount: getDeletedLists().length
  };
};

// Clear all deleted items (useful for testing)
export const clearAllDeletedItems = (): void => {
  clearDeletedApplicants();
  clearDeletedLists();
  console.log('🗑️ Cleared all deleted items');
};
