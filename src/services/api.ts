import { Applicant, JobList } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

export const fetchData = async (): Promise<{ applicants: Applicant[], jobLists: JobList[] }> => {
  const response = await fetch(`${API_BASE_URL}/data`);
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
};

export const createList = async (listName: string): Promise<JobList> => {
  const res = await fetch(`${API_BASE_URL}/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const createListFromCSV = async (listName: string, candidates: Record<string, any>[]): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/lists/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listName, candidates }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};

export const updateList = async (listId: string, listName: string): Promise<JobList> => {
  const res = await fetch(`${API_BASE_URL}/lists/${listId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const deleteList = async (listId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/lists/${listId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
};

export const manageCandidatesInList = async (listId: string, candidateIds: string[], action: 'add' | 'remove'): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/lists/${listId}/candidates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateIds, action }),
  });
  if (!res.ok) throw new Error(await res.text());
};

export const removeApplicantFromAllLists = async (applicantId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/applicants/${applicantId}/lists`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
};

export const bulkUpdateCandidateStatus = async (candidateIds: string[], status: 'active' | 'disabled'): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/applicants/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateIds, status }),
  });
  if (!res.ok) throw new Error(await res.text());
};

export const bulkSendAction = async (candidateIds: string[], action: 'nudge' | 'intro'): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/queue/bulk-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds, action }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    alert(result.message);
};

// ** NEW FUNCTION for Cancel Send **
export const cancelPendingMessagesByList = async (listId: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE_URL}/queue/cancel-by-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};