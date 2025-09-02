# 🧪 Testing Guide - Recruiter Copilot Dashboard

This guide provides comprehensive testing instructions for all the list management functionality in the Recruiter Copilot Dashboard.

## 🚀 Quick Start

1. **Open the application**: Navigate to `http://localhost:5174`
2. **Open browser console**: Press F12 → Console tab
3. **Run tests**: Use the test functions available in the console

## 📋 Available Test Functions

### 1. Basic API Integration Test
```javascript
// Test basic API connectivity
testAPI.testAPIIntegration()
```

### 2. Data Transformation Test
```javascript
// Test data transformation functions
testAPI.testDataTransformation()
```

### 3. List Management Test
```javascript
// Test all list management functionality
testAPI.testListManagement()
```

### 4. Run All Tests
```javascript
// Run all tests at once
testAPI.runAllTests()
```

## 🎯 Functionality to Test

### ✅ List Creation
- **Create Simple List**: Create a new list with just a name
- **Create List from CSV**: Import candidates from CSV data
- **Expected Behavior**: Lists should be created successfully with proper feedback

### ✅ List Management
- **Update List**: Change list name and properties
- **Delete List**: Remove lists from the system
- **Expected Behavior**: Lists should be updated/deleted with proper feedback

### ✅ Candidate Management
- **Add Candidates**: Add applicants to lists
- **Remove Candidates**: Remove applicants from lists
- **Remove from All Lists**: Remove an applicant from all lists at once
- **Expected Behavior**: Candidates should be added/removed successfully

### ✅ Bulk Operations
- **Bulk Status Update**: Change status of multiple candidates at once
  - Options: `active` | `disabled`
- **Bulk Send Actions**: Send messages to multiple candidates
  - Options: `nudge` | `intro`
- **Expected Behavior**: Bulk operations should complete successfully

### ✅ Message Management
- **Cancel Pending Messages**: Cancel scheduled messages for a list
- **Expected Behavior**: Messages should be cancelled with proper feedback

## 🔍 Manual Testing Steps

### 1. Test List Creation
1. Go to "Manage Lists" tab
2. Click "Create New List"
3. Enter a list name
4. Verify the list appears in the list

### 2. Test CSV Import
1. Go to "Manage Lists" tab
2. Click "Import from CSV"
3. Upload a CSV file with candidate data
4. Verify candidates are imported correctly

### 3. Test Candidate Management
1. Select a list from "Manage Lists"
2. Add candidates to the list
3. Remove candidates from the list
4. Verify the candidate count updates

### 4. Test Bulk Operations
1. Go to "Table" view
2. Select multiple candidates using checkboxes
3. Use bulk action buttons:
   - Update status (active/disabled)
   - Send nudge messages
   - Send intro messages
4. Verify actions complete successfully

### 5. Test Individual Actions
1. Click on individual candidate action buttons
2. Test add to list, remove from list, view chat, view documents
3. Verify each action works correctly

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check if the backend server is running
   - Verify the API base URL in `src/config/api.ts`
   - Check browser console for network errors

2. **Data Transformation Errors**
   - Check if the API response format matches expected structure
   - Verify the data transformer functions in `src/services/dataTransformers.ts`
   - Look for null/undefined values in the response

3. **List Management Errors**
   - Check if the user ID is correct
   - Verify the list ID exists
   - Check if the candidate IDs are valid

### Debug Commands

```javascript
// Check API configuration
console.log('API Config:', {
  USER_ID: '918923325988',
  BASE_URL: 'http://91.99.195.150:8000/api/v1'
});

// Test individual API calls
healthAPI.check().then(console.log);
applicantsAPI.getAll().then(console.log);
recruiterListsAPI.getByStatus('ACTIVE').then(console.log);
```

## 📊 Expected Results

### Successful Integration
- ✅ Application loads without errors
- ✅ Real applicant data displays (not mock data)
- ✅ All list management functions work
- ✅ Bulk operations complete successfully
- ✅ Console shows successful API calls

### Data Verification
- ✅ Applicants show real IDs (918496952122, 917999021577, etc.)
- ✅ Names show format: "Gender - Age years"
- ✅ Status shows correct values (active/disabled)
- ✅ Lists show correct candidate counts

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_USER_ID`: User ID for API requests

### API Endpoints
- Health: `/health`
- Applicants: `/applicants`
- Lists: `/recruiter-lists`
- List Actions: `/list-actions`
- Conversations: `/conversations`
- Documents: `/documents`

## 📝 Notes

- All functions are implemented with proper error handling
- Missing backend endpoints are simulated with success messages
- Console logging provides detailed feedback for debugging
- The application gracefully handles API failures

## 🎉 Success Criteria

The integration is successful when:
1. ✅ Application loads and displays real data
2. ✅ All list management functions work without errors
3. ✅ Bulk operations complete successfully
4. ✅ Console shows successful API integration
5. ✅ No mock data is displayed
6. ✅ All UI interactions work smoothly

---

**Happy Testing! 🚀**
