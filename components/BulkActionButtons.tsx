import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { UserX, MessageSquare, Tag, ChevronDown, UserMinus } from 'lucide-react';

interface BulkActionButtonsProps {
  selectedCount: number;
  onBulkDisable: () => void;
  onBulkNudge: () => void;
  onBulkRemoveFromList: (listId: string) => void;
  onBulkTag: (listId: string) => void;
  availableLists?: { id: string; name: string; }[];
  disabled?: boolean;
}

export function BulkActionButtons({ 
  selectedCount,
  onBulkDisable, 
  onBulkNudge, 
  onBulkRemoveFromList,
  onBulkTag, 
  availableLists = [],
  disabled = false
}: BulkActionButtonsProps) {
  const isDisabled = disabled || selectedCount === 0;
  
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 p-3 bg-whatsapp-green-light border border-whatsapp-green rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} selected
        </span>
        
        <div className="flex gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkDisable}
                disabled={isDisabled}
                className="h-8 px-3 gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50"
              >
                <UserX className="h-3 w-3" />
                <span className="text-xs">Disable</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disable selected candidates</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBulkNudge}
                disabled={isDisabled}
                className="h-8 px-3 gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50"
              >
                <MessageSquare className="h-3 w-3" />
                <span className="text-xs">Nudge</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send nudge to selected candidates</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isDisabled}
                    className="h-8 px-3 gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 disabled:opacity-50"
                  >
                    <Tag className="h-3 w-3" />
                    <span className="text-xs">Tag</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Tag selected candidates to list</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {availableLists.map((list) => (
                <DropdownMenuItem 
                  key={list.id}
                  onClick={() => onBulkTag(list.id)}
                  disabled={isDisabled}
                >
                  {list.name}
                </DropdownMenuItem>
              ))}
              {availableLists.length === 0 && (
                <DropdownMenuItem disabled>
                  No lists available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={isDisabled}
                    className="h-8 px-3 gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 disabled:opacity-50"
                  >
                    <UserMinus className="h-3 w-3" />
                    <span className="text-xs">Remove</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Remove selected candidates from list</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              {availableLists.map((list) => (
                <DropdownMenuItem 
                  key={list.id}
                  onClick={() => onBulkRemoveFromList(list.id)}
                  disabled={isDisabled}
                >
                  {list.name}
                </DropdownMenuItem>
              ))}
              {availableLists.length === 0 && (
                <DropdownMenuItem disabled>
                  No lists available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}