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
        {onSearch && (
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 bg-background/50 focus-visible:ring-1"
            />
          </div>
        )}
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Toggle */}
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={onRefresh}
                          className="h-8 gap-2 bg-background shadow-xs hover:bg-muted"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Reload Data
                        </Button>
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
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-none"
                              onClick={() => actions.onView?.(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {actions.onEdit && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-background shadow-none"
                              onClick={() => actions.onEdit?.(item)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                          {actions.onDelete && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-background shadow-none"
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefresh}
                  className="gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload Data
                </Button>
              )}
            </div>
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
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => actions.onView?.(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.onEdit && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full hover:text-primary hover:bg-primary/10"
                            onClick={() => actions.onEdit?.(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.onDelete && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full hover:text-destructive hover:bg-destructive/10"
                            onClick={() => actions.onDelete?.(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
