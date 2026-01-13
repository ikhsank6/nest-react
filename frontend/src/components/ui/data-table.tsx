import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  LayoutList,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Lock,
  GripVertical,
  X,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { ActionButton } from "@/components/ui/action-button"

// Column definition
export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

// Action handlers
export interface TableActions<T> {
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  customActions?: Array<{
    label: string
    onClick: (item: T) => void
    icon: any // Can be Lucide icon name or component
    variant?: "default" | "secondary" | "destructive" | "ghost"
    className?: string
    showCondition?: (item: T) => boolean
  }>
}

// Status filter configuration
export interface StatusFilterConfig {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

interface DataTableProps<T> {
  // Header section
  title?: string
  description?: string
  headerAction?: React.ReactNode
  // Data
  data: T[]
  columns: Column<T>[]
  actions?: TableActions<T>
  loading?: boolean
  // Search & Filters
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  statusFilter?: StatusFilterConfig
  onRefresh?: () => void
  // Messages
  emptyMessage?: string
  loadingMessage?: string
  isError?: boolean
  errorMessage?: string
  // Pagination
  keyExtractor: (item: T) => string
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  itemsPerPage?: number

  onItemsPerPageChange?: (value: number) => void
  onReorder?: (newOrder: T[]) => void
  onReparent?: (itemId: string, newParentId: string | null) => void
  canBeParent?: (item: T) => boolean
  showViewToggle?: boolean
  className?: string
}

// Sortable Row Component
function SortableTableRow({ children, id, className, isDropTarget, ...props }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? "relative" : undefined,
  } as React.CSSProperties;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        className, 
        isDragging && "bg-muted/50 shadow-md",
        isOver && isDropTarget && "ring-2 ring-primary ring-inset bg-primary/10"
      )}
      {...props}
    >
      <TableCell className="w-[50px] px-2 text-center cursor-move" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-muted-foreground/50 mx-auto" />
      </TableCell>
      {children}
    </TableRow>
  );
}

// Sortable Grid Card Component
function SortableGridCard({ children, id, className, isDropTarget, ...props }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        isDragging && "opacity-50 shadow-2xl scale-105",
        isOver && isDropTarget && "ring-2 ring-primary ring-inset bg-primary/10"
      )}
      {...props}
    >
      <div 
        className="absolute top-2 left-2 cursor-move p-1 rounded hover:bg-muted/50 z-10"
        {...attributes} 
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/50" />
      </div>
      {children}
    </div>
  );
}

export function DataTable<T>({
  title,
  description,
  headerAction,
  data,
  columns,
  actions,
  loading = false,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  statusFilter,
  onRefresh,
  emptyMessage = "No data found.",
  loadingMessage = "Loading...",
  isError = false,
  errorMessage = "Gagal memuat data.",
  keyExtractor,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  onItemsPerPageChange,

  onReorder,
  onReparent,
  canBeParent,
  showViewToggle = true,
  className,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table')
  const [goToPage, setGoToPage] = React.useState('')
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (_event: DragOverEvent) => {
    // Just for visual feedback - handled by useSortable's isOver
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const overItem = data.find((item) => keyExtractor(item) === over.id);
      
      // Check if dropping onto a parent-capable item (for reparenting)
      if (onReparent && overItem && canBeParent?.(overItem)) {
        // Reparent: make active item a child of over item
        onReparent(active.id as string, over.id as string);
        return;
      }
      
      // Regular reorder
      const oldIndex = data.findIndex((item) => keyExtractor(item) === active.id);
      const newIndex = data.findIndex((item) => keyExtractor(item) === over.id);
      
      const newData = arrayMove(data, oldIndex, newIndex);
      onReorder?.(newData);
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(goToPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page)
      setGoToPage('')
    }
  }

  return (
    <div className={cn("rounded-lg border bg-card shadow-sm overflow-hidden", className)}>
      {/* Header with Title and Action Button */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b bg-muted/50 px-6 py-4">
          <div>
            {title && <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerAction}
        </div>
      )}

      {/* Search Bar and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b px-6 py-4">
        <div className="flex items-center gap-3 w-full sm:flex-1">
          {onSearch && (
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-9 pr-9 bg-background/50 focus-visible:ring-1"
              />
              {searchValue && (
                <Button
                  variant="ghost" 
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => onSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {/* Status Filter */}
          {statusFilter && (
            <Select 
              value={statusFilter.value} 
              onValueChange={statusFilter.onChange}
            >
              <SelectTrigger className="h-9 w-[140px] bg-background/50">
                <SelectValue placeholder={statusFilter.placeholder || "Status"} />
              </SelectTrigger>
              <SelectContent>
                {statusFilter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.value === 'active' && (
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                      )}
                      {option.value === 'inactive' && (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                      )}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex items-center rounded-md border p-1 bg-muted/30">
              <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={cn("h-8 w-8 rounded-sm", viewMode === 'table' && "shadow-sm")}
                onClick={() => setViewMode('table')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={cn("h-8 w-8 rounded-sm", viewMode === 'grid' && "shadow-sm")}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Items per page */}
          {onItemsPerPageChange && (
            <div className="flex items-center gap-2">
              <Select 
                value={String(itemsPerPage)} 
                onValueChange={(val) => onItemsPerPageChange(parseInt(val))}
              >
                <SelectTrigger className="h-9 w-[70px] bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          {onReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/20">
                    <TableHead className="w-[50px]"></TableHead>
                    {columns.map((column) => (
                      <TableHead 
                        key={column.key} 
                        className={cn("text-xs uppercase tracking-wider text-muted-foreground font-bold px-6 py-4", column.headerClassName)}
                      >
                        {column.header}
                      </TableHead>
                    ))}
                    {actions && (
                      <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold text-right w-[100px] px-6">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext 
                    items={data.map((item) => keyExtractor(item))}
                    strategy={verticalListSortingStrategy}
                  >
                    {data.map((item) => (
                      <SortableTableRow 
                        key={keyExtractor(item)} 
                        id={keyExtractor(item)}
                        className="group hover:bg-muted/30"
                        isDropTarget={canBeParent?.(item) ?? false}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.key} className={cn("px-6 py-4", column.className)}>
                            {column.cell(item)}
                          </TableCell>
                        ))}
                        {actions && (
                          <TableCell className="text-right px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {actions.onView && (
                                <ActionButton 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none"
                                  onClick={() => actions.onView?.(item)}
                                  icon={<Eye className="h-4 w-4" />}
                                  tooltip="Lihat Detail"
                                />
                              )}
                              {actions.onEdit && (
                                <ActionButton 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-background shadow-none"
                                  onClick={() => actions.onEdit?.(item)}
                                  icon={<Edit2 className="h-4 w-4" />}
                                  tooltip="Edit Data"
                                />
                              )}
                              {actions.onDelete && (
                                <ActionButton 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-background shadow-none"
                                  onClick={() => actions.onDelete?.(item)}
                                  icon={<Trash2 className="h-4 w-4" />}
                                  tooltip="Hapus Data"
                                />
                              )}
                              {actions.customActions?.filter(action => !action.showCondition || action.showCondition(item)).map((action, idx) => (
                                <ActionButton
                                  key={idx}
                                  variant={(action.variant as any) || "ghost"}
                                  size="icon"
                                  className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none", action.className)}
                                  onClick={() => action.onClick(item)}
                                  icon={action.icon === 'Lock' ? <Lock className="h-4 w-4" /> : action.icon}
                                  tooltip={action.label}
                                />
                              ))}
                            </div>
                          </TableCell>
                        )}
                      </SortableTableRow>
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-muted/20">
                {columns.map((column) => (
                  <TableHead 
                    key={column.key} 
                    className={cn("text-xs uppercase tracking-wider text-muted-foreground font-bold px-6 py-4", column.headerClassName)}
                  >
                    {column.header}
                  </TableHead>
                ))}
                {actions && (
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-bold text-right w-[100px] px-6">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">{loadingMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <span>{isError ? errorMessage : emptyMessage}</span>
                      {isError && onRefresh && (
                        <ActionButton 
                          variant="outline" 
                          size="sm" 
                          onClick={onRefresh}
                          className="h-8 bg-background shadow-xs hover:bg-muted"
                          icon={<RefreshCw className="h-3.5 w-3.5" />}
                        >
                          Reload Data
                        </ActionButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={keyExtractor(item)} className="group hover:bg-muted/30">
                    {columns.map((column) => (
                      <TableCell key={column.key} className={cn("px-6 py-4", column.className)}>
                        {column.cell(item)}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {actions.onView && (
                            <ActionButton 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none"
                              onClick={() => actions.onView?.(item)}
                              icon={<Eye className="h-4 w-4" />}
                              tooltip="Lihat Detail"
                            />
                          )}
                          {actions.onEdit && (
                            <ActionButton 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-background shadow-none"
                              onClick={() => actions.onEdit?.(item)}
                              icon={<Edit2 className="h-4 w-4" />}
                              tooltip="Edit Data"
                            />
                          )}
                          {actions.onDelete && (
                            <ActionButton 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-background shadow-none"
                              onClick={() => actions.onDelete?.(item)}
                              icon={<Trash2 className="h-4 w-4" />}
                              tooltip="Hapus Data"
                            />
                          )}
                          {actions.customActions?.filter(action => !action.showCondition || action.showCondition(item)).map((action, idx) => (
                            <ActionButton
                              key={idx}
                              variant={(action.variant as any) || "ghost"}
                              size="icon"
                              className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none", action.className)}
                              onClick={() => action.onClick(item)}
                              icon={action.icon === 'Lock' ? <Lock className="h-4 w-4" /> : action.icon}
                              tooltip={action.label}
                            />
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="p-6 bg-muted/10">
          {loading ? (
            <div className="flex justify-center items-center h-48 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground font-medium">{loadingMessage}</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-48 text-muted-foreground bg-background rounded-lg border border-dashed gap-3">
              <span>{isError ? errorMessage : emptyMessage}</span>
              {isError && onRefresh && (
                <ActionButton 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                >
                  Reload Data
                </ActionButton>
              )}
            </div>
          ) : onReorder ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={data.map((item) => keyExtractor(item))}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.map((item) => (
                    <SortableGridCard
                      key={keyExtractor(item)}
                      id={keyExtractor(item)}
                      className="group relative rounded-xl border bg-background p-5 pl-10 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                      isDropTarget={canBeParent?.(item) ?? false}
                    >
                      <div className="flex flex-col gap-4">
                        {/* Render standard columns in a vertical stack or specific layout */}
                        {columns.map((column, idx) => (
                          <div key={column.key} className={idx === 0 ? "mb-1" : ""}>
                             {idx > 0 && <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 block mb-1">{column.header}</span>}
                             <div className={cn(idx === 0 ? "text-lg font-bold text-foreground" : "text-sm text-foreground/90", column.className)}>
                               {column.cell(item)}
                             </div>
                          </div>
                        ))}
                        
                        {/* Actions in Grid */}
                        {actions && (
                          <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-muted">
                            {actions.onView && (
                              <ActionButton 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => actions.onView?.(item)}
                                icon={<Eye className="h-4 w-4" />}
                                tooltip="Lihat Detail"
                              />
                            )}
                            {actions.onEdit && (
                              <ActionButton 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:text-primary hover:bg-primary/10"
                                onClick={() => actions.onEdit?.(item)}
                                icon={<Edit2 className="h-4 w-4" />}
                                tooltip="Edit Data"
                              />
                            )}
                            {actions.onDelete && (
                              <ActionButton 
                                variant="secondary" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full hover:text-destructive hover:bg-destructive/10"
                                onClick={() => actions.onDelete?.(item)}
                                icon={<Trash2 className="h-4 w-4" />}
                                tooltip="Hapus Data"
                              />
                            )}
                            {actions.customActions?.filter(action => !action.showCondition || action.showCondition(item)).map((action, idx) => (
                              <ActionButton
                                key={idx}
                                variant="secondary"
                                size="sm"
                                className={cn("h-8 w-8 p-0 rounded-full hover:text-foreground hover:bg-muted", action.className)}
                                onClick={() => action.onClick(item)}
                                icon={action.icon === 'Lock' ? <Lock className="h-4 w-4" /> : action.icon}
                                tooltip={action.label}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </SortableGridCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((item) => (
                <div 
                  key={keyExtractor(item)} 
                  className="group relative rounded-xl border bg-background p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-col gap-4">
                    {/* Render standard columns in a vertical stack or specific layout */}
                    {columns.map((column, idx) => (
                      <div key={column.key} className={idx === 0 ? "mb-1" : ""}>
                         {idx > 0 && <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 block mb-1">{column.header}</span>}
                         <div className={cn(idx === 0 ? "text-lg font-bold text-foreground" : "text-sm text-foreground/90", column.className)}>
                           {column.cell(item)}
                         </div>
                      </div>
                    ))}
                    
                    {/* Actions in Grid */}
                    {actions && (
                      <div className="flex items-center justify-end gap-2 mt-2 pt-4 border-t border-muted">
                        {actions.onView && (
                          <ActionButton 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => actions.onView?.(item)}
                            icon={<Eye className="h-4 w-4" />}
                            tooltip="Lihat Detail"
                          />
                        )}
                        {actions.onEdit && (
                          <ActionButton 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full hover:text-primary hover:bg-primary/10"
                            onClick={() => actions.onEdit?.(item)}
                            icon={<Edit2 className="h-4 w-4" />}
                            tooltip="Edit Data"
                          />
                        )}
                        {actions.onDelete && (
                          <ActionButton 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full hover:text-destructive hover:bg-destructive/10"
                            onClick={() => actions.onDelete?.(item)}
                            icon={<Trash2 className="h-4 w-4" />}
                            tooltip="Hapus Data"
                          />
                        )}
                        {actions.customActions?.filter(action => !action.showCondition || action.showCondition(item)).map((action, idx) => (
                          <ActionButton
                            key={idx}
                            variant="secondary"
                            size="sm"
                            className={cn("h-8 w-8 p-0 rounded-full hover:text-foreground hover:bg-muted", action.className)}
                            onClick={() => action.onClick(item)}
                            icon={action.icon === 'Lock' ? <Lock className="h-4 w-4" /> : action.icon}
                            tooltip={action.label}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t bg-muted/50 px-6 py-4 gap-4 text-sm text-muted-foreground">
          <div className="order-2 sm:order-1">
            {totalItems !== undefined ? (
              <p>
                Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{" "}
                <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-semibold text-foreground">{totalItems}</span> results
              </p>
            ) : (
              <p>Showing <span className="font-semibold text-foreground">{data.length}</span> items</p>
            )}
          </div>
          <div className="flex items-center gap-3 order-1 sm:order-2">
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 bg-background shadow-none" 
                disabled={currentPage <= 1 || loading}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center justify-center min-w-[32px] h-8 px-2 bg-primary text-primary-foreground font-bold rounded-md text-xs shadow-sm shadow-primary/20">
                {currentPage}
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                className="h-8 w-8 bg-background shadow-none" 
                disabled={currentPage >= totalPages || loading}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-8 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap">Go to</span>
              <Input
                className="h-8 w-12 px-1 text-center bg-background focus-visible:ring-1"
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
                disabled={loading}
              />
              <span className="text-xs whitespace-nowrap">of {totalPages}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Re-export types for backward compatibility
export type { Column as ColumnDef }
export type RowAction<T> = {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: "default" | "destructive"
  separator?: boolean
}
