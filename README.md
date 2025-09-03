# Recruiter Copilot Dashboard

A modern React-based frontend application for managing recruiter lists and candidate interactions. This dashboard provides recruiters with a powerful interface to manage candidate lists, perform bulk actions, and automate communication workflows.

## ✨ Features

- **List Management**: Create, view, and manage recruiter lists
- **Candidate Management**: View and manage candidate information
- **Bulk Actions**: Perform bulk operations on candidates (add/remove from lists, send messages, etc.)
- **Conversation View**: View conversation history with candidates
- **Real-time Integration**: Ready for backend API integration
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🚀 Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Build Tool**: Vite

## 📦 Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
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

3. Configure environment variables (optional):
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=https://your-api-endpoint.com/api/v1
VITE_USER_ID=your-user-id
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

Preview the production build:
```bash
npm run preview
```

## 🏗️ Project Structure

```
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── ActionButtons.tsx
│   ├── CandidateFilter.tsx
│   ├── ChatView.tsx
│   └── ...
├── src/
│   ├── config/         # Configuration files
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services and utilities
│   ├── types/          # TypeScript type definitions
│   └── ...
├── styles/             # Global styles
├── index.html
├── main.tsx           # Application entry point
└── App.tsx            # Main application component
```

## 🔧 Configuration

The application supports environment-specific configurations:

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for the backend API
- `VITE_USER_ID`: User ID for API authentication

### API Integration

The application is designed to work with external APIs and includes:

- Modular API service layer
- Data transformation utilities
- Error handling and retry logic
- Type-safe API interfaces

## 🎨 UI Components

Built with modern, accessible components:

- **Forms**: Input fields, selectors, and validation
- **Data Display**: Tables, cards, and lists
- **Navigation**: Breadcrumbs, tabs, and menus
- **Feedback**: Alerts, toasts, and loading states
- **Overlays**: Modals, dialogs, and popovers

## 📱 Responsive Design

The application is fully responsive and works across:

- Desktop computers
- Tablets
- Mobile devices

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the deployment prompts

### Other Platforms

The built application can be deployed to any static hosting service:

- Netlify
- GitHub Pages
- AWS S3
- Firebase Hosting

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Follow the established naming conventions
4. Update documentation as needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

[Add your license information here]