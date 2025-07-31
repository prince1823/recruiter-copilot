import { useState } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActionButtons } from './ActionButtons';
import { BulkActionButtons } from './BulkActionButtons';
import { Send, Phone, MapPin, Clock, User, Briefcase, Settings } from 'lucide-react';
import { Applicant, JobList } from '../types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction, removeApplicantFromAllLists } from '../src/services/api';

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

export function ChatView({ applicants, jobLists, onDataUpdate }: ChatViewProps) {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());

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
                    await removeApplicantFromAllLists(applicantId);
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

  const handleChatClick = (applicantId: string) => setSelectedChat(applicantId);
  const handleSendMessage = () => { if (newMessage.trim()) { console.log('Sending message:', newMessage); setNewMessage(''); } };
  const handleSelectApplicant = (applicantId: string, checked: boolean) => { const newSelected = new Set(selectedApplicants); if (checked) { newSelected.add(applicantId); } else { newSelected.delete(applicantId); } setSelectedApplicants(newSelected); };
  const handleSelectAll = () => { if (selectedApplicants.size === applicants.length) { setSelectedApplicants(new Set()); } else { setSelectedApplicants(new Set(applicants.map(a => a.id))); } };
  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));
  const getStatusBadgeClass = (status: string) => { switch (status) { case 'active': return 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark'; case 'disabled': return 'bg-red-500 text-white hover:bg-red-600'; default: return 'bg-gray-400 text-white'; } };
  const getListNames = (listIds: string[]) => { return listIds.map(id => { const list = jobLists.find(l => l.id === id); return list ? list.listName : id; }); };
  const selectedApplicant = selectedChat ? applicants.find(a => a.id === selectedChat) : null;
  const isAllSelected = selectedApplicants.size === applicants.length && applicants.length > 0;
  const messages: ChatMessage[] = selectedApplicant ? [ { id: '1', sender: 'bot', message: 'Hello! I am the Recruiter Bot. I see you are interested in delivery positions. Can you tell me about your experience?', timestamp: '2 days ago' }, { id: '2', sender: 'user', message: 'Hi! I have been working as a delivery person for 2 years. I have my own two-wheeler and know the city very well.', timestamp: '2 days ago' }, { id: '3', sender: 'bot', message: 'That\'s great! Are you available for full-time work? What are your preferred working hours?', timestamp: '2 days ago' }, { id: '4', sender: 'user', message: 'Yes, I am looking for full-time work. I prefer morning to evening shifts, but can be flexible.', timestamp: '1 day ago' }, { id: '5', sender: 'bot', message: 'Perfect! We have several delivery positions available in your area. Would you like me to share more details about the job requirements and compensation?', timestamp: '1 day ago' }, { id: '6', sender: 'user', message: selectedApplicant.lastMessage || 'Yes, please share the details', timestamp: selectedApplicant.lastMessageTime || '1 day ago' } ] : [];

  return (
    <div className="flex h-full bg-whatsapp-gray-light">
      <div className="w-[450px] flex flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200 bg-white"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><div className="w-1 h-6 bg-whatsapp-green rounded-full"></div><h2 className="text-gray-900 font-medium">Chats ({applicants.length})</h2></div></div><div className="flex items-center gap-2"><Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-whatsapp-green data-[state=checked]:border-whatsapp-green" /><Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-whatsapp-green p-0 h-auto">{isAllSelected ? 'Deselect All' : 'Select All'}</Button></div></div>
        {selectedApplicants.size > 0 && <div className="p-4 border-b border-gray-200"><BulkActionButtons selectedCount={selectedApplicants.size} onBulkDisable={() => handleBulkAction('disable')} onBulkNudge={() => handleBulkAction('nudge')} onBulkRemoveFromList={(listId) => handleBulkAction('removeFromList', listId)} onBulkTag={(listId) => handleBulkAction('tag', listId)} availableLists={availableLists}/></div>}
        <div className="flex-1 overflow-y-auto">
          {applicants.map((applicant) => (
            <div key={applicant.id} className={`group relative flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors hover:z-20 focus-within:z-20 ${selectedChat === applicant.id ? 'bg-whatsapp-green-light border-l-4 border-l-whatsapp-green z-10' : ''}`}>
              <div className="mr-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} className="data-[state=checked]:bg-whatsapp-green data-[state=checked]:border-whatsapp-green" /></div>
              <div className="flex items-center flex-1 cursor-pointer min-w-0" onClick={() => handleChatClick(applicant.id)}>
                <Avatar className="h-12 w-12 mr-3 flex-shrink-0"><AvatarFallback className="bg-whatsapp-green text-white">{applicant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1"><p className="font-medium truncate text-gray-900">{applicant.name}</p><span className="text-xs text-whatsapp-gray flex-shrink-0 ml-2">{applicant.lastMessageTime}</span></div>
                  <p className="text-sm text-gray-600 truncate">{applicant.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className={`text-xs ${getStatusBadgeClass(applicant.status)}`}>{applicant.status}</Badge>
                    <span className="text-xs text-whatsapp-gray">{applicant.location}</span>
                    <span className="text-xs text-whatsapp-gray">{applicant.experience}y exp</span>
                    {applicant.hasTwoWheeler && <Badge variant="outline" className="text-xs border-whatsapp-green text-whatsapp-green">2W</Badge>}
                    {applicant.hasCompletedConversation && <Badge variant="outline" className="text-xs border-green-500 text-green-600">Complete</Badge>}
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
              <div className="p-4 border-b border-gray-200 bg-whatsapp-green text-white flex items-center justify-between">
                <div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarFallback className="bg-white text-whatsapp-green">{selectedApplicant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar><div><h3 className="font-medium text-white">{selectedApplicant.name}</h3><p className="text-sm text-white/80">{selectedApplicant.phone}</p></div></div>
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
              <div className="flex-1 overflow-y-auto p-4 bg-whatsapp-gray-light space-y-4">{messages.map((msg) => (<div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-whatsapp-green text-white' : 'bg-white border border-gray-200 shadow-sm'}`}><p className="text-sm">{msg.message}</p><p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>{msg.timestamp}</p></div></div>))}</div>
              <div className="p-4 border-t border-gray-200 bg-white"><div className="flex gap-2"><Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1"/><Button onClick={handleSendMessage} className="bg-whatsapp-green hover:bg-whatsapp-green-dark"><Send className="h-4 w-4" /></Button></div></div>
            </div>
            <div className="w-80 border-l border-gray-200 bg-white p-4 space-y-4">
              <Card className="border-l-4 border-l-whatsapp-green"><CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" />Candidate Profile</CardTitle></CardHeader><CardContent className="space-y-3"><div className="text-center"><Avatar className="h-16 w-16 mx-auto mb-2"><AvatarFallback className="text-lg bg-whatsapp-green text-white">{selectedApplicant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar><h4 className="font-medium">{selectedApplicant.name}</h4><p className="text-sm text-gray-600">{selectedApplicant.phone}</p></div><div className="grid grid-cols-2 gap-4 text-sm"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><span>{selectedApplicant.location}</span></div><div className="flex items-center gap-2"><Settings className="h-4 w-4 text-gray-400" /><span>{selectedApplicant.pincode}</span></div><div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-gray-400" /><span>{selectedApplicant.experience}y exp</span></div><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><span>{selectedApplicant.hasTwoWheeler ? 'Has 2W' : 'No 2W'}</span></div></div><div className="pt-2"><Badge className={`w-full justify-center text-xs ${getStatusBadgeClass(selectedApplicant.status)}`}>{selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}</Badge></div>{selectedApplicant.lists.length > 0 && (<div className="pt-2"><p className="text-sm font-medium mb-2">Lists:</p><div className="flex flex-wrap gap-1">{getListNames(selectedApplicant.lists).map((listName, index) => <Badge key={index} variant="outline" className="text-xs border-whatsapp-green text-whatsapp-green">{listName}</Badge>)}</div></div>)}{selectedApplicant.tags.length > 0 && (<div className="pt-2"><p className="text-sm font-medium mb-2">Tags:</p><div className="flex flex-wrap gap-1">{selectedApplicant.tags.map((tag, index) => <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>)}</div></div>)}</CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader><CardContent><div className="space-y-2"><Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">Schedule Interview</Button><Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">Send Document Request</Button><Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">Add to Priority List</Button><Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">View Full Profile</Button></div></CardContent></Card>
            </div>
          </>
        ) : ( <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-gray-light text-gray-500"><div className="text-center space-y-4"><div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4"><User className="w-16 h-16 text-gray-400" /></div><h3 className="text-xl font-medium text-gray-600">Select a chat to start messaging</h3><p className="text-sm text-gray-500">Choose from your existing conversations on the left</p></div></div> )}
      </div>
    </div>
  );
}