# Configuration Guide

This guide explains how to configure the Recruiter Copilot Dashboard for different environments.

## Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```env
# Backend API Base URL
REACT_APP_API_BASE_URL=http://91.99.195.150:8000/api/v1

# User ID for API authentication
REACT_APP_USER_ID=918496952149

# Environment (development, production, test)
NODE_ENV=development
```

## Configuration Options

### API Base URL

The `REACT_APP_API_BASE_URL` should point to your backend API server:

- **Production**: `http://91.99.195.150:8000/api/v1`
- **Development**: `http://localhost:8000/api/v1` (if running locally)
- **Staging**: `http://staging-server:8000/api/v1`

### User ID

The `REACT_APP_USER_ID` is used for API authentication. This should be a valid user ID that has access to the backend API.

### Environment

The `NODE_ENV` variable determines which configuration is used:

- **development**: Uses development settings with debug logging
- **production**: Uses production settings with error-only logging
- **test**: Uses test settings for automated testing

## Environment-Specific Configurations

The application automatically uses different configurations based on the environment:

### Development Environment

```typescript
{
  API_BASE_URL: 'http://localhost:8000/api/v1',
  LOG_LEVEL: 'debug'
}
```

### Production Environment

```typescript
{
  API_BASE_URL: 'http://91.99.195.150:8000/api/v1',
  LOG_LEVEL: 'error'
}
```

### Test Environment

```typescript
{
  API_BASE_URL: 'http://localhost:8000/api/v1',
  LOG_LEVEL: 'debug'
}
```

## Testing the Configuration

After setting up your environment variables, you can test the configuration by:

1. Starting the development server: `npm run dev`
2. Opening the browser console
3. Running: `window.testAPI.runAllTests()`

This will test the API connectivity and data transformation.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from the frontend domain
2. **Authentication Errors**: Verify the `REACT_APP_USER_ID` is correct
3. **Connection Errors**: Check that the `REACT_APP_API_BASE_URL` is accessible

### Debug Mode

To enable debug mode, set `NODE_ENV=development` in your `.env` file. This will:

- Show detailed console logs
- Use development API endpoints
- Enable additional error information

### Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use the production API URL
3. Ensure all environment variables are set correctly
4. Build the application: `npm run build`

## Security Notes

- Never commit your `.env` file to version control
- Use different user IDs for different environments
- Ensure your API endpoints are properly secured
- Consider using environment-specific API keys if available
