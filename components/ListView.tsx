import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { BulkActionButtons } from './BulkActionButtons';
import { X, Download, MessageCircle, Trash2 } from 'lucide-react';
import { Applicant, JobList } from '../types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction, removeApplicantFromAllLists } from '../src/services/api';
import { addDeletedApplicant } from '../src/services/deletedItemsManager';

interface ListViewProps {
  applicants: Applicant[];
  jobLists: JobList[];
  onDataUpdate: () => void;
  onApplicantsUpdate?: (updatedApplicants: Applicant[]) => void;
}

export function ListView({ applicants, jobLists, onDataUpdate, onApplicantsUpdate }: ListViewProps) {
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
    let filtered = applicants;
    
    // Apply list filters if any are selected
    if (selectedListFilters.size > 0) {
      filtered = applicants.filter(applicant => applicant.lists.some(listId => selectedListFilters.has(listId)));
    }
    
    // Sort by most recent first (using created_at, fallback to updated_at)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
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
    return status === 'active' ? 'bg-primary-blue text-white hover:bg-primary-blue-dark' : 'bg-red-500 text-white hover:bg-red-600';
  };

  const getListNames = (listIds: string[]) => {
    return listIds.map(id => jobLists.find(l => l.id === id)?.listName || id);
  };

  const formatConversationStatus = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; bgColor: string } } = {
      'NOT_INITIATED': { label: 'Not Started', color: 'text-gray-600', bgColor: 'bg-gray-100' },
      'INITIATED': { label: 'Started', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'DETAILS_IN_PROGRESS': { label: 'Collecting Details', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
      'DETAILS_COMPLETED': { label: 'Details Complete', color: 'text-green-600', bgColor: 'bg-green-100' },
      'MANDATE_MATCHING': { label: 'Finding Jobs', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'SHORTLISTED': { label: 'Shortlisted', color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
      'NO_MATCHES': { label: 'No Matches', color: 'text-red-600', bgColor: 'bg-red-100' },
      'PLACED': { label: 'Placed', color: 'text-green-700', bgColor: 'bg-green-200' },
      'RETIRED': { label: 'Retired', color: 'text-gray-700', bgColor: 'bg-gray-200' }
    };
    
    const statusInfo = statusMap[status] || { label: status, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    return statusInfo;
  };

  const handleDeleteSelected = async () => {
    const selectedCount = selectedApplicants.size;
    
    if (selectedCount === 0) {
      alert('Please select candidates to delete.');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedCount} selected candidate(s)? This action cannot be undone.`)) {
      try {

        // Get the selected candidate IDs
        const selectedIds = Array.from(selectedApplicants);

        // Add selected candidates to deleted items list for persistence
        selectedIds.forEach(applicantId => {
          addDeletedApplicant(applicantId);
        });
        
        // Clear selection
        setSelectedApplicants(new Set());
        
        // Remove deleted candidates from local state for instant UI update
        if (onApplicantsUpdate) {
          const updatedApplicants = applicants.filter(applicant => !selectedIds.includes(applicant.id));

          onApplicantsUpdate(updatedApplicants);
        }

      } catch (error) {
        console.error('Error deleting selected candidates:', error);
        alert('❌ Failed to delete selected candidates. Please try again.');
      }
    }
  };

  return (
    <div className="flex h-full bg-secondary-gray-light">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-blue rounded-full"></div>
              <h2 className="text-gray-900 font-medium">Applicants ({filteredApplicants.length}{selectedListFilters.size > 0 ? ` of ${applicants.length}` : ''})</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                const csvContent = [
                  "Phone No,Age,Gender,Education,Experience,Industry,Currently Employed,Home Location,Work Location,Expected Salary,Last Drawn Salary,Willing to Relocate,Conversation Status,Lists,Created At,Updated At,Response,Tags",
                  ...filteredApplicants.map(applicant => {
                    const lists = getListNames(applicant.lists).join(',');
                    const tags = applicant.tags.join(';');
                    return [
                      applicant.phone,
                      applicant.age || 'N/A',
                      applicant.gender || 'N/A',
                      applicant.education_qualification || 'N/A',
                      applicant.experience || 0,
                      applicant.industry || 'N/A',
                      applicant.is_currently_employed ? 'Yes' : 'No',
                      applicant.home_location || 'N/A',
                      applicant.work_location || 'N/A',
                      applicant.expected_salary || 'N/A',
                      applicant.last_drawn_salary || 'N/A',
                      applicant.willing_to_relocate ? 'Yes' : 'No',
                      formatConversationStatus(applicant.conversationStatus).label,
                      lists,
                      applicant.created_at,
                      applicant.updated_at,
                      `"${applicant.response.replace(/"/g, '""')}"`, // Escape quotes in response
                      tags
                    ].join(',');
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
              className="h-8 px-3 text-xs bg-primary-blue hover:bg-primary-blue-dark text-white border-primary-blue"
            >
              <Download className="h-3 w-3 mr-1" />
              Download CSV
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Filter by Lists:</span>
              {jobLists.map((list) => (
                <Button key={list.id} variant={selectedListFilters.has(list.id) ? 'default' : 'outline'} size="sm" onClick={() => handleListFilterToggle(list.id)} className={`h-7 text-xs ${selectedListFilters.has(list.id) ? 'bg-primary-blue hover:bg-primary-blue-dark text-white' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {list.listName}
                  <Badge variant="secondary" className="ml-1 text-xs bg-white/20">{applicants.filter(a => a.lists.includes(list.id)).length}</Badge>
                </Button>
              ))}
              {selectedListFilters.size > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 text-xs text-gray-500 hover:text-gray-700"><X className="h-3 w-3 mr-1" />Clear all</Button>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" />
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-sm text-gray-600 hover:text-primary-blue p-0 h-auto">{isAllSelected ? 'Deselect All' : 'Select All'}</Button>
            </div>
          </div>
        </div>

        {selectedApplicants.size > 0 && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedApplicants.size} candidate(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BulkActionButtons
                  selectedCount={selectedApplicants.size}
                  onBulkDisable={() => handleBulkAction('disable')}
                  onBulkNudge={() => handleBulkAction('nudge')}
                  onBulkRemoveFromList={(listId) => handleBulkAction('removeFromList', listId)}
                  onBulkTag={(listId) => handleBulkAction('tag', listId)}
                  availableLists={availableLists}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="h-8 px-3 text-xs bg-red-500 hover:bg-red-600 text-white border-red-500"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Phone No</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Currently Employed</TableHead>
                <TableHead>Home Location</TableHead>
                <TableHead>Work Location</TableHead>
                <TableHead>Expected Salary</TableHead>
                <TableHead>Last Salary</TableHead>
                <TableHead>Relocate</TableHead>
                <TableHead>Conversation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-gray-50">
                  <TableCell className="w-12"><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" /></TableCell>
                  <TableCell className="font-medium w-32">{applicant.phone}</TableCell>
                  <TableCell className="w-16">{applicant.age || 'N/A'}</TableCell>
                  <TableCell className="w-20">{applicant.gender || 'N/A'}</TableCell>
                  <TableCell className="w-20">{applicant.education_qualification || 'N/A'}</TableCell>
                  <TableCell className="w-20">{applicant.experience || 0} yrs</TableCell>
                  <TableCell className="w-20">{applicant.industry || 'N/A'}</TableCell>
                  <TableCell className="w-20">{applicant.is_currently_employed ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="w-24">
                    <div className="text-xs leading-tight break-all">
                      {applicant.home_location || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="w-24">
                    <div className="text-xs leading-tight break-all">
                      {applicant.work_location || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="w-24">₹{applicant.expected_salary || 'N/A'}</TableCell>
                  <TableCell className="w-24">₹{applicant.last_drawn_salary || 'N/A'}</TableCell>
                  <TableCell className="w-16">{applicant.willing_to_relocate ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="w-24">
                    <div className="text-xs leading-tight break-all">
                      {(() => {
                        const statusInfo = formatConversationStatus(applicant.conversationStatus);
                        return (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusInfo.color} ${statusInfo.bgColor} border-current`}
                          >
                            {statusInfo.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-20">
                    <div className="flex gap-1 justify-end">
                      {/* WhatsApp Web Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('waWeb', applicant.id)}
                        className="h-8 px-2 text-xs bg-primary-blue hover:bg-primary-blue-dark text-white border-primary-blue"
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