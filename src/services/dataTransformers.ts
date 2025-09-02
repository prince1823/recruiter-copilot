// Data transformation utilities to convert between legacy frontend format and new backend API format

import { Applicant, JobList, LegacyApplicant, LegacyJobList } from '../types';

// Transform backend applicant to legacy format for frontend compatibility
export const transformApplicantToLegacy = (applicant: Applicant): LegacyApplicant => {
  // Add null checks and fallbacks for missing data
  const details = applicant.details || {};
  const gender = details.gender || 'Unknown';
  const age = details.age || 'Unknown';
  const homeLocation = details.home_location || 'Unknown';
  const experience = details.experience || 0;
  
  return {
    id: applicant.applicant_id?.toString() || 'unknown',
    name: `${gender} - ${age} years`, // Generate a name-like identifier
    phone: applicant.applicant_id?.toString() || 'unknown', // Use applicant_id as phone for now
    lastMessage: applicant.response || '',
    lastMessageTime: applicant.updated_at ? new Date(applicant.updated_at).toLocaleDateString() : 'Unknown',
    location: homeLocation,
    pincode: '', // Not available in new format
    experience: experience,
    hasTwoWheeler: false, // Not available in new format
    status: applicant.status === 'MANDATE_MATCHING' || applicant.status === 'DETAILS_COMPLETED' || applicant.status === 'INITIATED' ? 'active' : 'disabled',
    tags: applicant.tags || [],
    lists: [], // Will be populated when we fetch lists
    hasCompletedConversation: applicant.status === 'MANDATE_MATCHING' || applicant.status === 'DETAILS_COMPLETED',
    createdAt: applicant.created_at,
  };
};

// Transform backend job list to legacy format for frontend compatibility
export const transformJobListToLegacy = (jobList: JobList, allApplicants: LegacyApplicant[] = []): LegacyJobList => {
  // Find applicants that belong to this list by matching applicant IDs
  const listApplicants = allApplicants.filter(applicant => {
    // Check if this applicant's ID exists in the jobList.applicants array
    return jobList.applicants?.includes(parseInt(applicant.id)) || false;
  });
  
  console.log(`📋 Transforming list ${jobList.list_name}:`, {
    listApplicantIds: jobList.applicants,
    availableApplicantIds: allApplicants.map(a => a.id),
    matchedApplicants: listApplicants.length,
    totalApplicants: allApplicants.length
  });
  
  return {
    id: jobList.id.toString(),
    listName: jobList.list_name,
    description: jobList.list_description,
    creationDate: new Date(jobList.created_at).toISOString().split('T')[0],
    candidateCount: listApplicants.length, // Use actual matched applicants count
    completedConversations: listApplicants.filter(a => a.hasCompletedConversation).length,
    applicants: listApplicants, // Store the actual applicant objects
    status: jobList.status,
    createdAt: jobList.created_at,
    // Store the original applicant IDs for debugging
    originalApplicantIds: jobList.applicants || []
  };
};

// Transform legacy applicant to backend format
export const transformLegacyApplicantToBackend = (applicant: LegacyApplicant): Partial<Applicant> => {
  return {
    applicant_id: parseInt(applicant.id),
    details: {
      age: 25, // Default values since legacy format doesn't have these
      gender: 'Not specified',
      education_qualification: 'Not specified',
      home_location: applicant.location,
      is_currently_employed: false,
      experience: applicant.experience,
      industry: 'Not specified',
      work_location: null,
      last_drawn_salary: null,
      willing_to_relocate: false,
      expected_salary: 0,
    },
    status: applicant.status === 'active' ? 'MANDATE_MATCHING' : 'DISABLED',
    response: applicant.lastMessage,
    tags: applicant.tags,
  };
};

// Transform legacy job list to backend format
export const transformLegacyJobListToBackend = (jobList: LegacyJobList): Partial<JobList> => {
  return {
    list_name: jobList.listName,
    list_description: `List: ${jobList.listName}`,
    applicants: [],
    status: 'ACTIVE',
  };
};

// Transform API response to legacy format
export const transformAPIResponseToLegacy = (apiResponse: any) => {
  const applicants = (apiResponse.applicants?.data || apiResponse.applicants || [])
    .map(transformApplicantToLegacy);
  
  const jobLists = (apiResponse.jobLists?.data || apiResponse.jobLists || [])
    .map((list: any) => transformJobListToLegacy(list, applicants));

  return { applicants, jobLists };
};

// Helper function to extract data from API response
export const extractDataFromResponse = <T>(response: any): T[] => {
  console.log('🔍 extractDataFromResponse called with:', response);
  console.log('🔍 response type:', typeof response);
  console.log('🔍 response keys:', response ? Object.keys(response) : 'null/undefined');
  
  if (response?.data) {
    console.log('🔍 Found response.data:', response.data);
    const result = Array.isArray(response.data) ? response.data : [response.data];
    console.log('🔍 Returning data array:', result);
    return result;
  }
  
  if (Array.isArray(response)) {
    console.log('🔍 Response is already an array:', response);
    return response;
  }
  
  console.log('🔍 No data found, returning empty array');
  return [];
};

// Helper function to create a mock applicant for testing
export const createMockApplicant = (overrides: Partial<LegacyApplicant> = {}): LegacyApplicant => {
  return {
    id: '1',
    name: 'Test Applicant',
    phone: '+91 9876543210',
    lastMessage: 'Hello, I am interested in the position',
    lastMessageTime: new Date().toLocaleDateString(),
    location: 'Test City',
    pincode: '123456',
    experience: 2,
    hasTwoWheeler: true,
    status: 'active',
    tags: ['test'],
    lists: [],
    hasCompletedConversation: false,
    createdAt: new Date().toISOString(),
    ...overrides
  };
};

// Helper function to create a mock job list for testing
export const createMockJobList = (overrides: Partial<LegacyJobList> = {}): LegacyJobList => {
  return {
    id: '1',
    listName: 'Test List',
    description: 'A test list for development',
    creationDate: new Date().toISOString().split('T')[0],
    candidateCount: 0,
    completedConversations: 0,
    applicants: [],
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    ...overrides
  };
};

// Helper function to populate applicant lists based on job lists
export const populateApplicantLists = (applicants: LegacyApplicant[], jobLists: LegacyJobList[]): LegacyApplicant[] => {
  return applicants.map(applicant => {
    const lists = jobLists
      .filter(list => list.applicants?.some(app => app.id === applicant.id))
      .map(list => list.id);
    
    return {
      ...applicant,
      lists
    };
  });
};

// Helper function to populate job list applicants based on applicant data
export const populateJobListApplicants = (jobLists: LegacyJobList[], applicants: LegacyApplicant[]): LegacyJobList[] => {
  return jobLists.map(list => {
    // Find applicants that belong to this list based on the backend applicant IDs
    const listApplicants = applicants.filter(applicant => 
      list.applicants?.some(app => app.id === applicant.id)
    );
    
    return {
      ...list,
      applicants: listApplicants,
      candidateCount: listApplicants.length,
      completedConversations: listApplicants.filter(a => a.hasCompletedConversation).length
    };
  });
};
