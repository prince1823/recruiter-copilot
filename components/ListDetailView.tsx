import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { ActionButtons } from './ActionButtons';
import { BulkActionButtons } from './BulkActionButtons';
import { ArrowLeft } from 'lucide-react';
import { Applicant, JobList } from '../types';
import { bulkUpdateCandidateStatus, manageCandidatesInList, bulkSendAction } from '../src/services/api';

interface ListDetailViewProps {
  listId: string;
  allApplicants: Applicant[];
  allJobLists: JobList[];
  onDataUpdate: () => void;
  onBack: () => void;
}

export function ListDetailView({ listId, allApplicants, allJobLists, onDataUpdate, onBack }: ListDetailViewProps) {
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());

  const currentList = useMemo(() => allJobLists.find(list => list.id === listId), [allJobLists, listId]);

  const applicantsInList = useMemo(() => {
    return allApplicants.filter(applicant => applicant.lists.includes(listId));
  }, [allApplicants, listId]);

  const handleAction = async (action: string, applicantId: string, actionListId?: string) => {
    try {
      const applicant = allApplicants.find(a => a.id === applicantId);
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
          if (actionListId) await manageCandidatesInList(actionListId, [applicantId], 'add');
          break;
        case 'removeFromList':
          // In this view, "remove" specifically means from the current list.
          if (window.confirm(`Are you sure you want to remove this candidate from the "${currentList?.listName}" list?`)) {
            await manageCandidatesInList(listId, [applicantId], 'remove');
          } else { return; }
          break;
      }
      onDataUpdate();
    } catch(err) {
      console.error(`Failed to perform action: ${action}`, err);
      alert(`Error: Could not perform action.`);
    }
  };

  const handleBulkAction = async (action: string, actionListId?: string) => {
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
          if (actionListId) await manageCandidatesInList(actionListId, selectedIds, 'add');
          break;
        case 'removeFromList':
           if (actionListId) await manageCandidatesInList(actionListId, selectedIds, 'remove');
          break;
      }
      setSelectedApplicants(new Set());
      onDataUpdate();
    } catch (err) {
      console.error(`Failed to perform bulk action: ${action}`, err);
      alert(`Error: Could not perform bulk action.`);
    }
  };

  const handleSelectApplicant = (applicantId: string, checked: boolean) => {
    const newSelected = new Set(selectedApplicants);
    if (checked) newSelected.add(applicantId);
    else newSelected.delete(applicantId);
    setSelectedApplicants(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApplicants.size === applicantsInList.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(applicantsInList.map(a => a.id)));
    }
  };

  const isAllSelected = selectedApplicants.size === applicantsInList.length && applicantsInList.length > 0;
  const availableLists = allJobLists.map(list => ({ id: list.id, name: list.listName }));

  const getStatusBadgeClass = (status: string) => status === 'active' ? 'bg-whatsapp-green text-white' : 'bg-red-500 text-white';

  if (!currentList) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>List not found.</p>
        <Button onClick={onBack} variant="link">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-whatsapp-gray-light">
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-gray-900 font-medium text-lg">{currentList.listName}</h2>
                <p className="text-sm text-gray-500">{applicantsInList.length} Applicants</p>
              </div>
            </div>
          </div>
           <div className="flex items-center gap-2">
              <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} id="select-all-detail"/>
              <label htmlFor='select-all-detail' className="text-sm text-gray-600 cursor-pointer">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </label>
            </div>
        </div>

        {selectedApplicants.size > 0 && (
          <div className="p-4 border-b border-gray-200">
            <BulkActionButtons
              selectedCount={selectedApplicants.size}
              onBulkDisable={() => handleBulkAction('disable')}
              onBulkNudge={() => handleBulkAction('nudge')}
              onBulkRemoveFromList={(actionListId) => handleBulkAction('removeFromList', actionListId)}
              onBulkTag={(actionListId) => handleBulkAction('tag', actionListId)}
              availableLists={availableLists}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white">
          <Table>
            <TableHeader><TableRow className="bg-gray-50"><TableHead className="w-12"></TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Location</TableHead><TableHead>Experience</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {applicantsInList.map((applicant) => (
                <TableRow key={applicant.id} className="hover:bg-gray-50">
                  <TableCell><Checkbox checked={selectedApplicants.has(applicant.id)} onCheckedChange={(c) => handleSelectApplicant(applicant.id, c as boolean)} /></TableCell>
                  <TableCell className="font-medium">{applicant.name}</TableCell>
                  <TableCell>{applicant.phone}</TableCell>
                  <TableCell>{applicant.location}</TableCell>
                  <TableCell>{applicant.experience} years</TableCell>
                  <TableCell><Badge className={getStatusBadgeClass(applicant.status)}>{applicant.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {/* ** UPDATED: Passing status prop and using onToggleStatus ** */}
                    <ActionButtons
                      status={applicant.status}
                      onToggleStatus={() => handleAction('toggleStatus', applicant.id)}
                      onNudge={() => handleAction('nudge', applicant.id)}
                      onRemoveFromList={() => handleAction('removeFromList', applicant.id)}
                      onTag={(actionListId) => handleAction('tag', applicant.id, actionListId)}
                      availableLists={availableLists}
                      showLabels={false}
                    />
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