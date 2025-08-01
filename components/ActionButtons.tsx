import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from './ui/dropdown-menu';
// ** NEW: Imported UserCheck icon **
import { UserX, MessageSquare, Tag, ChevronDown, UserMinus, UserCheck } from 'lucide-react';

interface ActionButtonsProps {
  // ** UPDATED: Renamed for clarity **
  onToggleStatus: () => void;
  onNudge: () => void;
  onRemoveFromList: () => void;
  onTag: (listId: string) => void;
  // ** NEW: Added status prop **
  status: 'active' | 'disabled';
  size?: 'sm' | 'default';
  showLabels?: boolean;
  availableLists?: { id: string; name: string; }[];
}

export function ActionButtons({ 
  onToggleStatus,
  onNudge, 
  onRemoveFromList,
  onTag,
  status,
  size = 'sm',
  showLabels = true,
  availableLists = []
}: ActionButtonsProps) {
  const buttonClass = showLabels ? "h-8 px-3 gap-1.5" : "h-8 px-2";
  
  return (
    <TooltipProvider>
      <div className="flex gap-1.5">

        {/* ** UPDATED: This button is now a conditional toggle ** */}
        {status === 'active' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size={size} 
                onClick={onToggleStatus}
                className={`${buttonClass} border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700`}
              >
                <UserX className="h-3 w-3" />
                {showLabels && <span className="text-xs">Disable</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Disable candidate</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size={size} 
                onClick={onToggleStatus}
                className={`${buttonClass} border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700`}
              >
                <UserCheck className="h-3 w-3" />
                {showLabels && <span className="text-xs">Enable</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enable candidate</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={size} 
              onClick={onNudge}
              className={`${buttonClass} border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700`}
            >
              <MessageSquare className="h-3 w-3" />
              {showLabels && <span className="text-xs">Nudge</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send nudge message</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size={size}
                  className={`${buttonClass} border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700`}
                >
                  <Tag className="h-3 w-3" />
                  {showLabels && <span className="text-xs">Tag</span>}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Tag candidate to list</TooltipContent>
          </Tooltip>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" className="z-50">
              {availableLists.map((list) => (
                <DropdownMenuItem
                  key={list.id}
                  onClick={() => onTag(list.id)}
                  className="focus:bg-accent"
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
          </DropdownMenuPortal>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size={size} 
              onClick={onRemoveFromList}
              className={`${buttonClass} border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700`}
            >
              <UserMinus className="h-3 w-3" />
              {showLabels && <span className="text-xs">Remove</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove from all lists</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}