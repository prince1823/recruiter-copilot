// API Integration Test
// This file contains simple tests to verify the API integration is working

import { healthAPI, recruiterListsAPI, applicantsAPI, createList, createListFromCSV, createListFromPhoneNumbers, updateList, deleteList, manageCandidatesInList, removeApplicantFromAllLists, bulkUpdateCandidateStatus, bulkSendAction, cancelPendingMessagesByList } from './api';

export const testAPIIntegration = async () => {
  console.log('🧪 Testing API Integration...');
  
  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await healthAPI.check();
    console.log('✅ Health check passed:', healthResponse);
    
    // Test 2: Get Applicants
    console.log('2. Testing get applicants...');
    const applicantsResponse = await applicantsAPI.getAll();
    console.log('✅ Get applicants passed:', applicantsResponse);
    
    // Test 3: Get Active Lists
    console.log('3. Testing get active lists...');
    const listsResponse = await recruiterListsAPI.getByStatus('ACTIVE');
    console.log('✅ Get active lists passed:', listsResponse);
    
    console.log('🎉 All API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Function to test data transformation
export const testDataTransformation = () => {
  console.log('🧪 Testing Data Transformation...');
  
  try {
    // Import the transformers
    const { transformApplicantToLegacy, transformJobListToLegacy } = require('./dataTransformers');
    
    // Test applicant transformation
    const mockApplicant = {
      id: 1,
      applicant_id: 917999021577,
      recruiter_id: 918496952149,
      details: {
        age: 21,
        gender: 'Male',
        education_qualification: 'Diploma',
        home_location: 'Bangalore',
        is_currently_employed: false,
        experience: 0,
        industry: 'Fresher',
        work_location: null,
        last_drawn_salary: null,
        willing_to_relocate: false,
        expected_salary: 12000
      },
      status: 'MANDATE_MATCHING',
      created_at: '2025-08-26T07:37:20.266994',
      updated_at: '2025-08-26T07:49:36.149647',
      response: 'Hello, I am interested in the position',
      tags: []
    };
    
    const transformedApplicant = transformApplicantToLegacy(mockApplicant);
    console.log('✅ Applicant transformation passed:', transformedApplicant);
    
    // Test job list transformation
    const mockJobList = {
      id: 1,
      recruiter_id: 918496952149,
      list_name: 'Mumbai Drive 2025',
      list_description: 'List of senior software engineering candidates',
      applicants: [917999021577],
      created_at: '2025-08-28T11:27:11.212427',
      updated_at: null,
      updated_by: '918496952149',
      status: 'ACTIVE'
    };
    
    const transformedJobList = transformJobListToLegacy(mockJobList);
    console.log('✅ Job list transformation passed:', transformedJobList);
    
    console.log('🎉 All data transformation tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Data transformation test failed:', error);
    return false;
  }
};

// Function to run all tests
export const runAllTests = async () => {
  console.log('🚀 Starting API Integration Tests...\n');
  
  const apiTestResult = await testAPIIntegration();
  console.log('\n');
  
  const transformationTestResult = testDataTransformation();
  console.log('\n');
  
  if (apiTestResult && transformationTestResult) {
    console.log('🎉 All tests passed! The API integration is working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
  }
  
  return apiTestResult && transformationTestResult;
};

// Test all list management functionality
export const testListManagement = async () => {
  console.log('🧪 Testing list management functionality...');
  
  try {
    // Test 1: Create a new list
    console.log('📋 Test 1: Creating a new list...');
    const createResult = await createList('Test List for Management');
    console.log('✅ List creation result:', createResult);
    
    // Test 2: Create list from phone numbers
    console.log('📋 Test 2: Creating list from phone numbers...');
    const phoneNumbers = '918496952122, 917999021577, 919876543211';
    const phoneResult = await createListFromPhoneNumbers('Phone Numbers Test List', phoneNumbers);
    console.log('✅ Phone numbers list creation result:', phoneResult);
    
    // Test 3: Create list from CSV
    console.log('📋 Test 3: Creating list from CSV...');
    const csvCandidates = [
      { name: 'John Doe', phone: '918496952122', location: 'Mumbai' },
      { name: 'Jane Smith', phone: '917999021577', location: 'Delhi' }
    ];
    const csvResult = await createListFromCSV('CSV Test List', csvCandidates);
    console.log('✅ CSV list creation result:', csvResult);
    
    // Test 4: Update list
    console.log('📋 Test 4: Updating list...');
    const updateResult = await updateList('1', 'Updated Test List');
    console.log('✅ List update result:', updateResult);
    
    // Test 5: Delete list
    console.log('📋 Test 5: Deleting list...');
    await deleteList('1');
    console.log('✅ List deletion completed');
    
    // Test 6: Manage candidates in list
    console.log('📋 Test 6: Managing candidates in list...');
    await manageCandidatesInList('1', ['918496952122', '917999021577'], 'add');
    console.log('✅ Candidate management completed');
    
    // Test 7: Remove applicant from all lists
    console.log('📋 Test 7: Removing applicant from all lists...');
    await removeApplicantFromAllLists('918496952122');
    console.log('✅ Applicant removal completed');
    
    // Test 8: Bulk update candidate status
    console.log('📋 Test 8: Bulk updating candidate status...');
    await bulkUpdateCandidateStatus(['918496952122', '917999021577'], 'disabled');
    console.log('✅ Bulk status update completed');
    
    // Test 9: Bulk send action
    console.log('📋 Test 9: Bulk sending actions...');
    await bulkSendAction(['918496952122', '917999021577'], 'nudge');
    console.log('✅ Bulk send action completed');
    
    // Test 10: Cancel pending messages
    console.log('📋 Test 10: Cancelling pending messages...');
    const cancelResult = await cancelPendingMessagesByList('1');
    console.log('✅ Cancel pending messages result:', cancelResult);
    
    console.log('🎉 All list management tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ List management test failed:', error);
    return false;
  }
};

// Test phone number functionality specifically
export const testPhoneNumberFunctionality = async () => {
  console.log('📱 Testing phone number functionality...');
  
  try {
    // Test 1: Valid 12-digit numbers
    console.log('📱 Test 1: Valid 12-digit numbers...');
    const validNumbers = '918496952122, 917999021577, 919876543211';
    const validResult = await createListFromPhoneNumbers('Valid Numbers Test', validNumbers);
    console.log('✅ Valid numbers result:', validResult);
    
    // Test 2: Mixed format (10-digit and 12-digit)
    console.log('📱 Test 2: Mixed format numbers...');
    const mixedNumbers = '918496952122, 9999999999, 919876543211';
    const mixedResult = await createListFromPhoneNumbers('Mixed Numbers Test', mixedNumbers);
    console.log('✅ Mixed numbers result:', mixedResult);
    
    // Test 3: Invalid numbers
    console.log('📱 Test 3: Invalid numbers...');
    try {
      const invalidNumbers = '123, 456, 789';
      await createListFromPhoneNumbers('Invalid Numbers Test', invalidNumbers);
    } catch (error) {
      console.log('✅ Invalid numbers correctly rejected:', error.message);
    }
    
    console.log('🎉 Phone number functionality tests completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Phone number test failed:', error);
    return false;
  }
};

// Test backend API directly to debug 500 errors
export const testBackendAPIDirectly = async () => {
  console.log('🔧 Testing backend API directly...');
  
  try {
    // Test 1: Simple list creation (no applicants)
    console.log('🔧 Test 1: Creating simple list...');
    const simpleListResult = await createList('Simple Test List');
    console.log('✅ Simple list result:', simpleListResult);
    
    // Test 2: List creation with empty applicants array
    console.log('🔧 Test 2: Creating list with empty applicants...');
    const emptyApplicantsResult = await createListFromPhoneNumbers('Empty Applicants Test', '');
    console.log('✅ Empty applicants result:', emptyApplicantsResult);
    
    // Test 3: List creation with single valid number
    console.log('🔧 Test 3: Creating list with single number...');
    const singleNumberResult = await createListFromPhoneNumbers('Single Number Test', '918496952122');
    console.log('✅ Single number result:', singleNumberResult);
    
    console.log('🎉 Backend API tests completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backend API test failed:', error);
    return false;
  }
};

// Test data transformation with real data
export const testDataTransformationWithRealData = async () => {
  console.log('🧪 Testing data transformation with real API data...');
  
  try {
    // Fetch real data from API
    const applicantsResponse = await applicantsAPI.getAll();
    const rawApplicants = extractDataFromResponse(applicantsResponse);
    
    console.log('📊 Raw applicants from API:', rawApplicants);
    
    // Test transformation for each applicant
    rawApplicants.forEach((applicant, index) => {
      console.log(`\n--- Applicant ${index + 1} ---`);
      console.log('Original status:', applicant.status);
      console.log('Original details:', applicant.details);
      
      const transformed = transformApplicantToLegacy(applicant);
      console.log('Transformed status:', transformed.status);
      console.log('Transformed name:', transformed.name);
      console.log('Has completed conversation:', transformed.hasCompletedConversation);
    });
    
    console.log('✅ Data transformation test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Data transformation test failed:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testAPI = {
    testAPIIntegration,
    testDataTransformation,
    testDataTransformationWithRealData,
    testListManagement,
    testPhoneNumberFunctionality,
    testBackendAPIDirectly,
    runAllTests
  };
  
  // Expose debugging functions
  (window as any).debugData = {
    // Check current data state
    checkCurrentData: () => {
      console.log('🔍 Current Data State:');
      console.log('Applicants:', window.applicants);
      console.log('Job Lists:', window.jobLists);
      console.log('Active View:', window.activeView);
    },
    
    // Check specific list details
    checkListDetails: (listId: string) => {
      const list = window.jobLists?.find(l => l.id === listId);
      if (list) {
        console.log(`📋 List ${listId} details:`, list);
        console.log(`👥 Applicants in this list:`, list.applicants);
      } else {
        console.log(`❌ List ${listId} not found`);
      }
    },
    
    // Refresh data manually
    refreshData: () => {
      console.log('🔄 Manually refreshing data...');
      if (window.refreshData) {
        window.refreshData();
      } else {
        console.log('❌ refreshData function not found');
      }
    }
  };
}
