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
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
  // Search
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  // Messages
  emptyMessage?: string
  loadingMessage?: string
  // Pagination
  keyExtractor: (item: T) => string
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  onItemsPerPageChange?: (value: number) => void
  className?: string
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
  emptyMessage = "No data found.",
  loadingMessage = "Loading...",
  keyExtractor,
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  onItemsPerPageChange,
  className,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>('table')
  const [goToPage, setGoToPage] = React.useState('')

  const handleGoToPage = () => {
    const page = parseInt(goToPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange?.(page)
      setGoToPage('')
    }
  }

  return (
    <div className={cn("rounded-lg border bg-card shadow-sm", className)}>
      {/* Header with Title and Action Button */}
      {(title || headerAction) && (
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerAction}
        </div>
      )}

      {/* Search Bar and Controls */}
      <div className="flex items-center justify-between gap-4 border-b px-6 py-4">
        {onSearch && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center rounded-md border">
            <Button 
              variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Items per page */}
          {onItemsPerPageChange && (
            <Select 
              value={String(itemsPerPage)} 
              onValueChange={(val) => onItemsPerPageChange(parseInt(val))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead 
                key={column.key} 
                className={cn("text-xs uppercase tracking-wider text-muted-foreground font-semibold", column.headerClassName)}
              >
                {column.header}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-semibold text-right w-[100px]">
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
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">{loadingMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions.onView && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => actions.onView?.(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {actions.onEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => actions.onEdit?.(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {actions.onDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => actions.onDelete?.(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between border-t px-6 py-4 text-sm text-muted-foreground">
          <div>
            {totalItems !== undefined ? (
              <>
                Showing <span className="font-medium text-primary">{Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}</span> to{" "}
                <span className="font-medium text-primary">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-medium text-primary">{totalItems}</span> results
              </>
            ) : (
              `Showing ${data.length} items`
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8" 
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="default"
              size="sm"
              className="h-8 min-w-[32px]"
            >
              {currentPage}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-8 w-8" 
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <span className="ml-2">Go to</span>
            <Input
              className="h-8 w-14 text-center"
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGoToPage()}
            />
            <span>of {totalPages}</span>
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
