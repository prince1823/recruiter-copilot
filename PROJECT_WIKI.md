# Recruiter Copilot Dashboard - Project Documentation

## Overview

The Recruiter Copilot Dashboard is a modern React-based recruitment management system designed for WhatsApp-based candidate interactions. It provides a comprehensive interface for managing applicants, job lists, and conversations with candidates.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Data Flow Architecture](#data-flow-architecture)
4. [Component Hierarchy](#component-hierarchy)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Authentication & Security](#authentication--security)
8. [Styling & UI](#styling--ui)
9. [Key Features](#key-features)
10. [File-by-File Analysis](#file-by-file-analysis)
11. [Refactoring Opportunities](#refactoring-opportunities)

---

## Project Structure

```
recruiter-copilot/
├── components/                    # Reusable UI components
│   ├── ui/                       # Shadcn/ui components (36 files)
│   ├── figma/                    # Figma-specific components
│   ├── ActionButtons.tsx         # Candidate action buttons
│   ├── BulkActionButtons.tsx     # Bulk operations
│   ├── CandidateFilter.tsx       # Filtering components
│   ├── ChatDetail.tsx            # Chat conversation details
│   ├── ChatView.tsx              # Main chat interface
│   ├── ListDetailView.tsx        # Job list detail view
│   ├── ListView.tsx              # Table view for applicants
│   ├── ManageListsView.tsx       # List management interface
│   ├── Navbar.tsx                # Top navigation
│   ├── ProtectedRoute.tsx        # Authentication wrapper
│   └── SignIn.tsx                # Authentication component
├── src/
│   ├── config/
│   │   ├── api.ts               # API configuration
│   │   └── supabase.ts          # Mock Supabase setup
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── hooks/
│   │   └── useRecruiterId.ts    # Custom hook for recruiter ID
│   ├── services/
│   │   ├── api.ts               # API service layer (810 lines)
│   │   ├── dataTransformers.ts  # Data transformation utilities
│   │   └── deletedItemsManager.ts # Local storage management
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── styles/
│   └── globals.css              # Global styles and CSS variables
├── App.tsx                      # Main application component
├── main.tsx                     # Application entry point
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── vite.config.ts              # Vite build configuration
```

---

## Technology Stack

### Frontend Framework
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Type safety and developer experience
- **Vite 6.3.5** - Fast build tool and development server

### UI Framework
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **Lucide React** - Modern icon library (487 icons)

### Key Dependencies
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional CSS classes
- **papaparse** - CSV parsing for bulk imports

### Development Tools
- **ESLint 9.34.0** - Code linting with latest configuration
- **TypeScript ESLint** - TypeScript-specific linting rules

---

## Data Flow Architecture

### 1. Application Entry Point
```
main.tsx
├── AuthProvider (Context)
└── App.tsx (Main Component)
```

### 2. Data Sources
- **External API**: `http://91.99.195.150:8000/api/v1`
- **Local Storage**: Deleted items persistence
- **Mock Data**: Demo authentication system

### 3. Data Flow Pattern
```
External API → API Service Layer → Data Transformers → React State → UI Components
```

### 4. State Management Layers
- **Global Auth State**: AuthContext (user, recruiter, session)
- **Application State**: App.tsx (applicants, jobLists, loading, error)
- **Component State**: Local state for UI interactions
- **Persistent State**: localStorage for deleted items

---

## Component Hierarchy

### Main Application Structure
```
App.tsx
├── ProtectedRoute
├── Navbar
├── Header (Tabs: Chats, Table, Manage Lists)
└── Main Content
    ├── ChatView (WhatsApp-like interface)
    ├── ListView (Data table with filters)
    ├── ManageListsView (List management)
    └── ListDetailView (Individual list details)
```

### Shared Components
- **ActionButtons**: Individual candidate actions (toggle status, nudge, tag, remove)
- **BulkActionButtons**: Batch operations on multiple candidates
- **UI Components**: 36 reusable Shadcn/ui components

### Component Communication
- **Props down**: Data flows from App.tsx to child components
- **Callbacks up**: Actions flow back via callback props
- **Context**: Authentication data available globally

---

## API Integration

### Backend Configuration
- **Base URL**: `http://91.99.195.150:8000/api/v1`
- **Authentication**: Header-based with `X-User-ID`
- **Default User ID**: `918923325988`

### API Endpoints Structure

#### Recruiter Lists API (`src/services/api.ts:82-134`)
```typescript
- POST /recruiter-lists/ - Create new list
- POST /recruiter-lists/get - Get list by name
- GET /recruiter-lists/:id - Get list by ID
- GET /recruiter-lists/?status=ACTIVE - Get lists by status
- PUT /recruiter-lists/:id - Update list properties
```

#### List Actions API (`src/services/api.ts:136-215`)
```typescript
- POST /list-actions/:listId/add - Add applicants to list
- POST /list-actions/:listId/remove - Remove applicants from list
- POST /list-actions/:listId/disable - Disable applicants
- POST /list-actions/:listId/send - Send messages to applicants
- POST /list-actions/:listId/nudge - Nudge applicants
- GET /list-actions/:listId/:actionId/cancel - Cancel action
```

#### Applicants API (`src/services/api.ts:217-234`)
```typescript
- GET /applicants/ - Get all applicants
- GET /applicants/?status=:status - Get by status
```

#### Additional APIs
```typescript
- GET /conversations/:applicantId - Get conversation
- GET /documents/:applicantId - Get documents
- GET /health - Health check
```

### Data Transformation Layer (`src/services/dataTransformers.ts`)

The application uses a sophisticated data transformation layer to convert between the backend API format and the frontend legacy format:

#### Backend → Frontend Transformation
```typescript
transformApplicantToLegacy(applicant: Applicant): LegacyApplicant
transformJobListToLegacy(jobList: JobList, allApplicants): LegacyJobList
```

#### Key Transformations
- **Phone Numbers**: Backend applicant_id → Frontend phone display
- **Status Mapping**: Backend conversation status → Frontend active/disabled
- **Name Generation**: Backend gender + age → Frontend name field
- **List Association**: Backend applicant arrays → Frontend list membership

---

## State Management

### Global Authentication State (`src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  recruiter: Recruiter | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{success: boolean; message: string}>;
  signOut: () => Promise<void>;
}
```

**Current Mode**: Demo mode with predefined recruiters:
- Pratibha S (918923325988)
- Soniya M (918923325989)
- Rakesh (918923325990)
- Shivnarayan Mewada (918923325991)

### Application State (`App.tsx:22-28`)
```typescript
const [activeView, setActiveView] = useState<AppView>({ type: 'chats', listId: null });
const [applicants, setApplicants] = useState<Applicant[]>([]);
const [jobLists, setJobLists] = useState<JobList[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Local Storage Persistence (`src/services/deletedItemsManager.ts`)
- **Deleted Applicants**: `localStorage.deletedApplicants`
- **Deleted Lists**: `localStorage.deletedLists`
- **Filtering**: Items marked as deleted are filtered out during data loading

---

## Authentication & Security

### Current Implementation
- **Demo Mode**: Auto-login with first recruiter
- **Allowed Recruiters**: Hardcoded list of 4 recruiters
- **Session Management**: Mock session tokens
- **Route Protection**: ProtectedRoute wrapper component

### Security Considerations
- Mock authentication (not production-ready)
- API credentials in code
- No token refresh mechanism
- No role-based access control

---

## Styling & UI

### Design System
- **Theme**: WhatsApp-inspired green color scheme
- **CSS Framework**: Tailwind CSS with custom utilities
- **Components**: Shadcn/ui for consistent design
- **Icons**: Lucide React icon library

### Color Palette (`styles/globals.css:51-70`)
```css
--whatsapp-green: #25D366
--whatsapp-green-dark: #1DA851
--whatsapp-green-light: #DCF8C6
--whatsapp-gray: #8696A0
--whatsapp-gray-light: #F0F2F5
--whatsapp-blue: #34B7F1
```

### Responsive Design
- Mobile-first approach with Tailwind breakpoints
- Flexible grid layouts
- Responsive table views with horizontal scrolling

---

## Key Features

### 1. Multi-View Interface
- **Chats View**: WhatsApp-like conversation interface
- **Table View**: Data table with filtering and sorting
- **Manage Lists View**: Job list creation and management

### 2. Candidate Management
- **Bulk Operations**: Select multiple candidates for batch actions
- **Status Management**: Toggle active/disabled status
- **List Association**: Tag candidates to job lists
- **Communication**: Nudge and message sending

### 3. Job List Management
- **Create Lists**: From phone numbers or CSV import
- **List Details**: View and manage list contents
- **Bulk Actions**: Operations on entire lists
- **Status Tracking**: Monitor list and candidate status

### 4. Data Export
- **CSV Export**: Export filtered applicant data
- **Comprehensive Fields**: All applicant details included

### 5. Real-time Updates
- **Auto-refresh**: Data updates after actions
- **Error Handling**: Comprehensive error management
- **Loading States**: Visual feedback during operations

---

## File-by-File Analysis

### Core Application Files

#### `main.tsx` (13 lines)
- **Purpose**: Application entry point
- **Dependencies**: React, ReactDOM, AuthProvider
- **Functionality**: Renders the app with authentication context

#### `App.tsx` (210 lines)
- **Purpose**: Main application component and state management
- **Key Functions**:
  - `refreshData()`: Fetches all data from API
  - `updateApplicants()` & `updateJobLists()`: State updates
  - `handleViewChange()`: Navigation between views
  - `renderContent()`: Conditional view rendering
- **State Management**: Central hub for all application data
- **Data Flow**: Manages data fetching and distribution to child components

### Configuration Files

#### `src/config/api.ts` (66 lines)
- **Purpose**: API configuration and environment management
- **Key Features**:
  - Environment-specific configurations
  - URL builder functions
  - Header management with user ID
  - Request timeout and retry configuration

#### `src/config/supabase.ts` (48 lines)
- **Purpose**: Mock Supabase client and recruiter definitions
- **Key Features**:
  - Mock authentication methods
  - Predefined recruiter list
  - Type definitions for Recruiter interface

### Service Layer

#### `src/services/api.ts` (810 lines) - **LARGEST FILE**
- **Purpose**: Complete API integration layer
- **Structure**:
  - Helper functions (20-80)
  - Individual API modules (80-270)
  - Legacy compatibility functions (270-810)
- **Key Functions**:
  - `fetchData()`: Main data retrieval function
  - CRUD operations for lists and applicants
  - Bulk action handlers
  - Error handling and response transformation
- **Complexity**: High - handles all external communication

#### `src/services/dataTransformers.ts` (223 lines)
- **Purpose**: Data format conversion between API and frontend
- **Key Functions**:
  - `transformApplicantToLegacy()`: Backend → Frontend conversion
  - `transformJobListToLegacy()`: List data transformation
  - `extractDataFromResponse()`: Generic data extraction
  - `populateApplicantLists()`: Cross-reference list membership
- **Complexity**: Medium - critical for data consistency

#### `src/services/deletedItemsManager.ts` (121 lines)
- **Purpose**: Local storage management for deleted items
- **Features**:
  - CRUD operations for deleted applicants and lists
  - Filtering utilities
  - Debug and maintenance functions

### Component Files

#### `components/ChatView.tsx` (203 lines)
- **Purpose**: WhatsApp-like chat interface
- **Features**:
  - Chat list with candidate selection
  - Message display with mock conversations
  - Bulk selection and actions
  - Real-time UI updates
- **UI Pattern**: Master-detail interface

#### `components/ListView.tsx` (372 lines) - **LARGEST COMPONENT**
- **Purpose**: Data table view with advanced filtering
- **Features**:
  - Sortable data table
  - List-based filtering
  - Bulk operations
  - CSV export functionality
  - Delete operations with persistence
- **Complexity**: High - most feature-rich component

#### `components/ManageListsView.tsx` (323 lines)
- **Purpose**: Job list management interface
- **Features**:
  - List creation with phone number validation
  - Card-based list display
  - List operations (view, cancel messages, delete)
  - Form validation and error handling

#### `components/ActionButtons.tsx` (138 lines)
- **Purpose**: Individual candidate action buttons
- **Features**:
  - Status toggle (active/disabled)
  - Communication actions (nudge)
  - List association (tagging)
  - Tooltips and dropdown menus

### Type Definitions

#### `src/types/index.ts` (135 lines)
- **Purpose**: TypeScript type definitions
- **Structure**:
  - Backend API types (Applicant, JobList, Conversation)
  - Legacy frontend types (LegacyApplicant, LegacyJobList)
  - Filter and response types
  - API response interfaces

### Authentication

#### `src/contexts/AuthContext.tsx` (102 lines)
- **Purpose**: Authentication state management
- **Features**:
  - Demo mode authentication
  - Recruiter selection
  - Session management
  - Context provider pattern

---

## Refactoring Opportunities

### 1. **High Priority - Code Organization**

#### Break Down Large Files
- **`src/services/api.ts` (810 lines)**:
  - Split into separate modules: `recruiterListsAPI.ts`, `applicantsAPI.ts`, `conversationsAPI.ts`
  - Extract helper functions to `apiHelpers.ts`
  - Move legacy functions to `legacyAPI.ts`

- **`components/ListView.tsx` (372 lines)**:
  - Extract filtering logic to custom hook `useApplicantFilters.ts`
  - Create separate components: `ApplicantTable.tsx`, `FilterBar.tsx`, `BulkActions.tsx`
  - Move CSV export to utility function

#### Centralize Configuration
- **Environment Variables**: Move hardcoded values to `.env`
- **API Configuration**: Create centralized config object
- **Type Safety**: Add runtime validation for API responses

### 2. **Medium Priority - State Management**

#### Implement Proper State Management
- **Consider Redux Toolkit** or **Zustand** for complex state
- **Create Custom Hooks**:
  - `useApplicants()` - Applicant data management
  - `useJobLists()` - Job list operations
  - `useApiError()` - Error handling

#### Data Fetching Optimization
- **Implement React Query/TanStack Query**:
  - Cache API responses
  - Background refetching
  - Optimistic updates
  - Error retry logic

### 3. **Medium Priority - Performance**

#### Component Optimization
- **Virtualization**: For large lists (1000+ candidates)
- **Memoization**: Use `React.memo` for expensive components
- **Lazy Loading**: Code-split large components
- **Debounced Search**: For real-time filtering

#### Bundle Optimization
- **Code Splitting**: Route-based and component-based
- **Tree Shaking**: Remove unused UI components
- **Asset Optimization**: Compress and optimize images

### 4. **Low Priority - UI/UX Improvements**

#### Enhanced User Experience
- **Loading Skeletons**: Instead of spinner overlays
- **Error Boundaries**: Graceful error handling
- **Offline Support**: Service worker for basic functionality
- **Keyboard Navigation**: Accessibility improvements

#### Design System Improvements
- **Component Library**: Consistent prop interfaces
- **Design Tokens**: Centralized spacing, typography
- **Dark Mode**: Complete dark theme implementation

### 5. **Architecture Recommendations**

#### Folder Structure Reorganization
```
src/
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── applicants/
│   │   ├── lists/
│   │   └── chat/
│   ├── shared/           # Reusable components
│   └── ui/               # Base UI components
├── hooks/                # Custom React hooks
├── services/
│   ├── api/              # API modules
│   ├── storage/          # Storage utilities
│   └── transformers/     # Data transformation
├── stores/               # State management
├── utils/                # Pure utility functions
└── types/                # TypeScript definitions
```

#### Dependency Management
- **Audit Dependencies**: Remove unused packages
- **Update Strategy**: Keep core dependencies current
- **Bundle Analysis**: Identify heavy dependencies

### 6. **Technical Debt**

#### Code Quality Issues
- **Magic Numbers**: Replace with named constants
- **Error Messages**: Centralized error message management
- **Logging**: Implement proper logging system
- **Testing**: Add unit and integration tests

#### Security Improvements
- **Real Authentication**: Replace demo mode
- **Input Validation**: Server-side validation
- **API Security**: Rate limiting, CORS configuration
- **Sensitive Data**: Remove hardcoded credentials

---

## Recommendations Summary

### Immediate Actions (1-2 weeks)
1. Split large files into smaller, focused modules
2. Extract hardcoded values to environment variables
3. Implement proper error boundaries
4. Add TypeScript strict mode

### Short-term Goals (1-2 months)
1. Implement React Query for data fetching
2. Add comprehensive testing suite
3. Optimize bundle size and performance
4. Implement proper authentication

### Long-term Vision (3-6 months)
1. Migrate to modern state management
2. Implement offline-first architecture
3. Add comprehensive monitoring and analytics
4. Scale for enterprise use

This documentation provides a complete understanding of the current codebase architecture, data flow, and opportunities for improvement. The project is well-structured for a MVP but needs refactoring for production scalability.