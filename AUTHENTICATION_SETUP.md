# Authentication Setup Guide

## Overview
This application now includes a secure authentication system that restricts access to only authorized Quess Corp recruiters.

## Authorized Recruiters
The following recruiters are authorized to access the application:

1. **Pratibha S**
   - Email: pratibha.s@qmail.quesscorp.com
   - Contact: +91 78925 11187
   - Recruiter ID: 918923325988

2. **Soniya M**
   - Email: soniya.m@quesscorp.com
   - Contact: +91 78297 86993
   - Recruiter ID: 918923325989

3. **Rakesh**
   - Email: rakesh.kb@quesscorp.com
   - Contact: +91 87627 50612
   - Recruiter ID: 918923325990

4. **Shivnarayan Mewada**
   - Email: shivnarayan.mewada@qmail.quesscorp.com
   - Contact: +91 93984 04151
   - Recruiter ID: 918923325991

## Setup Instructions

### 1. Supabase Configuration
You need to set up a Supabase project and configure the environment variables:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project settings, get the Project URL and anon/public key
3. Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_BASE_URL=http://91.99.195.150:8000/api/v1
VITE_USER_ID=918923325988
```

### 2. Create Users in Supabase
For each authorized recruiter, create a user account in Supabase:

1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add User" for each recruiter
3. Use their email addresses and set temporary passwords
4. Share the credentials with each recruiter

### 3. Database Setup (Optional)
If you want to store recruiter data in Supabase, create a `recruiters` table:

```sql
CREATE TABLE recruiters (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_no TEXT NOT NULL,
  recruiter_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the authorized recruiters
INSERT INTO recruiters (id, email, name, contact_no, recruiter_id) VALUES
  ('user-uuid-1', 'pratibha.s@qmail.quesscorp.com', 'Pratibha S', '+91 78925 11187', '918923325988'),
  ('user-uuid-2', 'soniya.m@quesscorp.com', 'Soniya M', '+91 78297 86993', '918923325989'),
  ('user-uuid-3', 'rakesh.kb@quesscorp.com', 'Rakesh', '+91 87627 50612', '918923325990'),
  ('user-uuid-4', 'shivnarayan.mewada@qmail.quesscorp.com', 'Shivnarayan Mewada', '+91 93984 04151', '918923325991');
```

## Features

### Authentication Flow
1. **Sign In Page**: Beautiful, modern sign-in interface
2. **Access Control**: Only authorized recruiters can sign in
3. **Dynamic Headers**: API requests automatically use the logged-in recruiter's ID
4. **User Display**: Shows recruiter name and email in the navbar
5. **Sign Out**: Secure logout functionality

### Security Features
- Email-based access control
- Supabase authentication
- Protected routes
- Dynamic API authorization headers

## Usage

### For Recruiters
1. Navigate to the application
2. Enter your email and password
3. Access the dashboard with your personalized view
4. All API calls will automatically use your recruiter ID

### For Developers
- The `useAuth()` hook provides authentication state
- `useRecruiterId()` hook gets the current recruiter ID
- All API functions automatically use the authenticated user's ID

## Troubleshooting

### Common Issues
1. **"Access denied" error**: Email not in authorized list
2. **API errors**: Check Supabase configuration
3. **User not found**: Ensure user exists in Supabase

### Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase configuration
3. Ensure the user account exists in Supabase
4. Check that the email matches exactly (case-sensitive)

## Notes
- The application currently uses hardcoded recruiter data for demonstration
- In production, you should fetch this data from Supabase
- All API calls now automatically include the `X-User-ID` header with the authenticated recruiter's ID
