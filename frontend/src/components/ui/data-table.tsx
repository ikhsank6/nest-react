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
  Filter,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Column definition
export interface Column<T> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

// Action definition
export interface RowAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: "default" | "destructive"
  separator?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  actions?: RowAction<T>[]
  loading?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  searchValue?: string
  emptyMessage?: string
  loadingMessage?: string
  keyExtractor: (item: T) => string
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
  className?: string
}

export function DataTable<T>({
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
  itemsPerPage,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      {onSearch && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
              {actions && actions.length > 0 && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{loadingMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24 text-center">
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
                  {actions && actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {actions.map((action, index) => (
                            <React.Fragment key={index}>
                              {action.separator && <DropdownMenuSeparator />}
                              <DropdownMenuItem 
                                onClick={() => action.onClick(item)}
                                className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            </React.Fragment>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {totalItems !== undefined && itemsPerPage !== undefined ? (
              `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to ${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} items`
            ) : (
              `Showing ${data.length} items`
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0" 
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
