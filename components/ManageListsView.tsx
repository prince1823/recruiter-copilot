import { useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Plus, Calendar, Users, CheckCircle, ShieldX, Phone, AlertCircle, Trash2 } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { JobList } from '../types';
import { createListFromPhoneNumbers, cancelPendingMessagesByList, deleteList } from '../src/services/api';
import { addDeletedList } from '../src/services/deletedItemsManager';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ManageListsViewProps {
  jobLists: JobList[];
  onListsUpdate: () => void;
  onSelectList: (listId: string) => void;
  onListsLocalUpdate?: (updatedLists: JobList[]) => void;
}

export function ManageListsView({ jobLists, onListsUpdate, onSelectList, onListsLocalUpdate }: ManageListsViewProps) {
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const resetCreateDialog = () => {
    setNewListName('');
    setNewListDescription('');
    setPhoneNumbers('');
    setIsUploading(false);
  };

  const validatePhoneNumbers = (phoneNumbers: string): { valid: string[], invalid: string[] } => {
    const numbers = phoneNumbers.split(',').map(num => num.trim()).filter(num => num.length > 0);
    const valid: string[] = [];
    const invalid: string[] = [];

    numbers.forEach(num => {
      const cleanNum = num.replace(/\D/g, '');
      if (cleanNum.length === 12 || cleanNum.length === 10) {
        valid.push(num);
      } else {
        invalid.push(num);
      }
    });

    return { valid, invalid };
  };
  
  const handleCreateList = async () => {

      if (!newListName.trim()) {
          alert("Please enter a list name.");
          return;
      }

      if (!phoneNumbers.trim()) {
          alert("Please enter phone numbers.");
          return;
      }

      setIsUploading(true);
      try {

        const { valid, invalid } = validatePhoneNumbers(phoneNumbers);
        
        if (invalid.length > 0) {
            alert(`Warning: ${invalid.length} invalid phone numbers found:\n${invalid.join(', ')}\n\nOnly valid numbers will be added.`);
        }
        
        if (valid.length === 0) {
            alert("No valid phone numbers found. Please check the format.");
            return;
        }
        
        const response = await createListFromPhoneNumbers(newListName.trim(), valid.join(','));

        alert(`${response.message}\nAdded: ${response.addedNumbers}/${response.totalNumbers} numbers`);
        
        // Refresh the data to show the new list with applicants

        onListsUpdate();
        
        setIsCreateDialogOpen(false);
        resetCreateDialog();
      } catch (err) {
        alert(`Error: ${err}`);
      } finally {
        setIsUploading(false);
      }
  };

  const handleCancelPendingMessages = async (listId: string) => {
    if (window.confirm("Are you sure you want to cancel all pending messages for this list?")) {
      try {
        await cancelPendingMessagesByList(listId);
        alert("Pending messages cancelled successfully.");
        onListsUpdate();
      } catch (err) {
        alert(`Error: ${err}`);
      }
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (window.confirm(`Are you sure you want to delete the list "${listName}"? This action cannot be undone.`)) {
      try {

        // Add list to deleted items list for persistence
        addDeletedList(listId);
        
        // Remove the list from local state immediately for instant UI feedback
        if (onListsLocalUpdate) {
          const updatedLists = jobLists.filter(list => list.id !== listId);

          onListsLocalUpdate(updatedLists);
        }
        
        // Show success message

        // Note: We don't call onListsUpdate() here because the backend doesn't support deletion
        // The list will remain in the backend but won't show in the UI
        
      } catch (error) {
        alert('❌ Failed to remove list from interface. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getApplicantCount = (list: JobList) => {
    // Use the transformed data structure that includes applicants array
    if (list.applicants && Array.isArray(list.applicants)) {
      return list.applicants.length;
    }
    // Fallback to candidateCount if applicants array is not available
    return list.candidateCount || 0;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-secondary-gray-light">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-primary-blue rounded-full"></div>
                <h2 className="text-gray-900 font-medium">Manage Lists ({jobLists.filter(list => list.status !== 'ARCHIVED' && list.status !== 'archived').length})</h2>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary-blue hover:bg-primary-blue-dark text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New List
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                    <DialogDescription>
                      Choose how you want to create your list and add candidates.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">

                    {/* List Name */}
                    <div>
                      <Label htmlFor="listName" className="text-sm font-medium">List Name *</Label>
                      <Input
                        id="listName"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter list name"
                        className="mt-1"
                      />
                    </div>

                    {/* List Description */}
                    <div>
                      <Label htmlFor="listDescription" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="listDescription"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                        placeholder="Enter list description (optional)"
                        className="mt-1"
                        rows={2}
                      />
                    </div>

                    {/* Phone Numbers Input */}
                    <div>
                      <Label htmlFor="phoneNumbers" className="text-sm font-medium">
                        Phone Numbers *
                        <span className="text-xs text-gray-500 ml-2">
                          (12-digit with country code, comma-separated)
                        </span>
                      </Label>
                      <Textarea
                        id="phoneNumbers"
                        value={phoneNumbers}
                        onChange={(e) => setPhoneNumbers(e.target.value)}
                        placeholder="918496952122, 918496952123, 918496952124"
                        className="mt-1"
                        rows={4}
                      />
                      <div className="mt-2 text-xs text-gray-600">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Format: 12-digit numbers with country code (e.g., 918496952122)
                      </div>
                    </div>

                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateList} 
                      disabled={isUploading || !newListName.trim()}
                      className="bg-primary-blue hover:bg-primary-blue-dark"
                    >
                      {isUploading ? 'Creating...' : 'Create List'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white">
            <div className="grid gap-4 p-4">
              {jobLists
                .filter(list => list.status !== 'ARCHIVED' && list.status !== 'archived')
                .map((list) => (
                <Card key={list.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{list.listName}</CardTitle>
                        <Badge className={getStatusColor(list.status || 'active')}>
                          {list.status || 'active'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSelectList(list.id)}
                          className="text-xs"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelPendingMessages(list.id)}
                          className="text-xs text-orange-600 border-orange-600 hover:bg-orange-50"
                          title="Cancel Pending Messages"
                        >
                          <ShieldX className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteList(list.id, list.name)}
                          className="text-xs text-red-600 border-red-600 hover:bg-red-50"
                          title="Delete List"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{getApplicantCount(list)} candidates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{list.createdAt ? new Date(list.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span>{list.status || 'active'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
            </div>
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
}
