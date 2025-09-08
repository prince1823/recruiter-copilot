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

    }
  } catch (error) {
    // Silently handle error
  }
};

export const getDeletedApplicants = (): string[] => {
  try {
    const deleted = localStorage.getItem(DELETED_APPLICANTS_KEY);
    return deleted ? JSON.parse(deleted) : [];
  } catch (error) {
    return [];
  }
};

export const removeDeletedApplicant = (applicantId: string): void => {
  try {
    const deletedApplicants = getDeletedApplicants();
    const updated = deletedApplicants.filter(id => id !== applicantId);
    localStorage.setItem(DELETED_APPLICANTS_KEY, JSON.stringify(updated));

  } catch (error) {
    // Silently handle error
  }
};

export const clearDeletedApplicants = (): void => {
  try {
    localStorage.removeItem(DELETED_APPLICANTS_KEY);

  } catch (error) {
    // Silently handle error
  }
};

// List deletion management
export const addDeletedList = (listId: string): void => {
  try {
    const deletedLists = getDeletedLists();
    if (!deletedLists.includes(listId)) {
      deletedLists.push(listId);
      localStorage.setItem(DELETED_LISTS_KEY, JSON.stringify(deletedLists));

    }
  } catch (error) {
    // Silently handle error
  }
};

export const getDeletedLists = (): string[] => {
  try {
    const deleted = localStorage.getItem(DELETED_LISTS_KEY);
    return deleted ? JSON.parse(deleted) : [];
  } catch (error) {
    return [];
  }
};

export const removeDeletedList = (listId: string): void => {
  try {
    const deletedLists = getDeletedLists();
    const updated = deletedLists.filter(id => id !== listId);
    localStorage.setItem(DELETED_LISTS_KEY, JSON.stringify(updated));

  } catch (error) {
    // Silently handle error
  }
};

export const clearDeletedLists = (): void => {
  try {
    localStorage.removeItem(DELETED_LISTS_KEY);

  } catch (error) {
    // Silently handle error
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

};
