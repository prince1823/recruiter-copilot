import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActionButtons } from './ActionButtons';
import { ArrowLeft, Send, Phone, MapPin, Clock, User, Briefcase, Settings } from 'lucide-react';
import { LegacyApplicant as Applicant, LegacyJobList as JobList, ConversationData } from '../src/types';
import { conversationsAPI } from '../src/services/api';
import { Loader2 } from 'lucide-react';

interface ChatDetailProps {
  applicant: Applicant;
  jobLists: JobList[];
  onBack: () => void;
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

export function ChatDetail({ applicant, jobLists, onBack }: ChatDetailProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch conversation data when component mounts
  useEffect(() => {
    const fetchConversation = async () => {
      setIsLoadingMessages(true);
      try {
        const conversationData = await conversationsAPI.getByApplicantId(parseInt(applicant.id));
        
        if (conversationData?.data && conversationData.data.length > 0) {
          const conversation = conversationData.data[0] as ConversationData;
          
          // Transform backend conversation data to ChatMessage format
          const transformedMessages: ChatMessage[] = conversation.conversations
            .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime()) // Sort by timestamp
            .map((conv, index) => {
              // Create unique ID to prevent duplicate key warnings
              const uniqueId = conv.mid ? `${conv.mid}-${index}` : `msg-${applicant.id}-${index}`;
              
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
  }, [applicant.id]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {

      setNewMessage('');
    }
  };

  const handleAction = (_action: string, _applicantId: string, _listId?: string) => {
    // Action handling implementation
  };

  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary-blue text-white hover:bg-primary-blue-dark';
      case 'disabled': return 'bg-red-500 text-white hover:bg-red-600';
      default: return '';
    }
  };

  return (
    <div className="flex h-full bg-secondary-gray-light">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-primary-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-white text-primary-blue">
                {applicant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white">{applicant.name}</h3>
              <p className="text-sm text-white/80">{applicant.phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
            >
              <Phone className="h-4 w-4" />
            </Button>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-whatsapp-gray-light space-y-4">
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
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary-blue text-white'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}
                >
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

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-primary-blue hover:bg-primary-blue-dark">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Candidate Info Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white p-4 space-y-4">
        <Card className="border-l-4 border-l-primary-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Candidate Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarFallback className="text-lg bg-primary-blue text-white">
                  {applicant.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h4 className="font-medium">{applicant.name}</h4>
              <p className="text-sm text-gray-600">{applicant.phone}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{applicant.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <span>{applicant.pincode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <span>{applicant.experience}y exp</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{applicant.hasTwoWheeler ? 'Has 2W' : 'No 2W'}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Badge className={`w-full justify-center text-xs ${getStatusBadgeClass(applicant.status)}`}>
                {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
              </Badge>
            </div>
            
            {applicant.tags.length > 0 && (
              <div className="pt-2">
                <p className="text-sm font-medium mb-2">Tags:</p>
                <div className="flex flex-wrap gap-1">
                  {applicant.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">
                Schedule Interview
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">
                Send Document Request
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">
                Add to Priority List
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm hover:bg-gray-50">
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}