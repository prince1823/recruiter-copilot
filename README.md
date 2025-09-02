# Recruiter Copilot Dashboard

A modern React-based dashboard for managing recruiter lists and candidate interactions, integrated with a real backend API.

## 🔗 Live Demo

👉 [recruiter-copilot-tekp.vercel.app](https://recruiter-copilot-tekp.vercel.app/)

## ✨ Features

This application is packed with features designed to enhance recruiter productivity:

### 📋 Comprehensive List Management
- **Full CRUD**: Create, Read, Update, and Delete candidate lists
- **Clickable Detail View**: View all candidates in a list via a detailed table
- **Bulk CSV Upload**: Upload a CSV to create and populate a list. Candidates are deduplicated based on phone numbers

### 👤 Advanced Candidate Actions
- **Multi-Select & Bulk Actions**: Select multiple candidates to perform actions like disable, nudge, or modify lists
- **Enable/Disable Toggle**: One-click toggle for switching a candidate's active status
- **Tagging & Removal**: Easily add or remove candidates from one or more lists

### 🔄 Automated Communication Workflow
- **Message Queue**: Backend queue handles all scheduled and bulk messages
- **Auto Processing**: Server polls every 15 seconds to send pending messages like nudges
- **Personalized Templates**: Uses pre-set templates to send individualized messages
- **Cancel Pending Sends**: Instantly cancel all unsent messages for any candidate list

### 🎯 Real-time Integration
- **Live Backend API**: Connected to production backend API
- **Real-time Data**: Live candidate and list data
- **Bulk Operations**: Working bulk actions for nudge, disable, and list management

## 🚀 Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)

### Backend Integration
- **API Base URL:** http://91.99.195.150:8000/api/v1
- **Authentication:** X-User-ID header based
- **Real-time Data:** Live candidate and list management

## 📦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/prince1823/recruiter-copilot.git
cd recruiter-copilot
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://91.99.195.150:8000/api/v1
VITE_USER_ID=918923325988
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
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

## 🔧 Backend Integration

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

## 🏗️ Project Structure

```
src/
├── components/          # React components
├── config/             # Configuration files
│   ├── api.ts         # API configuration
│   └── supabase.ts    # Supabase configuration
├── services/           # API services
│   ├── api.ts         # Main API service
│   ├── dataTransformers.ts  # Data transformation utilities
│   └── deletedItemsManager.ts  # Local storage management
├── types/              # TypeScript type definitions
│   └── index.ts       # API and component types
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
└── hooks/              # Custom React hooks
    └── useRecruiterId.ts # Recruiter ID hook
```

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. **Vercel Configuration**: `vercel.json` file included
2. **Environment Variables**: Set in Vercel dashboard
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

## 🔍 API Integration Details

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

## 🔐 Authentication

The application includes a complete authentication system:

- **Supabase Integration**: User authentication and management
- **Protected Routes**: Secure access to application features
- **User Context**: Global authentication state management
- **Demo Mode**: Available for testing without full Supabase setup

## 🛠️ Development Notes

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

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend allows requests from the frontend domain
2. **Authentication Errors**: Verify the `X-User-ID` header is being sent correctly
3. **Data Format Issues**: Check that data transformers are working correctly

### Debug Mode

Enable debug logging by setting the environment to development mode.

## 📝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types for new features
3. Update data transformers when adding new API endpoints
4. Test the integration thoroughly
5. Update documentation

## 📄 License

[Add your license information here]
