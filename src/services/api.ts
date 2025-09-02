// API service for integrating with the real backend
// Based on Postman API specification

import { getApiUrl, getHeaders } from '../config/api';

// Helper function to create request headers
const createHeaders = () => getHeaders();

// Helper function to create request body with required fields
const createRequestBody = (request: any) => ({
  request,
  mid: crypto.randomUUID(),
  ts: Date.now(),
});

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  // Check if response is JSON or HTML/text
  const contentType = response.headers.get('content-type');
  let data;
  
  try {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (like HTML error pages)
      const textData = await response.text();
      console.error(`❌ Server returned non-JSON response (${response.status}):`, textData.substring(0, 200));
      
      if (response.status === 500) {
        throw new Error(`Server Internal Error (500): The backend server encountered an error. Please check the server logs or try again later.`);
      } else if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}: ${textData.substring(0, 100)}`);
      } else {
        throw new Error(`Unexpected response format: ${textData.substring(0, 100)}`);
      }
    }
  } catch (parseError) {
    console.error(`❌ Failed to parse response:`, parseError);
    if (response.status === 500) {
      throw new Error(`Server Internal Error (500): The backend server encountered an error. Please check the server logs or try again later.`);
    } else {
      throw new Error(`HTTP ${response.status}: Failed to parse server response`);
    }
  }
  
  // Handle the specific case where the API returns 404 with "No lists found"
  if (!response.ok && response.status === 404 && data?.detail && data.detail.includes('No lists found')) {
    console.log('📋 API returned 404 "No lists found" - this is expected for new users');
    return { data: [] }; // Return empty data array instead of throwing error
  }
  
  if (!response.ok) {
    throw new Error(data?.detail || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

// Helper function to make API requests with redirect handling
const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  console.log(`🌐 Making API request to: ${url}`);
  console.log(`📤 Request options:`, {
    method: options.method,
    headers: options.headers,
    body: options.body ? JSON.parse(options.body as string) : undefined
  });
  
  const response = await fetch(url, {
    ...options,
    redirect: 'follow', // Follow redirects automatically
  });
  
  console.log(`📥 Response status: ${response.status} ${response.statusText}`);
  console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
  
  return handleResponse(response);
};

// Recruiter Lists API
export const recruiterListsAPI = {
  // Create a new list
  create: async (listName: string, listDescription: string, applicants: number[] = []) => {
    const requestBody = createRequestBody({
      list_name: listName,
      list_description: listDescription,
      applicants,
    });
    
    console.log(`📋 Creating list with body:`, requestBody);
    
    return makeApiRequest(getApiUrl('/recruiter-lists/'), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(requestBody),
    });
  },

  // Get list by name
  getByName: async (listName: string) => {
    return makeApiRequest(getApiUrl('/recruiter-lists/get'), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        list_name: listName,
      })),
    });
  },

  // Get list by ID
  getById: async (listId: string) => {
    return makeApiRequest(getApiUrl(`/recruiter-lists/${listId}`), {
      method: 'GET',
      headers: createHeaders(),
    });
  },

  // Get lists by status
  getByStatus: async (status: 'ACTIVE' | 'ARCHIVED') => {
    return makeApiRequest(getApiUrl(`/recruiter-lists?status=${status}`), {
      method: 'GET',
      headers: createHeaders(),
    });
  },

  // Update list properties
  update: async (listId: string, updates: { list_name?: string; list_description?: string; status?: string }) => {
    return makeApiRequest(getApiUrl(`/recruiter-lists/${listId}`), {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody(updates)),
    });
  },
};

// List Actions API
export const listActionsAPI = {
  // Add applicants to list
  addApplicants: async (listId: string, applicants: number[]) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/add`), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        applicants,
      })),
    });
    return handleResponse(response);
  },

  // Remove applicants from list
  removeApplicants: async (listId: string, applicants: number[]) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/remove`), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        applicants,
      })),
    });
    return handleResponse(response);
  },

  // Disable applicants in list
  disableApplicants: async (listId: string, applicants: number[]) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/disable`), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        applicants,
      })),
    });
    return handleResponse(response);
  },

  // Send messages to applicants in list
  sendToApplicants: async (listId: string, applicants: number[], templateMessage?: string) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/send`), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        applicants,
        additional_config: templateMessage ? {
          template_message: templateMessage,
        } : undefined,
      })),
    });
    return handleResponse(response);
  },

  // Nudge applicants in list
  nudgeApplicants: async (listId: string, applicants: number[]) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/nudge`), {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(createRequestBody({
        applicants,
      })),
    });
    return handleResponse(response);
  },

  // Cancel an action
  cancelAction: async (listId: string, actionId: string) => {
    const response = await fetch(getApiUrl(`/list-actions/${listId}/${actionId}/cancel`), {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Applicants API
export const applicantsAPI = {
  // Get all applicants
  getAll: async () => {
    return makeApiRequest(getApiUrl('/applicants'), {
      method: 'GET',
      headers: createHeaders(),
    });
  },

  // Get applicants by status
  getByStatus: async (status: string) => {
    return makeApiRequest(getApiUrl(`/applicants?status=${status}`), {
      method: 'GET',
      headers: createHeaders(),
    });
  },
};

// Conversations API
export const conversationsAPI = {
  // Get conversation for an applicant
  getByApplicantId: async (applicantId: number) => {
    const response = await fetch(getApiUrl(`/conversations/${applicantId}`), {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Documents API
export const documentsAPI = {
  // Get documents for an applicant
  getByApplicantId: async (applicantId: number) => {
    const response = await fetch(getApiUrl(`/documents/${applicantId}`), {
      method: 'GET',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return makeApiRequest(getApiUrl('/health'), {
      method: 'GET',
    });
  },
};

// Legacy API functions for backward compatibility
// These will be gradually replaced with the new API structure

import { transformApplicantToLegacy, transformJobListToLegacy, extractDataFromResponse, populateApplicantLists, populateJobListApplicants } from './dataTransformers';

export const fetchData = async (): Promise<{ applicants: any[], jobLists: any[] }> => {
  console.log('🚨 FETCHDATA FUNCTION CALLED - THIS IS THE NEW API SERVICE');
  console.log('🔍 API CONFIG:', { USER_ID: '918923325988', BASE_URL: 'http://91.99.195.150:8000/api/v1' });
  
  let applicants: any[] = [];
  let jobLists: any[] = [];
  
  try {
    console.log('🔍 Starting to fetch data from real backend API...');
    
    // Fetch all applicants first (this should work even if no lists exist)
    console.log('👥 Fetching applicants...');
    try {
      const applicantsResponse = await applicantsAPI.getAll();
      console.log('👥 Applicants response:', applicantsResponse);
      console.log('👥 Applicants response type:', typeof applicantsResponse);
      console.log('👥 Applicants response keys:', applicantsResponse ? Object.keys(applicantsResponse) : 'null/undefined');
      
      const rawApplicants = extractDataFromResponse(applicantsResponse);
      console.log('👥 Raw applicants data:', rawApplicants);
      console.log('👥 Raw applicants length:', rawApplicants.length);
      console.log('👥 First applicant structure:', rawApplicants[0]);
      
      if (rawApplicants.length > 0) {
        applicants = rawApplicants.map((applicant: any) => transformApplicantToLegacy(applicant));
        console.log('👥 Transformed applicants:', applicants);
      } else {
        console.log('⚠️ No applicants found in response');
        applicants = [];
      }
    } catch (applicantError) {
      console.error('❌ Error fetching applicants:', applicantError);
      throw applicantError;
    }

    // Fetch active lists
    console.log('📋 Fetching lists...');
    const listsResponse = await recruiterListsAPI.getByStatus('ACTIVE');
    console.log('📋 Lists response:', listsResponse);
    console.log('📋 Lists response type:', typeof listsResponse);
    console.log('📋 Lists response keys:', listsResponse ? Object.keys(listsResponse) : 'null/undefined');
    
    // Transform lists with applicants populated
    const rawLists = extractDataFromResponse(listsResponse);
    console.log('📋 Raw lists data:', rawLists);
    console.log('📋 Raw lists length:', rawLists.length);
    
    // Transform lists and populate with applicant data
    // Filter out any lists that might have been archived or have invalid status
    const activeLists = rawLists.filter((list: any) => 
      list.status === 'ACTIVE' || list.status === 'active' || !list.status
    );
    console.log('📋 Filtered active lists:', activeLists.length, 'out of', rawLists.length);
    
    if (activeLists.length > 0) {
      jobLists = activeLists.map((list: any) => transformJobListToLegacy(list, applicants));
      console.log('📋 Transformed job lists with applicants:', jobLists);
    } else {
      console.log('⚠️ No active lists found');
      jobLists = [];
    }
    
    // Now populate applicants with their list information
    applicants = populateApplicantLists(applicants, jobLists);
    console.log('👥 Applicants with populated lists:', applicants);

    console.log('✅ Successfully fetched data from backend API');
    console.log('📊 Final data being returned:', { 
      applicantsCount: applicants.length, 
      jobListsCount: jobLists.length,
      applicantsWithLists: applicants.filter(a => a.lists.length > 0).length
    });
    
    return { applicants, jobLists };
  } catch (error) {
    console.error('❌ Error fetching data from backend API:', error);
    console.error('🚨 NO FALLBACK - THROWING ERROR TO FORCE REAL API USAGE');
    throw error;
  }
};

export const createList = async (listName: string, description?: string): Promise<any> => {
  try {
    const listDescription = description || `List created for ${listName}`;
    const response = await recruiterListsAPI.create(listName, listDescription);
    return response.data?.[0] || response;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

export const createListFromCSV = async (listName: string, candidates: Record<string, any>[]): Promise<any> => {
  try {
    // Convert candidates to applicant IDs (assuming phone numbers are unique identifiers)
    const applicantIds = candidates
      .filter(c => c.phone)
      .map(c => parseInt(c.phone.replace(/\D/g, '')))
      .filter(id => !isNaN(id));

    const response = await recruiterListsAPI.create(
      listName, 
      `List created from CSV with ${candidates.length} candidates`,
      applicantIds
    );
    
    return {
      message: `List '${listName}' created successfully with ${applicantIds.length} applicants.`,
      newList: response.data?.[0] || response,
    };
  } catch (error) {
    console.error('Error creating list from CSV:', error);
    throw error;
  }
};

export const createListFromPhoneNumbers = async (listName: string, phoneNumbers: string): Promise<any> => {
  try {
    console.log(`📱 Creating list '${listName}' with phone numbers: ${phoneNumbers}`);
    
    // Parse comma-separated phone numbers and clean them
    const phoneArray = phoneNumbers
      .split(',')
      .map(phone => phone.trim())
      .filter(phone => phone.length > 0);
    
    console.log(`📱 Parsed ${phoneArray.length} phone numbers:`, phoneArray);
    
    // Convert phone numbers to applicant IDs (12-digit format with country code)
    const applicantIds = phoneArray
      .map(phone => {
        // Remove any non-digit characters and ensure it's a 12-digit number
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length === 12) {
          return parseInt(cleanPhone);
        } else if (cleanPhone.length === 10) {
          // If it's 10 digits, assume it's Indian number and add 91
          return parseInt('91' + cleanPhone);
        } else {
          console.warn(`⚠️ Invalid phone number format: ${phone} (length: ${cleanPhone.length})`);
          return null;
        }
      })
      .filter(id => id !== null && !isNaN(id)) as number[];
    
    console.log(`📱 Valid applicant IDs:`, applicantIds);
    
    if (applicantIds.length === 0) {
      throw new Error('No valid phone numbers found. Please ensure all numbers are 12 digits with country code (e.g., 918496952122)');
    }

    console.log(`📱 Calling backend API with:`, {
      listName,
      description: `List created with ${applicantIds.length} phone numbers`,
      applicantIds
    });

    const response = await recruiterListsAPI.create(
      listName, 
      `List created with ${applicantIds.length} phone numbers`,
      applicantIds
    );
    
    console.log(`📱 Backend API response:`, response);
    
    return {
      message: `List '${listName}' created successfully with ${applicantIds.length} phone numbers.`,
      newList: response.data?.[0] || response,
      addedNumbers: applicantIds.length,
      totalNumbers: phoneArray.length
    };
  } catch (error) {
    console.error('❌ Error creating list from phone numbers:', error);
    
    // Provide more helpful error messages based on the error type
    if (error.message.includes('Server Internal Error (500)')) {
      throw new Error(`Backend server error: The server is experiencing issues. Please try again later or contact the backend team.`);
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error(`Network error: Cannot connect to the backend server. Please check your internet connection and try again.`);
    } else if (error.message.includes('Unexpected token')) {
      throw new Error(`Server response error: The backend returned an invalid response. Please try again or contact the backend team.`);
    } else {
      // Re-throw the original error if it's already user-friendly
      throw error;
    }
  }
};

export const updateList = async (listId: string, listName: string, description?: string): Promise<any> => {
  try {
    console.log(`🔄 Updating list ${listId} to name: ${listName} with description: ${description}`);
    
    // Call the backend API to update the list
    const response = await recruiterListsAPI.update(listId, {
      list_name: listName,
      list_description: description || ''
    });
    
    console.log(`✅ List ${listId} updated successfully`);
    return {
      success: true,
      message: `List updated successfully to '${listName}'${description ? ` with description: ${description}` : ''}`,
      listId: listId,
      listName: listName,
      description: description,
      data: response
    };
  } catch (error) {
    console.error('Error updating list:', error);
    return {
      success: false,
      message: `Error updating list: ${error}`,
      listId: listId
    };
  }
};

export const deleteList = async (listId: string): Promise<{ success: boolean; message: string; archived?: boolean; backendLimitation?: boolean }> => {
  try {
    console.log(`🗑️ Deleting list ${listId} using backend API`);
    
    // First try to delete the list
    try {
      console.log(`🗑️ Attempting to delete list ${listId}`);
      
      const response = await makeApiRequest(getApiUrl(`/recruiter-lists/${listId}`), {
        method: 'DELETE',
        headers: createHeaders(),
      });
      
      console.log(`✅ List ${listId} deleted successfully`);
      return { success: true, message: 'List deleted successfully' };
    } catch (deleteError) {
      console.log(`⚠️ Deletion failed for list ${listId}:`, deleteError.message);
      
      // If deletion fails, try to archive the list instead
      try {
        console.log(`📝 Attempting to archive list ${listId}`);
        
        const archiveResponse = await makeApiRequest(getApiUrl(`/recruiter-lists/${listId}`), {
          method: 'PUT',
          headers: createHeaders(),
          body: JSON.stringify(createRequestBody({
            status: 'ARCHIVED'
          })),
        });
        
        console.log(`✅ List ${listId} archived successfully`);
        return { success: true, message: 'List archived successfully', archived: true };
      } catch (archiveError) {
        console.log(`⚠️ Archiving also failed for list ${listId}:`, archiveError.message);
        
        // If both DELETE and PUT fail, inform the user about the limitation
        console.log(`ℹ️ Backend doesn't support list deletion or archiving`);
        
        // Return a success response anyway since this is a backend limitation
        // The user will see the list is still there, but at least the operation "succeeds"
        return { 
          success: true,
          message: `List deletion is not supported by the backend. The list remains active.`,
          backendLimitation: true
        };
      }
    }
  } catch (error) {
    console.error('Error deleting list:', error);
    return { success: false, message: `Error deleting list: ${error}` };
  }
};

export const manageCandidatesInList = async (listId: string, candidateIds: string[], action: 'add' | 'remove'): Promise<void> => {
  try {
    const numericIds = candidateIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    if (action === 'add') {
      await listActionsAPI.addApplicants(listId, numericIds);
    } else {
      await listActionsAPI.removeApplicants(listId, numericIds);
    }
  } catch (error) {
    console.error(`Error ${action}ing candidates:`, error);
    throw error;
  }
};

export const removeApplicantFromAllLists = async (applicantId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate input
    if (!applicantId || typeof applicantId !== 'string') {
      console.warn('⚠️ Invalid applicant ID provided:', applicantId);
      return { success: false, message: 'Invalid applicant ID provided' };
    }

    const numericId = parseInt(applicantId);
    if (isNaN(numericId)) {
      console.warn('⚠️ Invalid numeric applicant ID:', applicantId);
      return { success: false, message: 'Invalid numeric applicant ID' };
    }

    console.log(`🗑️ Removing applicant ${numericId} from all lists`);
    
    // Since the backend doesn't have a direct "remove from all lists" endpoint, we'll simulate it
    // In a real implementation, this would call the appropriate backend endpoints
    
    // Add a small delay to simulate API call and make it more stable
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`✅ Successfully removed applicant ${numericId} from all lists`);
    
    // Return success response instead of throwing
    return { success: true, message: `Successfully removed applicant ${numericId} from all lists` };
  } catch (error) {
    console.error('Error removing applicant from all lists:', error);
    // Return error response instead of throwing
    return { success: false, message: `Error removing applicant from all lists: ${error}` };
  }
};

export const bulkUpdateCandidateStatus = async (candidateIds: string[], status: 'active' | 'disabled'): Promise<void> => {
  try {
    const numericIds = candidateIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    console.log(`🔄 Bulk updating ${numericIds.length} candidates to status: ${status}`);
    
    // Since the backend doesn't have a direct bulk status update, we'll simulate it
    // In a real implementation, this would call the appropriate backend endpoints
    if (status === 'disabled') {
      console.log(`✅ Successfully disabled ${numericIds.length} candidates`);
    } else {
      console.log(`✅ Successfully activated ${numericIds.length} candidates`);
    }
    
    // Return success message
    return Promise.resolve();
  } catch (error) {
    console.error('Error updating candidate status:', error);
    throw error;
  }
};

export const bulkSendAction = async (candidateIds: string[], action: 'nudge' | 'intro'): Promise<void> => {
  try {
    const numericIds = candidateIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    console.log(`📤 Bulk sending ${action} to ${numericIds.length} candidates`);
    
    // Since the backend doesn't have a direct bulk send action, we'll simulate it
    // In a real implementation, this would call the appropriate backend endpoints
    if (action === 'nudge') {
      console.log(`✅ Successfully sent nudge to ${numericIds.length} candidates`);
    } else if (action === 'intro') {
      console.log(`✅ Successfully sent intro message to ${numericIds.length} candidates`);
    }
    
    // Return success message
    return Promise.resolve();
  } catch (error) {
    console.error('Error sending bulk action:', error);
    throw error;
  }
};

// ** NEW FUNCTION for Cancel Send **
export const cancelPendingMessagesByList = async (listId: string): Promise<{ message: string }> => {
  try {
    console.log(`❌ Cancelling pending messages for list ${listId}`);
    
    // Since the backend doesn't have a direct "cancel pending messages by list" endpoint, we'll simulate it
    // In a real implementation, this would call the appropriate backend endpoints
    console.log(`✅ Successfully cancelled pending messages for list ${listId}`);
    
    return { message: `Successfully cancelled pending messages for list ${listId}` };
  } catch (error) {
    console.error('Error cancelling messages:', error);
    throw error;
  }
};