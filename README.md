# Recruiter Copilot Dashboard

A modern React-based dashboard for managing recruiter lists and candidate interactions, integrated with a real backend API.

## Features

- **List Management**: Create, view, and manage recruiter lists
- **Candidate Management**: View and manage candidate information
- **Bulk Actions**: Perform bulk operations on candidates (add/remove from lists, send messages, etc.)
- **Conversation View**: View conversation history with candidates
- **Real-time Integration**: Connected to live backend API

## Backend Integration

This frontend is now integrated with the real backend API provided by the backend team. The integration includes:

### API Endpoints

- **Recruiter Lists**: Create, retrieve, and manage lists
- **List Actions**: Add/remove candidates, send messages, nudge candidates
- **Applicants**: Retrieve candidate information
- **Conversations**: View conversation history
- **Documents**: Access candidate documents
- **Health Check**: API health monitoring

### Data Transformation

The frontend includes a data transformation layer that converts between the backend API format and the legacy frontend format, ensuring backward compatibility.

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recruiter-copilot-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE_URL=http://91.99.195.150:8000/api/v1
REACT_APP_USER_ID=918496952149
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:
```bash
npm run build
```

## API Configuration

The application uses a configuration system that supports different environments:

### Environment Variables

- `REACT_APP_API_BASE_URL`: Base URL for the backend API
- `REACT_APP_USER_ID`: User ID for API authentication

### Environment-Specific Configurations

- **Development**: Uses localhost for API calls
- **Production**: Uses the production API endpoint
- **Test**: Uses localhost for testing

## Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files
│   └── api.ts         # API configuration
├── services/           # API services
│   ├── api.ts         # Main API service
│   └── dataTransformers.ts  # Data transformation utilities
├── types/              # TypeScript type definitions
│   └── index.ts       # API and component types
└── ...
```

## API Integration Details

### New API Structure

The application now uses the real backend API with the following structure:

```typescript
// Recruiter Lists API
recruiterListsAPI.create(listName, description, applicants)
recruiterListsAPI.getByStatus('ACTIVE')
recruiterListsAPI.getById(listId)

// List Actions API
listActionsAPI.addApplicants(listId, applicants)
listActionsAPI.removeApplicants(listId, applicants)
listActionsAPI.sendToApplicants(listId, applicants, message)
listActionsAPI.nudgeApplicants(listId, applicants)

// Applicants API
applicantsAPI.getAll()
applicantsAPI.getByStatus(status)

// Conversations API
conversationsAPI.getByApplicantId(applicantId)
```

### Data Transformation

The application includes data transformers to convert between API formats:

- `transformApplicantToLegacy()`: Converts backend applicant format to legacy frontend format
- `transformJobListToLegacy()`: Converts backend job list format to legacy frontend format
- `extractDataFromResponse()`: Extracts data from API responses

### Legacy Compatibility

The application maintains backward compatibility with the existing frontend components by:

1. Using data transformers to convert API responses
2. Maintaining legacy API function signatures
3. Providing fallback implementations for missing functionality

## Missing Functionality

Some features from the original frontend are not yet implemented in the real backend:

- **Update Lists**: The backend doesn't support updating list names
- **Delete Lists**: The backend doesn't support deleting lists
- **Remove from All Lists**: No direct endpoint for removing candidates from all lists
- **Cancel Pending Messages**: No direct endpoint for canceling messages by list

These features will need to be implemented on the backend or worked around in the frontend.

## Error Handling

The application includes comprehensive error handling:

- Network errors are caught and displayed to users
- API validation errors are handled gracefully
- Fallback data is provided when API calls fail
- Console logging for debugging

## Development Notes

### Adding New API Endpoints

1. Add the endpoint to the appropriate API object in `src/services/api.ts`
2. Add corresponding types in `src/types/index.ts`
3. Update data transformers if needed
4. Test the integration

### Environment Configuration

To add new environment variables:

1. Add them to `src/config/api.ts`
2. Update the `.env` file
3. Update this README

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from the frontend domain
2. **Authentication Errors**: Verify the `X-User-ID` header is being sent correctly
3. **Data Format Issues**: Check that data transformers are working correctly

### Debug Mode

Enable debug logging by setting the environment to development mode.

## Contributing

1. Follow the existing code structure
2. Add proper TypeScript types for new features
3. Update data transformers when adding new API endpoints
4. Test the integration thoroughly
5. Update documentation

## License

[Add your license information here]
