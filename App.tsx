import { useState, useEffect, useCallback } from 'react';
import { Button } from './components/ui/button';
import { ChatView } from './components/ChatView';
import { ListView } from './components/ListView';
import { ManageListsView } from './components/ManageListsView';
import { ListDetailView } from './components/ListDetailView'; // Import the new component
import { MessageSquare, Table, Settings, Loader2 } from 'lucide-react';
import { fetchData } from './src/services/api';
import { Applicant, JobList } from './types';

type ViewType = 'chats' | 'table' | 'manage-lists';

interface AppView {
  type: ViewType;
  listId?: string | null;
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>({ type: 'chats', listId: null });
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobLists, setJobLists] = useState<JobList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { applicants, jobLists } = await fetchData();
      setApplicants(applicants);
      setJobLists(jobLists);
    } catch (err) {
      setError('Failed to load data. Please ensure the backend server is running.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleViewChange = (type: ViewType) => {
    setActiveView({ type: type, listId: null });
  };

  const handleSelectList = (listId: string) => {
    setActiveView({ type: 'manage-lists', listId: listId });
  };

  const handleGoBack = () => {
    setActiveView(prev => ({ ...prev, listId: null }));
  };

  const getViewCount = () => {
    if (activeView.listId) {
        const list = jobLists.find(l => l.id === activeView.listId);
        return list ? `Viewing "${list.listName}"` : '';
    }
    switch (activeView.type) {
      case 'chats': return `${applicants.length} chats`;
      case 'table': return `${applicants.length} applicants`;
      case 'manage-lists': return `${jobLists.length} lists`;
      default: return '';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-whatsapp-green" />
        </div>
      );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-center text-red-600">
                <div>
                    <p className="text-lg font-semibold">Error</p>
                    <p>{error}</p>
                    <Button onClick={refreshData} className="mt-4">Try Again</Button>
                </div>
            </div>
        );
    }
    
    // If a list is selected in the 'manage-lists' view, show the detail view
    if (activeView.type === 'manage-lists' && activeView.listId) {
        return <ListDetailView 
            listId={activeView.listId}
            allApplicants={applicants}
            allJobLists={jobLists}
            onDataUpdate={refreshData}
            onBack={handleGoBack}
        />
    }

    // Otherwise, show the main tab view
    switch (activeView.type) {
      case 'chats':
        return <ChatView applicants={applicants} jobLists={jobLists} onDataUpdate={refreshData} />;
      case 'table':
        return <ListView applicants={applicants} jobLists={jobLists} onDataUpdate={refreshData} />;
      case 'manage-lists':
        return <ManageListsView jobLists={jobLists} onListsUpdate={refreshData} onSelectList={handleSelectList} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-whatsapp-gray-light">
      <header className="border-b bg-whatsapp-green shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-medium">Recruiter Copilot Dashboard</h1>
            <div className="flex bg-white/20 rounded-lg p-1">
              <Button
                variant={activeView.type === 'chats' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('chats')}
                className={`flex items-center gap-2 ${activeView.type === 'chats' ? 'bg-white text-whatsapp-green hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                <MessageSquare className="h-4 w-4" />
                Chats
              </Button>
              <Button
                variant={activeView.type === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('table')}
                className={`flex items-center gap-2 ${activeView.type === 'table' ? 'bg-white text-whatsapp-green hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                <Table className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={activeView.type === 'manage-lists' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewChange('manage-lists')}
                className={`flex items-center gap-2 ${activeView.type === 'manage-lists' ? 'bg-white text-whatsapp-green hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              >
                <Settings className="h-4 w-4" />
                Manage Lists
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-white/80">
            {!isLoading && !error && getViewCount()}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}