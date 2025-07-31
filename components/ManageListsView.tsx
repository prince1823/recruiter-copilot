import { useState } from 'react';
import Papa from 'papaparse';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Plus, Edit, Trash2, Calendar, Users, CheckCircle, Upload, ShieldX } from 'lucide-react'; // Added ShieldX
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip'; // Added Tooltip components
import { JobList } from '../types';
import { createList, updateList, deleteList, createListFromCSV, cancelPendingMessagesByList } from '../src/services/api'; // Corrected import path
import { Label } from './ui/label';

interface ManageListsViewProps {
  jobLists: JobList[];
  onListsUpdate: () => void;
  onSelectList: (listId: string) => void;
}

export function ManageListsView({ jobLists, onListsUpdate, onSelectList }: ManageListsViewProps) {
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<JobList | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, any>[] | null>(null);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetCreateDialog = () => {
    setNewListName('');
    setCsvData(null);
    setCsvFileName(null);
    setIsUploading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data as Record<string, any>[]);
        },
        error: (error: any) => {
          alert("Failed to parse CSV file.");
          setCsvData(null);
          setCsvFileName(null);
        }
      });
    }
  };
  
  const handleCreateList = async () => {
      if (!newListName.trim()) {
          alert("Please enter a list name.");
          return;
      }
      setIsUploading(true);
      try {
        if (csvData && csvData.length > 0) {
            const response = await createListFromCSV(newListName.trim(), csvData);
            alert(response.message);
        } else {
            await createList(newListName.trim());
            alert(`List '${newListName.trim()}' created successfully.`);
        }
        onListsUpdate();
        setIsCreateDialogOpen(false);
        resetCreateDialog();
      } catch (err) {
        console.error("Failed to create list:", err);
        alert(`Error: ${err}`);
      } finally {
        setIsUploading(false);
      }
  };

  const handleEditList = async () => {
    if (editingList && editingList.listName.trim()) {
      try {
        await updateList(editingList.id, editingList.listName.trim());
        onListsUpdate();
        setEditingList(null);
        setIsEditDialogOpen(false);
      } catch (err) {
        alert(`Error updating list: ${err}`);
      }
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
        try {
            await deleteList(listId);
            onListsUpdate();
        } catch (err) {
            alert(`Error deleting list: ${err}`);
        }
    }
  };

  // ** NEW HANDLER for Cancel Send **
  const handleCancelPending = async (listId: string, listName: string) => {
    if (window.confirm(`Are you sure you want to cancel all PENDING messages for candidates in the "${listName}" list?`)) {
      try {
        const response = await cancelPendingMessagesByList(listId);
        alert(response.message); // Show success message from backend
      } catch (err) {
        alert(`Error canceling messages: ${err}`);
      }
    }
  };

  const getCompletionRate = (list: JobList) => {
    if (list.candidateCount === 0) return 0;
    return Math.round((list.completedConversations / list.candidateCount) * 100);
  };

  return (
    <TooltipProvider>
      <div className="flex h-full bg-whatsapp-gray-light">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2"><div className="w-1 h-6 bg-whatsapp-green rounded-full"></div><h2 className="text-gray-900 font-medium">Manage Lists ({jobLists.length})</h2></div>
              <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) resetCreateDialog(); setIsCreateDialogOpen(isOpen); }}>
                <DialogTrigger asChild><Button className="flex items-center gap-2 bg-whatsapp-green hover:bg-whatsapp-green-dark text-white"><Plus className="h-4 w-4" />Create New List</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create New List</DialogTitle><DialogDescription>Create a list by name, or upload a CSV to add candidates at the same time.</DialogDescription></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="listName">List Name (Required)</Label><Input id="listName" placeholder="e.g., Delivery Candidates - Q3" value={newListName} onChange={(e) => setNewListName(e.target.value)} /></div>
                    <div className="space-y-2"><Label htmlFor="csv-upload">Add Candidates from CSV (Optional)</Label><Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" /><Button variant="outline" className="w-full" onClick={() => document.getElementById('csv-upload')?.click()}><Upload className="h-4 w-4 mr-2" />Select .csv File</Button>{csvFileName && <p className="text-sm text-muted-foreground mt-2">File selected: {csvFileName}</p>}</div>
                  </div>
                  <DialogFooter><Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateList} disabled={!newListName || isUploading} className="bg-whatsapp-green hover:bg-whatsapp-green-dark">{isUploading ? "Creating..." : "Create List"}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="grid grid-cols-4 gap-4"><Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Lists</p><p className="text-2xl font-bold">{jobLists.length}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total Candidates</p><p className="text-2xl font-bold">{jobLists.reduce((sum, list) => sum + list.candidateCount, 0)}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-gray-600">Completed Conversations</p><p className="text-2xl font-bold">{jobLists.reduce((sum, list) => sum + list.completedConversations, 0)}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-gray-600">Avg Completion Rate</p><p className="text-2xl font-bold">{jobLists.length > 0 ? Math.round(jobLists.reduce((sum, list) => sum + getCompletionRate(list), 0) / jobLists.length) : 0}%</p></CardContent></Card></div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            <Table>
              <TableHeader><TableRow className="bg-gray-50 hover:bg-gray-50"><TableHead>List Name</TableHead><TableHead>Creation Date</TableHead><TableHead>Candidates</TableHead><TableHead>Completion Rate</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {jobLists.map((list) => (
                  <TableRow key={list.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium cursor-pointer hover:text-whatsapp-green hover:underline" onClick={() => onSelectList(list.id)}>{list.listName}</TableCell>
                    <TableCell>{new Date(list.creationDate).toLocaleDateString()}</TableCell>
                    <TableCell><Badge variant="outline" className="border-whatsapp-green text-whatsapp-green">{list.candidateCount}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-whatsapp-green" style={{ width: `${getCompletionRate(list)}%` }}/></div>
                        <span className="text-sm text-gray-600">{getCompletionRate(list)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleCancelPending(list.id, list.listName)} className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600"><ShieldX className="h-4 w-4" /></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Cancel pending messages for this list</p></TooltipContent>
                        </Tooltip>
                        <Dialog open={isEditDialogOpen && editingList?.id === list.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild><Button variant="ghost" size="sm" onClick={() => setEditingList({ ...list })} className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"><Edit className="h-3 w-3" /></Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit List</DialogTitle></DialogHeader>
                            <div className="space-y-4"><Label>List Name</Label><Input value={editingList?.listName || ''} onChange={(e) => setEditingList(editingList ? { ...editingList, listName: e.target.value } : null)} onKeyPress={(e) => e.key === 'Enter' && handleEditList()}/></div>
                            <DialogFooter><Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button><Button onClick={handleEditList} className="bg-whatsapp-green hover:bg-whatsapp-green-dark">Save Changes</Button></DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteList(list.id)} className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}