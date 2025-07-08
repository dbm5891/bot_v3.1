"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Edit,
  Eye,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface MarketData {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  hasIndicators: boolean;
  appliedIndicators?: string[];
  lastUpdated: string;
}

interface DataTableProps {
  data: MarketData[];
  loading?: boolean;
  onViewData?: (id: string) => void;
  onEditData?: (id: string) => void;
  onDeleteData?: (id: string) => void;
  onChartData?: (id: string) => void;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof MarketData | '';

const DataTable: React.FC<DataTableProps> = ({
  data,
  loading = false,
  onViewData,
  onEditData,
  onDeleteData,
  onChartData,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<OrderBy>('lastUpdated');
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const filtered = data.filter(row => 
      row.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.timeframe.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.appliedIndicators?.some(indicator => 
        indicator.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    return filtered;
  }, [data, searchQuery]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!orderBy) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if ((aValue ?? 0) < (bValue ?? 0)) {
        return order === 'asc' ? -1 : 1;
      }
      if ((aValue ?? 0) > (bValue ?? 0)) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [filteredData, order, orderBy]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  // Generate page numbers for pagination
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);
      
      // Current page neighborhood
      const startPage = Math.max(1, page - 1);
      const endPage = Math.min(totalPages - 2, page + 1);
      
      // Add ellipsis after first page if needed
      if (startPage > 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 2) {
        pages.push(-2); // -2 represents ellipsis
      }
      
      // Always show last page
      pages.push(totalPages - 1);
    }
    
    return pages;
  }, [page, totalPages]);

  const SortIcon = ({ column }: { column: OrderBy }) => {
    if (column !== orderBy) {
      return (
        <div className="flex flex-col ml-1 opacity-30">
          <ChevronUp className="h-3 w-3" />
          <ChevronDown className="h-3 w-3 -mt-1" />
        </div>
      );
    }
    
    return order === 'asc' 
      ? <ChevronUp className="h-4 w-4 ml-1 text-primary" />
      : <ChevronDown className="h-4 w-4 ml-1 text-primary" />;
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-border bg-background">
      {loading && (
        <div className="h-1 w-full bg-muted">
          <div className="h-1 animate-pulse bg-primary" style={{ width: '100%' }}></div>
        </div>
      )}
      
      <div className="p-4 flex flex-col sm:flex-row justify-between gap-4 border-b border-border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            className="h-9 w-16 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRequestSort('symbol')}
              >
                <div className="flex items-center">
                  Symbol
                  <SortIcon column="symbol" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRequestSort('timeframe')}
              >
                <div className="flex items-center">
                  Timeframe
                  <SortIcon column="timeframe" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRequestSort('startDate')}
              >
                <div className="flex items-center">
                  Date Range
                  <SortIcon column="startDate" />
                </div>
              </TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors text-right"
                onClick={() => handleRequestSort('recordCount')}
              >
                <div className="flex items-center justify-end">
                  Records
                  <SortIcon column="recordCount" />
                </div>
              </TableHead>
              
              <TableHead>Indicators</TableHead>
              
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRequestSort('lastUpdated')}
              >
                <div className="flex items-center">
                  Last Updated
                  <SortIcon column="lastUpdated" />
                </div>
              </TableHead>
              
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {loading ? 'Loading data...' : 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {row.symbol}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/30">
                      {row.timeframe}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {formatDate(row.startDate)} — {formatDate(row.endDate)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {row.recordCount.toLocaleString()}
                  </TableCell>
                  
                  <TableCell>
                    {row.hasIndicators ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                        {row.appliedIndicators?.length ? `${row.appliedIndicators.length} Indicators` : '+ Indicators'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-muted/30">
                        Raw Data
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {formatDateTime(row.lastUpdated)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      {onViewData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewData(row.id)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      )}
                      
                      {onChartData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onChartData(row.id)}
                          className="h-8 w-8"
                        >
                          <BarChart2 className="h-4 w-4" />
                          <span className="sr-only">Chart</span>
                        </Button>
                      )}
                      
                      {onEditData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditData(row.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      
                      {onDeleteData && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteData(row.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {sortedData.length > 0 ? page * rowsPerPage + 1 : 0} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handleChangePage(Math.max(0, page - 1))}
                  className={cn(page === 0 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              
              {pageNumbers.map((pageNum, idx) => {
                // Handle ellipsis
                if (pageNum < 0) {
                  return (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handleChangePage(pageNum)}
                      isActive={page === pageNum}
                    >
                      {pageNum + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handleChangePage(Math.min(page + 1, totalPages - 1))}
                  className={cn(page >= totalPages - 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default DataTable;