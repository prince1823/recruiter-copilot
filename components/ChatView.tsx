import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
// Note: Card components available but not used in current implementation
import { ActionButtons } from './ActionButtons';
import { BulkActionButtons } from './BulkActionButtons';
import { Send, Phone, User, Loader2 } from 'lucide-react';
import { LegacyApplicant as Applicant, LegacyJobList as JobList, ConversationData } from '../src/types';
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
}

// Helper function to format timestamp
const formatTimestamp = (timestamp: string | number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

export function ChatView({ applicants, jobLists, onDataUpdate }: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Sort applicants by most recent first (using created_at, fallback to updated_at)
  const sortedApplicants = useMemo(() => {
    return [...applicants].sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [applicants]);

  // Fetch conversation data when a chat is selected
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedChat) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const conversationData = await conversationsAPI.getByApplicantId(parseInt(selectedChat));
        
        if (conversationData?.data && conversationData.data.length > 0) {
          const conversation = conversationData.data[0] as ConversationData;
          
          // Transform backend conversation data to ChatMessage format
          const transformedMessages: ChatMessage[] = conversation.conversations
            .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()) // Sort by timestamp
            .map((conv, index) => {
              // Create unique ID to prevent duplicate key warnings
              const uniqueId = conv.mid ? `${conv.mid}-${index}` : `msg-${selectedChat}-${index}`;
              
              return {
                id: uniqueId,
                sender: conv.role === 'APPLICANT' ? 'user' : 'bot',
                message: conv.content,
                timestamp: formatTimestamp(conv.ts)
              };
            });
          
          setMessages(transformedMessages);
        } else {
          // If no conversation data, show empty state
          setMessages([]);
        }
      } catch (error) {
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchConversation();
  }, [selectedChat]);

  const handleAction = async (action: string, applicantId: string, listId?: string) => {
    try {
        const applicant = applicants.find(a => a.id === applicantId);
        if (!applicant) return;

        switch(action) {
            // ** UPDATED: Logic for toggling status **
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

                        // Don't fail the entire operation, just log the warning
                    }
                } else { return; }
                break;
        }
        onDataUpdate();
    } catch(err) {
        alert(`Error: Could not perform action. Please try again.`);
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
        alert(`Error: Could not perform bulk action. Please try again.`);
      }
  };

  const handleChatClick = (applicantId: string) => setSelectedChat(applicantId);
  const handleSendMessage = () => { if (newMessage.trim()) { setNewMessage(''); } };
  const handleSelectApplicant = (applicantId: string, checked: boolean) => { const newSelected = new Set(selectedApplicants); if (checked) { newSelected.add(applicantId); } else { newSelected.delete(applicantId); } setSelectedApplicants(newSelected); };
  const handleSelectAll = () => { if (selectedApplicants.size === sortedApplicants.length) { setSelectedApplicants(new Set()); } else { setSelectedApplicants(new Set(sortedApplicants.map(a => a.id))); } };
  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));
  const getStatusBadgeClass = (status: string) => { switch (status) { case 'active': return 'bg-primary-blue text-white hover:bg-primary-blue-dark'; case 'disabled': return 'bg-red-500 text-white hover:bg-red-600'; default: return 'bg-gray-400 text-white'; } };
  const getListNames = (listIds: string[]) => { return listIds.map(id => { const list = jobLists.find(l => l.id === id); return list ? list.listName : id; }); };
  const selectedApplicant = selectedChat ? applicants.find(a => a.id === selectedChat) : null;
  const isAllSelected = selectedApplicants.size === sortedApplicants.length && sortedApplicants.length > 0;

  return (
    <div className="flex h-full bg-secondary-gray-light">
      <div className="w-[450px] flex flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-white"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-1 h-6 bg-primary-blue rounded-full"></div><h2 className="text-gray-900 font-medium">Chats ({sortedApplicants.length})</h2></div></div><div className="flex items-center gap-2"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" /><Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-primary-blue p-0 h-auto">{isAllSelected ? 'Deselect All' : 'Select All'}</Button></div></div>
        {selectedApplicants.size > 0 && <div className="p-4 border-b border-gray-200"><BulkActionButtons selectedCount={selectedApplicants.size} onBulkDisable={() => handleBulkAction('disable')} onBulkNudge={() => handleBulkAction('nudge')} onBulkRemoveFromList={(listId) => handleBulkAction('removeFromList', listId)} onBulkTag={(listId) => handleBulkAction('tag', listId)} availableLists={availableLists}/></div>}
        <div className="flex-1 overflow-y-auto">
          {sortedApplicants.map((applicant) => (
            <div key={applicant.id} className={`group relative flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors hover:z-20 focus-within:z-20 ${selectedChat === applicant.id ? 'bg-primary-blue-light border-l-4 border-l-primary-blue z-10' : ''}`}>
              <div className="mr-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" /></div>
              <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={() => handleChatClick(applicant.id)}>
                <Avatar className="h-12 w-12 mr-3 flex-shrink-0"><AvatarFallback className="bg-primary-blue text-white">{applicant.phone.slice(-4)}</AvatarFallback></Avatar>
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
                    <span className="text-xs text-secondary-gray flex-shrink-0 ml-2">{applicant.lastMessageTime}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{applicant.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getStatusBadgeClass(applicant.status)}`}>{applicant.status}</Badge>
                    <span className="text-xs text-secondary-gray">{applicant.location}</span>
                    <span className="text-xs text-secondary-gray">{applicant.experience}y exp</span>
                    {applicant.hasTwoWheeler && <Badge variant="outline" className="text-xs border-primary-blue text-primary-blue">2W</Badge>}
                    {applicant.hasCompletedConversation && <Badge variant="outline" className="text-xs border-primary-blue text-primary-blue">Complete</Badge>}
                  </div>
                </div>
              </div>
              <div className="ml-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* ** UPDATED: Passing status prop and using onToggleStatus ** */}
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
          ))}
        </div>
      </div>
      <div className="flex-1 flex">
        {selectedApplicant ? (
          <>
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-primary-blue text-white flex items-center justify-between">
                <div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback className="bg-white text-primary-blue">{selectedApplicant.phone.slice(-4)}</AvatarFallback></Avatar><div><h3 className="font-medium text-white">{selectedApplicant.phone}</h3><p className="text-sm text-white/80">
                  {selectedApplicant.name.includes('Unknown') 
                    ? 'Age: Unknown' 
                    : selectedApplicant.name.includes('years') 
                      ? selectedApplicant.name.split(' - ')[1] || selectedApplicant.name
                      : selectedApplicant.name
                  }
                </p></div></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2"><Phone className="h-4 w-4" /></Button>
                  <div onClick={(e) => e.stopPropagation()}>
                    {/* ** UPDATED: Passing status prop and using onToggleStatus ** */}
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
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-primary-blue" />
                    <span className="ml-2 text-gray-600">Loading conversation...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center text-gray-500">
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">Start a conversation with this candidate</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === 'user' 
                          ? 'bg-white border border-gray-200 shadow-sm' 
                          : 'bg-primary-blue text-white'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'user' 
                            ? 'text-gray-500' 
                            : 'text-white/70'
                        }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-200 bg-white"><div className="flex gap-2"><Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1"/><Button onClick={handleSendMessage} className="bg-primary-blue hover:bg-primary-blue-dark"><Send className="h-4 w-4" /></Button></div></div>
            </div>

          </>
        ) : ( <div className="flex-1 flex flex-col items-center justify-center bg-secondary-gray-light text-gray-500"><div className="text-center space-y-4"><div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"><User className="w-16 h-16 text-gray-400" /></div><h3 className="text-xl font-medium text-gray-600">Select a chat to start messaging</h3><p className="text-sm text-gray-500">Choose from your existing conversations on the left</p></div></div> )}
      </div>
    </div>
  );
}