import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ActionButtons } from './ActionButtons';
import { ArrowLeft, Send, Phone, MapPin, Clock, User, Briefcase, Settings } from 'lucide-react';
import { LegacyApplicant as Applicant, LegacyJobList as JobList } from '../src/types';

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

export function ChatDetail({ applicant, jobLists, onBack }: ChatDetailProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      message: 'Hello! I am the Recruiter Bot. I see you are interested in delivery positions. Can you tell me about your experience?',
      timestamp: '2 days ago'
    },
    {
      id: '2',
      sender: 'user',
      message: 'Hi! I have been working as a delivery person for 2 years. I have my own two-wheeler and know the city very well.',
      timestamp: '2 days ago'
    },
    {
      id: '3',
      sender: 'bot',
      message: 'That\'s great! Are you available for full-time work? What are your preferred working hours?',
      timestamp: '2 days ago'
    },
    {
      id: '4',
      sender: 'user',
      message: 'Yes, I am looking for full-time work. I prefer morning to evening shifts, but can be flexible.',
      timestamp: '1 day ago'
    },
    {
      id: '5',
      sender: 'bot',
      message: 'Perfect! We have several delivery positions available in your area. Would you like me to share more details about the job requirements and compensation?',
      timestamp: '1 day ago'
    },
    {
      id: '6',
      sender: 'user',
      message: applicant.lastMessage || 'Yes, please share the details',
      timestamp: applicant.lastMessageTime || '1 day ago'
    }
  ]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleAction = (action: string, applicantId: string, listId?: string) => {
    console.log(`${action} action for applicant ${applicantId}`, listId ? `to list ${listId}` : '');
  };

  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark';
      case 'disabled': return 'bg-red-500 text-white hover:bg-red-600';
      default: return '';
    }
  };

  return (
    <div className="flex h-full bg-whatsapp-gray-light">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-whatsapp-green text-white flex items-center justify-between">
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
              <AvatarFallback className="bg-white text-whatsapp-green">
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
              onDisable={() => handleAction('disable', applicant.id)}
              onNudge={() => handleAction('nudge', applicant.id)}
              onShortlist={() => handleAction('shortlist', applicant.id)}
              onTag={(listId) => handleAction('tag', applicant.id, listId)}
              availableLists={availableLists}
              showLabels={false}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-whatsapp-gray-light space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-whatsapp-green text-white'
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
          ))}
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
            <Button onClick={handleSendMessage} className="bg-whatsapp-green hover:bg-whatsapp-green-dark">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Candidate Info Sidebar */}
      <div className="w-80 border-l border-gray-200 bg-white p-4 space-y-4">
        <Card className="border-l-4 border-l-whatsapp-green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Candidate Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarFallback className="text-lg bg-whatsapp-green text-white">
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