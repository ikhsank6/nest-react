import { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

// Common icons that are most useful for navigation menus
const COMMON_ICONS = [
  'Home', 'LayoutDashboard', 'Users', 'Settings', 'FileText', 'Folder', 
  'Database', 'Shield', 'Lock', 'Key', 'Bell', 'Mail', 'MessageSquare',
  'Calendar', 'Clock', 'Search', 'Filter', 'BarChart', 'PieChart', 'LineChart',
  'Activity', 'TrendingUp', 'Zap', 'Star', 'Heart', 'Bookmark', 'Flag',
  'Tag', 'Hash', 'AtSign', 'Link', 'ExternalLink', 'Upload', 'Download',
  'Image', 'Camera', 'Video', 'Music', 'Mic', 'Volume2', 'Monitor',
  'Smartphone', 'Tablet', 'Laptop', 'Server', 'Cloud', 'Wifi', 'Globe',
  'Map', 'MapPin', 'Navigation', 'Compass', 'Send', 'Inbox', 'Archive',
  'Trash2', 'Edit', 'Pencil', 'Eraser', 'Copy', 'Clipboard', 'Check',
  'X', 'Plus', 'Minus', 'AlertCircle', 'AlertTriangle', 'Info', 'HelpCircle',
  'Eye', 'EyeOff', 'LogIn', 'LogOut', 'UserPlus', 'UserMinus', 'UserCheck',
  'Briefcase', 'Building', 'Building2', 'Store', 'ShoppingCart', 'ShoppingBag',
  'CreditCard', 'DollarSign', 'Wallet', 'Receipt', 'Package', 'Truck',
  'Box', 'Layers', 'Grid', 'List', 'LayoutGrid', 'LayoutList', 'Menu',
  'MoreHorizontal', 'MoreVertical', 'ChevronDown', 'ChevronUp', 'ChevronLeft', 'ChevronRight',
  'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'RefreshCw', 'RotateCcw',
  'Power', 'Play', 'Pause', 'Square', 'Circle', 'Triangle', 'Hexagon',
  'Code', 'Terminal', 'FileCode', 'GitBranch', 'Github', 'Gitlab',
  'Book', 'BookOpen', 'GraduationCap', 'Award', 'Trophy', 'Medal',
];

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icon = (LucideIcons as any)[iconName];
    return icon || null;
  };

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return COMMON_ICONS;
    const searchLower = search.toLowerCase();
    return COMMON_ICONS.filter(iconName => 
      iconName.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const SelectedIcon = value ? getIconComponent(value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span>Pilih icon...</span>
            )}
          </div>
          <LucideIcons.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex items-center border-b px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Cari icon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSearch('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-72">
          <div className="grid grid-cols-6 gap-1 p-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              if (!IconComponent) return null;
              
              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? "secondary" : "ghost"}
                  size="icon"
                  className={cn(
                    "h-10 w-10",
                    value === iconName && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch('');
                  }}
                  title={iconName}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Icon tidak ditemukan
            </div>
          )}
        </ScrollArea>
        {value && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Hapus Icon
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
