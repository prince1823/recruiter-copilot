import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ActionButtons } from './ActionButtons';
import { BulkActionButtons } from './BulkActionButtons';
import { X, Download, MessageCircle, ListPlus } from 'lucide-react';
import { Applicant, JobList } from '../types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction, removeApplicantFromAllLists } from '../src/services/api';

interface ListViewProps {
  applicants: Applicant[];
  jobLists: JobList[];
  onDataUpdate: () => void;
}

export function ListView({ applicants, jobLists, onDataUpdate }: ListViewProps) {
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [selectedListFilters, setSelectedListFilters] = useState<Set<string>>(new Set());

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
                        console.warn('⚠️ Remove from all lists had issues:', result.message);
                        // Don't fail the entire operation, just log the warning
                    }
                } else { return; }
                break;
            case 'waWeb':
                window.open(`https://web.whatsapp.com/send?phone=${applicant.phone.replace(/\D/g, '')}`, '_blank');
                break;
        }
        onDataUpdate();
    } catch(err) {
        console.error(`Failed to perform action: ${action}`, err);
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
        console.error(`Failed to perform bulk action: ${action}`, err);
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

  const filteredApplicants = useMemo(() => {
    if (selectedListFilters.size === 0) return applicants;
    return applicants.filter(applicant => applicant.lists.some(listId => selectedListFilters.has(listId)));
  }, [applicants, selectedListFilters]);
  
  const handleSelectAll = () => {
    if (selectedApplicants.size === filteredApplicants.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(filteredApplicants.map(a => a.id)));
    }
  };

  const handleListFilterToggle = (listId: string) => {
    const newFilters = new Set(selectedListFilters);
    if (newFilters.has(listId)) newFilters.delete(listId);
    else newFilters.add(listId);
    setSelectedListFilters(newFilters);
  };

  const clearAllFilters = () => setSelectedListFilters(new Set());
  const availableLists = jobLists.map(list => ({ id: list.id, name: list.listName }));
  const isAllSelected = selectedApplicants.size === filteredApplicants.length && filteredApplicants.length > 0;
  
  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark' : 'bg-red-500 text-white hover:bg-red-600';
  };

  const getListNames = (listIds: string[]) => {
    return listIds.map(id => jobLists.find(l => l.id === id)?.listName || id);
  };

  return (
    <div className="flex h-full bg-whatsapp-gray-light">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-whatsapp-green rounded-full"></div>
              <h2 className="text-gray-900 font-medium">Applicants ({filteredApplicants.length}{selectedListFilters.size > 0 ? ` of ${applicants.length}` : ''})</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const csvContent = [
                  "Name,Phone,Location,Experience,Two Wheeler,Status,Conversation,Lists",
                  ...filteredApplicants.map(applicant => {
                    const lists = getListNames(applicant.lists).join(',');
                    return `${applicant.name},${applicant.phone},${applicant.location},${applicant.experience},${applicant.hasTwoWheeler ? 'Yes' : 'No'},${applicant.status},${applicant.hasCompletedConversation ? 'Complete' : 'Ongoing'},${lists}`;
                  })
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `applicants_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }} 
              className="h-8 px-3 text-xs bg-whatsapp-green hover:bg-whatsapp-green-dark text-white border-whatsapp-green"
            >
              <Download className="h-3 w-3 mr-1" />
              Download CSV
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filter by Lists:</span>
              {jobLists.map((list) => (
                <Button key={list.id} variant={selectedListFilters.has(list.id) ? 'default' : 'outline'} size="sm" onClick={() => handleListFilterToggle(list.id)} className={`h-7 text-xs ${selectedListFilters.has(list.id) ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark text-white' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {list.listName}
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">{applicants.filter(a => a.lists.includes(list.id)).length}</Badge>
                </Button>
              ))}
              {selectedListFilters.size > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs text-gray-500 hover:text-gray-700"><X className="h-3 w-3 mr-1" />Clear all</Button>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-whatsapp-green data-[state=checked]:border-whatsapp-green" />
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-whatsapp-green p-0 h-auto">{isAllSelected ? 'Deselect All' : 'Select All'}</Button>
            </div>
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

        <div className="flex-1 overflow-y-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Two Wheeler</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conversation</TableHead>
                <TableHead>Lists</TableHead>
                <TableHead>Last Message</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-gray-50">
                  <TableCell><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} className="data-[state=checked]:bg-whatsapp-green data-[state=checked]:border-whatsapp-green" /></TableCell>
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell>{applicant.phone}</TableCell>
                  <TableCell>{applicant.location}</TableCell>
                  <TableCell>{applicant.experience} years</TableCell>
                  <TableCell><Badge variant={applicant.hasTwoWheeler ? 'default' : 'outline'} className={applicant.hasTwoWheeler ? 'bg-whatsapp-green hover:bg-whatsapp-green-dark' : ''}>{applicant.hasTwoWheeler ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${getStatusBadgeClass(applicant.status)}`}>{applicant.status}</Badge></TableCell>
                  <TableCell><Badge variant={applicant.hasCompletedConversation ? 'default' : 'outline'} className={applicant.hasCompletedConversation ? 'bg-green-500 hover:bg-green-600' : ''}>{applicant.hasCompletedConversation ? 'Complete' : 'Ongoing'}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getListNames(applicant.lists).slice(0, 2).map((listName, index) => <Badge key={index} variant="outline" className="text-xs border-whatsapp-green text-whatsapp-green">{listName}</Badge>)}
                      {applicant.lists.length > 2 && <Badge variant="outline" className="text-xs">+{applicant.lists.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div><p className="text-sm truncate">{applicant.lastMessage}</p><p className="text-xs text-gray-500">{applicant.lastMessageTime}</p></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {/* WhatsApp Web Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('waWeb', applicant.id)}
                        className="h-8 px-2 text-xs bg-green-500 hover:bg-green-600 text-white border-green-500"
                        title="Open WhatsApp Web"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}