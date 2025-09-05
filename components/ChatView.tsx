import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActionButtons } from './ActionButtons';
import { BulkActionButtons } from './BulkActionButtons';
import { Send, Phone, MapPin, Clock, User, Briefcase, Settings, Loader2 } from 'lucide-react';
import { LegacyApplicant as Applicant, LegacyJobList as JobList, ConversationData, Conversation } from '../src/types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction, removeApplicantFromAllLists, conversationsAPI } from '../src/services/api';

interface ChatViewProps {
  applicants: Applicant[];
  jobLists: JobList[];
  onDataUpdate: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  message: string;
  timestamp: string;
  rawTimestamp?: string;
}

// Interface for conversation state management
interface ConversationState {
  [applicantId: string]: {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    lastFetched: number;
  }
}

export function ChatView({ applicants, jobLists, onDataUpdate }: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<ConversationState>({});

  // Sort applicants by most recent first (using created_at, fallback to updated_at)
  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [applicants]);

  // Transform backend conversation data to ChatMessage format
  const transformConversationData = (conversationData: ConversationData): ChatMessage[] => {
    if (!conversationData?.conversations || !Array.isArray(conversationData.conversations)) {
      console.warn('🔍 TEST CASE: Invalid conversation data structure:', conversationData);
      return [];
    }

    return conversationData.conversations.map((conv: Conversation, index: number) => {
      // Determine sender based on role
      const sender: 'bot' | 'user' = conv.role === 'RECRUITER' ? 'bot' : 'user';
      
      // Format timestamp
      let timestamp = 'Unknown time';
      let rawTimestamp = conv.ts;
      
      try {
        const date = new Date(conv.ts);
        if (!isNaN(date.getTime())) {
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          if (diffDays === 0) {
            if (diffHours === 0) {
              const diffMins = Math.floor(diffMs / (1000 * 60));
              timestamp = diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
            } else {
              timestamp = `${diffHours}h ago`;
            }
          } else if (diffDays === 1) {
            timestamp = 'Yesterday';
          } else if (diffDays < 7) {
            timestamp = `${diffDays}d ago`;
          } else {
            timestamp = date.toLocaleDateString();
          }
        }
      } catch (error) {
        console.warn('🔍 TEST CASE: Error parsing timestamp:', conv.ts, error);
      }

      return {
        id: conv.mid || `msg-${index}`,
        sender,
        message: conv.content || 'No message content',
        timestamp,
        rawTimestamp
      };
    }).sort((a, b) => {
      // Sort messages by timestamp (oldest first for chat display)
      try {
        const timeA = new Date(a.rawTimestamp || 0).getTime();
        const timeB = new Date(b.rawTimestamp || 0).getTime();
        return timeA - timeB;
      } catch {
        return 0;
      }
    });
  };

  // Fetch conversation data from backend
  const fetchConversation = async (applicantId: string): Promise<void> => {
    console.log('🔍 TEST CASE: Fetching conversation for applicant:', applicantId);
    
    const numericId = parseInt(applicantId);
    if (isNaN(numericId)) {
      console.error('🔍 TEST CASE: Invalid applicant ID format:', applicantId);
      setConversations(prev => ({
        ...prev,
        [applicantId]: {
          messages: [],
          isLoading: false,
          error: 'Invalid applicant ID format',
          lastFetched: Date.now()
        }
      }));
      return;
    }

    // Set loading state
    setConversations(prev => ({
      ...prev,
      [applicantId]: {
        ...prev[applicantId],
        isLoading: true,
        error: null,
        lastFetched: Date.now()
      }
    }));

    try {
      console.log('🔍 TEST CASE: Calling conversationsAPI.getByApplicantId with:', numericId);
      const response = await conversationsAPI.getByApplicantId(numericId);
      console.log('🔍 TEST CASE: Backend response structure:', {
        hasData: !!response,
        keys: response ? Object.keys(response) : [],
        type: typeof response,
        isArray: Array.isArray(response)
      });

      let conversationData: ConversationData | null = null;

      // Handle different response formats
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        conversationData = response.data[0];
        console.log('🔍 TEST CASE: Using response.data[0] format');
      } else if (response && !response.data && response.conversations) {
        conversationData = response;
        console.log('🔍 TEST CASE: Using direct response format');
      } else if (Array.isArray(response) && response.length > 0) {
        conversationData = response[0];
        console.log('🔍 TEST CASE: Using array response format');
      } else {
        console.log('🔍 TEST CASE: No conversation data found in response');
      }

      if (conversationData) {
        console.log('🔍 TEST CASE: Processing conversation data:', {
          applicant_id: conversationData.applicant_id,
          conversationsCount: conversationData.conversations?.length || 0,
          firstConversation: conversationData.conversations?.[0]
        });

        const messages = transformConversationData(conversationData);
        console.log('🔍 TEST CASE: Transformed messages:', {
          count: messages.length,
          firstMessage: messages[0],
          lastMessage: messages[messages.length - 1]
        });

        setConversations(prev => ({
          ...prev,
          [applicantId]: {
            messages,
            isLoading: false,
            error: null,
            lastFetched: Date.now()
          }
        }));
      } else {
        console.log('🔍 TEST CASE: No conversations found for applicant:', applicantId);
        setConversations(prev => ({
          ...prev,
          [applicantId]: {
            messages: [],
            isLoading: false,
            error: 'No conversations found',
            lastFetched: Date.now()
          }
        }));
      }
    } catch (error) {
      console.error('🔍 TEST CASE: Error fetching conversation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setConversations(prev => ({
        ...prev,
        [applicantId]: {
          messages: [],
          isLoading: false,
          error: errorMessage,
          lastFetched: Date.now()
        }
      }));
    }
  };

  // Get messages for current selected applicant
  const getMessages = (): ChatMessage[] => {
    if (!selectedChat) return [];
    
    const conversationState = conversations[selectedChat];
    if (!conversationState) {
      console.log('🔍 TEST CASE: No conversation state for:', selectedChat);
      return [];
    }

    if (conversationState.isLoading) {
      console.log('🔍 TEST CASE: Conversation still loading for:', selectedChat);
      return [];
    }

    if (conversationState.error) {
      console.log('🔍 TEST CASE: Conversation error for:', selectedChat, conversationState.error);
      return [{
        id: 'error-msg',
        sender: 'bot',
        message: `Error loading conversation: ${conversationState.error}`,
        timestamp: 'Error'
      }];
    }

    console.log('🔍 TEST CASE: Returning messages for:', selectedChat, 'count:', conversationState.messages.length);
    return conversationState.messages;
  };

  // Handle chat selection and fetch conversation if needed
  const handleChatClick = async (applicantId: string) => {
    console.log('🔍 TEST CASE: Chat clicked for applicant:', applicantId);
    setSelectedChat(applicantId);
    
    const existingConversation = conversations[applicantId];
    const shouldFetch = !existingConversation || 
                      (!existingConversation.isLoading && 
                       !existingConversation.error && 
                       existingConversation.messages.length === 0) ||
                      (Date.now() - existingConversation.lastFetched > 5 * 60 * 1000); // Refetch after 5 minutes

    if (shouldFetch) {
      console.log('🔍 TEST CASE: Fetching conversation data for:', applicantId);
      await fetchConversation(applicantId);
    } else {
      console.log('🔍 TEST CASE: Using cached conversation data for:', applicantId);
    }
  };

  // Load conversations for all applicants on component mount (for testing)
  useEffect(() => {
    console.log('🔍 TEST CASE: Component mounted, preloading conversations for', sortedApplicants.length, 'applicants');
    
    // Preload conversations for first 5 applicants to test backend integration
    const applicantsToPreload = sortedApplicants.slice(0, 5);
    applicantsToPreload.forEach(applicant => {
      setTimeout(() => fetchConversation(applicant.id), Math.random() * 1000);
    });
  }, [sortedApplicants]);

  // Handle sending new messages (optimistic update)
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Optimistic update - add message immediately to UI
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'bot',
      message: messageContent,
      timestamp: 'Sending...'
    };

    setConversations(prev => ({
      ...prev,
      [selectedChat]: {
        ...prev[selectedChat],
        messages: [...(prev[selectedChat]?.messages || []), optimisticMessage]
      }
    }));

    console.log('🔍 TEST CASE: Sending message:', messageContent, 'to applicant:', selectedChat);
    
    // TODO: Implement actual message sending to backend
    // For now, simulate the message being sent
    setTimeout(() => {
      setConversations(prev => ({
        ...prev,
        [selectedChat]: {
          ...prev[selectedChat],
          messages: prev[selectedChat]?.messages.map(msg => 
            msg.id === optimisticMessage.id 
              ? { ...msg, timestamp: 'Just now' }
              : msg
          ) || []
        }
      }));
    }, 1000);
  };

  const handleAction = async (action: string, applicantId: string, listId?: string) => {
    try {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return;

        switch(action) {
            case 'toggleStatus':
                const newStatus = applicant.status === 'active' ? 'disabled' : 'active';
                await bulkUpdateCandidateStatus([applicantId], newStatus);
                break;
            case 'nudge':
                await bulkSendAction([applicantId], 'nudge');
                break;
            case 'tag':
                if (listId) await manageCandidatesInList(listId, [applicantId], 'add');
                break;
            case 'removeFromList':
                if (window.confirm("Are you sure you want to remove this candidate from ALL lists?")) {
                    const result = await removeApplicantFromAllLists(applicantId);
                    if (!result.success) {
                        console.warn('Warning: Could not remove from all lists');
                    }
                } else { return; }
                break;
        }
        onDataUpdate();
    } catch(err) {
        console.error(`Failed to perform ${action}`, err);
        alert(`Error: Could not perform action. See console for details.`);
    }
  };

  const handleBulkAction = async (action: string, listId?: string) => {
    const selectedIds = Array.from(selectedApplicants);
    if (selectedIds.length === 0) return;

    try {
        switch(action) {
            case 'disable':
                await bulkUpdateCandidateStatus(selectedIds, 'disabled');
                break;
            case 'nudge':
                await bulkSendAction(selectedIds, 'nudge');
                break;
            case 'tag':
                if (listId) await manageCandidatesInList(listId, selectedIds, 'add');
                break;
            case 'removeFromList':
                if (listId) await manageCandidatesInList(listId, selectedIds, 'remove');
                break;
        }
        setSelectedApplicants(new Set());
        onDataUpdate();
    } catch (err) {
        console.error(`Failed to perform bulk ${action}`, err);
        alert(`Error: Could not perform bulk action. See console for details.`);
    }
  };

  const handleSelectApplicant = (applicantId: string, checked: boolean) => {
    const newSelected = new Set(selectedApplicants);
    if (checked) {
      newSelected.add(applicantId);
    } else {
      newSelected.delete(applicantId);
    }
    setSelectedApplicants(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApplicants.size === sortedApplicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(sortedApplicants.map(a => a.id)));
    }
  };

  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary-blue text-white hover:bg-primary-blue-dark';
      case 'disabled': return 'bg-red-500 text-white hover:bg-red-600';
      default: return 'bg-gray-400 text-white';
    }
  };

  const selectedApplicant = selectedChat ? applicants.find(a => a.id === selectedChat) : null;
  const isAllSelected = selectedApplicants.size === sortedApplicants.length && sortedApplicants.length > 0;
  const messages = getMessages();
  const conversationState = selectedChat ? conversations[selectedChat] : null;

  return (
    <div className="flex h-full bg-secondary-gray-light">
      <div className="w-[450px] flex flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-blue rounded-full"></div>
              <h2 className="text-gray-900 font-medium">Chats ({sortedApplicants.length})</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={isAllSelected} 
              onCheckedChange={handleSelectAll} 
              className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" 
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll} 
              className="text-sm text-gray-600 hover:text-primary-blue p-0 h-auto"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </div>
        
        {selectedApplicants.size > 0 && (
          <div className="p-4 border-b border-gray-200">
            <BulkActionButtons 
              selectedCount={selectedApplicants.size} 
              onBulkDisable={() => handleBulkAction('disable')} 
              onBulkNudge={() => handleBulkAction('nudge')} 
              onBulkRemoveFromList={(listId) => handleBulkAction('removeFromList', listId)} 
              onBulkTag={(listId) => handleBulkAction('tag', listId)} 
              availableLists={availableLists}
            />
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {sortedApplicants.map((applicant) => {
            const hasConversation = conversations[applicant.id];
            const isLoading = hasConversation?.isLoading;
            const hasError = hasConversation?.error;
            const messageCount = hasConversation?.messages?.length || 0;
            
            return (
              <div 
                key={applicant.id} 
                className={`group relative flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors hover:z-20 focus-within:z-20 ${
                  selectedChat === applicant.id ? 'bg-primary-blue-light border-l-4 border-l-primary-blue z-10' : ''
                }`}
              >
                <div className="mr-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedApplicants.has(applicant.id)} 
                    onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} 
                    className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" 
                  />
                </div>
                
                <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={() => handleChatClick(applicant.id)}>
                  <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                    <AvatarFallback className="bg-primary-blue text-white">
                      {applicant.phone.slice(-4)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-medium truncate text-gray-900">{applicant.phone}</p>
                        <p className="text-xs text-gray-500">
                          {applicant.name.includes('Unknown') 
                            ? 'Age: Unknown' 
                            : applicant.name.includes('years') 
                              ? applicant.name.split(' - ')[1] || applicant.name
                              : applicant.name
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary-blue" />}
                        <span className="text-xs text-secondary-gray flex-shrink-0">
                          {applicant.lastMessageTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {hasError ? `Error: ${hasError}` : 
                         messageCount > 0 ? `${messageCount} messages` : 
                         applicant.lastMessage}
                      </p>
                      {messageCount > 0 && (
                        <Badge variant="outline" className="text-xs border-primary-blue text-primary-blue ml-2">
                          {messageCount}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={`text-xs ${getStatusBadgeClass(applicant.status)}`}>
                        {applicant.status}
                      </Badge>
                      <span className="text-xs text-secondary-gray">{applicant.location}</span>
                      <span className="text-xs text-secondary-gray">{applicant.experience}y exp</span>
                      {applicant.hasTwoWheeler && (
                        <Badge variant="outline" className="text-xs border-primary-blue text-primary-blue">2W</Badge>
                      )}
                      {applicant.hasCompletedConversation && (
                        <Badge variant="outline" className="text-xs border-green-500 text-green-600">Complete</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <ActionButtons
                    status={applicant.status}
                    onToggleStatus={() => handleAction('toggleStatus', applicant.id)}
                    onNudge={() => handleAction('nudge', applicant.id)}
                    onRemoveFromList={() => handleAction('removeFromList', applicant.id)}
                    onTag={(listId) => handleAction('tag', applicant.id, listId)}
                    availableLists={availableLists}
                    showLabels={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 flex">
        {selectedApplicant ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-primary-blue text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-white text-primary-blue">
                    {selectedApplicant.phone.slice(-4)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{selectedApplicant.phone}</h3>
                  <p className="text-sm text-white/80">
                    {selectedApplicant.name.includes('Unknown') 
                      ? 'Age: Unknown' 
                      : selectedApplicant.name.includes('years') 
                        ? selectedApplicant.name.split(' - ')[1] || selectedApplicant.name
                        : selectedApplicant.name
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                  <Phone className="h-4 w-4" />
                </Button>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionButtons
                    status={selectedApplicant.status}
                    onToggleStatus={() => handleAction('toggleStatus', selectedApplicant.id)}
                    onNudge={() => handleAction('nudge', selectedApplicant.id)}
                    onRemoveFromList={() => handleAction('removeFromList', selectedApplicant.id)}
                    onTag={(listId) => handleAction('tag', selectedApplicant.id, listId)}
                    availableLists={availableLists}
                    showLabels={false}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-secondary-gray-light space-y-4">
              {conversationState?.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-blue mr-2" />
                  <span className="text-secondary-gray">Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-secondary-gray">No messages yet</p>
                    <p className="text-sm text-secondary-gray mt-1">Start a conversation below</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'user' 
                        ? 'bg-primary-blue text-white' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-primary-blue hover:bg-primary-blue-dark"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-secondary-gray-light text-gray-500">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600">Select a chat to start messaging</h3>
              <p className="text-sm text-gray-500">Choose from your existing conversations on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}