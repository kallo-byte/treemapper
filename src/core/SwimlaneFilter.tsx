import { ChevronDown } from 'lucide-react';
import type { Swimlane } from './types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface SwimlaneFilterProps {
  swimlanes: Swimlane[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function SwimlaneFilter({ swimlanes, selectedIds, onChange }: SwimlaneFilterProps) {
  const label =
    selectedIds.length === 0
      ? 'All swimlanes'
      : selectedIds.length === 1
        ? (swimlanes.find(sl => sl.id === selectedIds[0])?.name ?? '1 swimlane')
        : `${selectedIds.length} swimlanes`;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id],
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 h-8 px-3 text-sm border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors min-w-[160px] justify-between">
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 opacity-50 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel>Filter swimlanes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selectedIds.length === 0}
          onCheckedChange={() => onChange([])}
        >
          All swimlanes
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        {swimlanes.map(sl => (
          <DropdownMenuCheckboxItem
            key={sl.id}
            checked={selectedIds.includes(sl.id)}
            onCheckedChange={() => toggle(sl.id)}
          >
            {sl.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
