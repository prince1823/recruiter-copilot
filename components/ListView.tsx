import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { BulkActionButtons } from './BulkActionButtons';
import { X, Download, MessageCircle } from 'lucide-react';
import { LegacyApplicant as Applicant, LegacyJobList as JobList } from '../src/types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction, removeApplicantFromAllLists } from '../src/services/api';

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

  const getConversationStatusBadgeClass = (conversationStatus: string) => { 
    switch (conversationStatus) { 
      case 'MANDATE_MATCHING': return 'bg-green-500 text-white hover:bg-green-600'; 
      case 'DETAILS_COMPLETED': return 'bg-blue-500 text-white hover:bg-blue-600'; 
      case 'DETAILS_IN_PROGRESS': return 'bg-purple-500 text-white hover:bg-purple-600'; 
      case 'INITIATED': return 'bg-yellow-500 text-white hover:bg-yellow-600'; 
      case 'NOT_MATCHING': return 'bg-red-300 text-red-800 hover:bg-red-400';
      case 'NO_MATCHES': return 'bg-red-300 text-red-800 hover:bg-red-400'; 
      case 'NOT_INITIATED': return 'bg-slate-400 text-white hover:bg-slate-500'; 
      default: return 'bg-gray-400 text-white hover:bg-gray-500'; 
    } 
  };

  return (
    <div className="flex h-full bg-secondary-gray-light">
      <div className="flex-1 flex flex-col">
        <div className="p-2 sm:p-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-blue rounded-full"></div>
              <h2 className="text-gray-900 font-medium text-sm sm:text-base">Applicants ({filteredApplicants.length}{selectedListFilters.size > 0 ? ` of ${applicants.length}` : ''})</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs bg-primary-blue hover:bg-primary-blue-dark text-white border-primary-blue w-full sm:w-auto"
              onClick={() => {
                // Define only the columns visible in the table view
                const columnOrder = [
                  'Phone No',
                  'Location', 
                  'Age',
                  'Gender',
                  'Expected Salary',
                  'Education Qualification',
                  'Willing to Relocate',
                  'Home Location',
                  'Work Location',
                  'Industry',
                  'Conversation Status',
                  'Experience',
                  'Status',
                  'Lists',
                  'Created At',
                  'Updated At',
                  'Currently Employed',
                  'Last Drawn Salary',
                  'Tags'
                ];

                const csvContent = [
                  columnOrder.join(','),
                  ...filteredApplicants.map(applicant => {
                    const lists = getListNames(applicant.lists).join(',');
                    const tags = applicant.tags.join(';');
                    
                    // Create data object with all fields
                    const data = {
                      'Phone No': applicant.phone,
                      'Location': applicant.location || '',
                      'Age': applicant.age || '',
                      'Gender': applicant.gender || '',
                      'Expected Salary': applicant.expected_salary || '',
                      'Education Qualification': applicant.education_qualification || '',
                      'Willing to Relocate': applicant.willing_to_relocate === null ? '' : (applicant.willing_to_relocate ? 'Yes' : 'No'),
                      'Home Location': applicant.home_location || '',
                      'Work Location': applicant.work_location || '',
                      'Experience': applicant.experience || 0,
                      'Industry': applicant.industry || '',
                      'Currently Employed': applicant.is_currently_employed ? 'Yes' : 'No',
                      'Last Drawn Salary': applicant.last_drawn_salary || '',
                      'Status': applicant.status || '',
                      'Conversation Status': applicant.conversationStatus || '',
                      'Lists': lists,
                      'Created At': applicant.created_at,
                      'Updated At': applicant.updated_at,
                      'Tags': tags,
                    
                    };
                    
                    // Return data in the specified column order
                    return columnOrder.map(column => data[column as keyof typeof data] || '').join(',');
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
            >
              <Download className="h-3 w-3 mr-1" />
              Download CSV
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by Lists:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {jobLists.map((list) => (
                  <Button key={list.id} variant={selectedListFilters.has(list.id) ? 'default' : 'outline'} size="sm" onClick={() => handleListFilterToggle(list.id)} className={`h-6 sm:h-7 text-xs ${selectedListFilters.has(list.id) ? 'bg-primary-blue hover:bg-primary-blue-dark text-white' : 'border-gray-300 hover:bg-gray-50'}`}>
                    <span className="hidden sm:inline">{list.listName}</span>
                    <span className="sm:hidden">{list.listName.length > 8 ? list.listName.substring(0, 8) + '...' : list.listName}</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-white/20">{applicants.filter(a => a.lists.includes(list.id)).length}</Badge>
                  </Button>
                ))}
                {selectedListFilters.size > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-6 sm:h-7 text-xs text-gray-500 hover:text-gray-700"><X className="h-3 w-3 mr-1" />Clear all</Button>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" />
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs sm:text-sm text-gray-600 hover:text-primary-blue p-0 h-auto">{isAllSelected ? 'Deselect All' : 'Select All'}</Button>
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
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-white">
          <div className="overflow-x-auto">
            <Table className="min-w-full" style={{ minWidth: '800px' }}>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-8 sm:w-12"></TableHead>
                <TableHead className="min-w-[120px]">Phone No</TableHead>
                <TableHead className="w-12 sm:w-16">Age</TableHead>
                <TableHead className="w-16 sm:w-20">Gender</TableHead>
                <TableHead className="min-w-[100px]">Expected Salary</TableHead>
                <TableHead className="min-w-[80px]">Education</TableHead>
                <TableHead className="w-16 sm:w-20">Relocate</TableHead>
                <TableHead className="min-w-[80px]">Home Location</TableHead>
                <TableHead className="w-16 sm:w-20">Status</TableHead>
                <TableHead className="min-w-[100px]">Conversation</TableHead>
                <TableHead className="w-16 sm:w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplicants.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-gray-50">
                  <TableCell className="w-8 sm:w-12"><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(checked) => handleSelectApplicant(applicant.id, checked as boolean)} className="data-[state=checked]:bg-primary-blue data-[state=checked]:border-primary-blue" /></TableCell>
                  <TableCell className="font-medium min-w-[120px] text-xs sm:text-sm">{applicant.phone}</TableCell>
                  <TableCell className="w-12 sm:w-16 text-xs sm:text-sm">{applicant.age || ''}</TableCell>
                  <TableCell className="w-16 sm:w-20 text-xs sm:text-sm">{applicant.gender || ''}</TableCell>
                  <TableCell className="min-w-[100px] text-xs sm:text-sm">{applicant.expected_salary ? `₹${applicant.expected_salary}` : ''}</TableCell>
                  <TableCell className="min-w-[80px] text-xs sm:text-sm">{applicant.education_qualification || ''}</TableCell>
                  <TableCell className="w-16 sm:w-20 text-xs sm:text-sm">{applicant.willing_to_relocate === null ? '' : (applicant.willing_to_relocate ? 'Yes' : 'No')}</TableCell>
                   <TableCell className="min-w-[80px]">
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <div className="text-xs leading-tight cursor-help truncate">
                           {(() => {
                             const location = applicant.home_location || '';
                             if (!location) return '';
                             return location.length > 10 ? location.substring(0, 10) + '...' : location;
                           })()}
                         </div>
                       </TooltipTrigger>
                       <TooltipContent side="top" className="z-50 bg-blue-600 text-white border-blue-600 shadow-lg">
                         <p className="max-w-xs break-words text-xs font-medium">
                           {(() => {
                             const location = applicant.home_location || '';
                             if (!location) return '';
                             return location.length > 15 ? location.substring(0, 15) + '...' : location;
                           })()}
                         </p>
                       </TooltipContent>
                     </Tooltip>
                   </TableCell>
                  <TableCell className="w-16 sm:w-20">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${applicant.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}
                    >
                      {applicant.status || ''}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-[100px]">
                    <div className="text-xs leading-tight break-all">
                      <Badge className={`text-xs ${getConversationStatusBadgeClass(applicant.conversationStatus)}`}>
                        {applicant.conversationStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right w-16 sm:w-20">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAction('waWeb', applicant.id)}
                      className="h-6 sm:h-8 px-2 sm:px-3 text-xs bg-green-500 hover:bg-green-600 text-white border-green-500"
                      title="Open WhatsApp"
                    >
                      <MessageCircle className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline"></span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}