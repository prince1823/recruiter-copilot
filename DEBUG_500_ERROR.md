# 🔧 Debugging 500 Internal Server Error

## 🚨 **Current Issue: 500 Internal Server Error**

When trying to create a new list with phone numbers, the backend is returning a **500 Internal Server Error**, which means there's a problem on the server side.

## 🔍 **Error Details**

```
❌ Failed to load resource: the server responded with a status of 500 (Internal Server Error)
❌ Error creating list from phone numbers: SyntaxError: Unexpected token 'I', "Internal S"... is not valid JSON
```

## 🧪 **Debugging Steps**

### **Step 1: Test Backend API Directly**
```javascript
// Run this in browser console to test the backend API
testAPI.testBackendAPIDirectly()
```

### **Step 2: Check Console Logs**
Look for these logs in the browser console:
```
🌐 Making API request to: http://91.99.195.150:8000/api/v1/recruiter-lists/
📤 Request options: { method: 'POST', headers: {...}, body: {...} }
📥 Response status: 500 Internal Server Error
📥 Response headers: {...}
❌ Server returned non-JSON response (500): <!DOCTYPE html>...
```

### **Step 3: Test Simple List Creation**
Try creating a list without phone numbers first:
1. Go to "Manage Lists" tab
2. Click "Create New List"
3. Enter list name only
4. Click "Simple List" button
5. Click "Create List"

### **Step 4: Test with Minimal Data**
Try creating a list with just one phone number:
1. Use "Phone Numbers" method
2. Enter only: `918496952122`
3. Create the list

## 🔧 **Possible Causes & Solutions**

### **Cause 1: Backend Server Issues**
- **Symptoms**: 500 errors on all requests
- **Solution**: Check backend server status at [http://91.99.195.150:8000/docs](http://91.99.195.150:8000/docs)

### **Cause 2: Invalid Request Format**
- **Symptoms**: 500 errors only on specific requests
- **Solution**: Check the request format being sent

### **Cause 3: Backend Validation Errors**
- **Symptoms**: 500 errors with specific data
- **Solution**: Try different data formats

### **Cause 4: Database/Service Issues**
- **Symptoms**: 500 errors on data operations
- **Solution**: Backend team needs to check server logs

## 📋 **Request Format Being Sent**

The current request format:
```json
{
  "request": {
    "list_name": "Test List",
    "list_description": "List created with 3 phone numbers",
    "applicants": [918496952122, 917999021577, 919876543211]
  },
  "mid": "uuid-here",
  "ts": 1234567890
}
```

## 🧪 **Testing Commands**

### **1. Test Simple List Creation**
```javascript
// Test creating a list without applicants
testAPI.createList('Test Simple List')
```

### **2. Test Phone Number Functionality**
```javascript
// Test with single phone number
testAPI.createListFromPhoneNumbers('Single Test', '918496952122')
```

### **3. Test Backend API Health**
```javascript
// Check if backend is responding
testAPI.testAPIIntegration()
```

## 🚨 **Immediate Actions**

1. **Check Backend Status**: Visit [http://91.99.195.150:8000/docs](http://91.99.195.150:8000/docs)
2. **Try Simple List**: Create a list without phone numbers
3. **Check Console**: Look for detailed error logs
4. **Contact Backend Team**: If 500 errors persist

## 📊 **Expected vs Actual Response**

### **Expected (Success)**:
```json
{
  "data": [
    {
      "id": 1,
      "list_name": "Test List",
      "list_description": "List created with 3 phone numbers",
      "applicants": [918496952122, 917999021577, 919876543211],
      "status": "ACTIVE"
    }
  ]
}
```

### **Actual (500 Error)**:
```html
<!DOCTYPE html>
<html>
<head>
<title>Internal Server Error</title>
</head>
<body>
<h1>Internal Server Error</h1>
<p>The server encountered an internal error...</p>
</body>
</html>
```

## 🔍 **Next Steps**

1. **Run debugging tests** using the console commands above
2. **Check backend server logs** for the actual error
3. **Verify API endpoint** at `/recruiter-lists/`
4. **Test with Postman** to isolate frontend vs backend issues
5. **Contact backend team** with specific error details

---

**The 500 error indicates a backend server issue that needs to be resolved by the backend team.**
