import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Tooltip,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';

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

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const sortedData = useMemo(() => {
    if (!orderBy) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) {
        return order === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, order, orderBy]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedData, page, rowsPerPage]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {loading && <LinearProgress />}
      
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'symbol'}
                  direction={orderBy === 'symbol' ? order : 'asc'}
                  onClick={() => handleRequestSort('symbol')}
                >
                  Symbol
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'timeframe'}
                  direction={orderBy === 'timeframe' ? order : 'asc'}
                  onClick={() => handleRequestSort('timeframe')}
                >
                  Timeframe
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'startDate'}
                  direction={orderBy === 'startDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('startDate')}
                >
                  Date Range
                </TableSortLabel>
              </TableCell>
              
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'recordCount'}
                  direction={orderBy === 'recordCount' ? order : 'asc'}
                  onClick={() => handleRequestSort('recordCount')}
                >
                  Records
                </TableSortLabel>
              </TableCell>
              
              <TableCell>Indicators</TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'lastUpdated'}
                  direction={orderBy === 'lastUpdated' ? order : 'asc'}
                  onClick={() => handleRequestSort('lastUpdated')}
                >
                  Last Updated
                </TableSortLabel>
              </TableCell>
              
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {loading ? 'Loading data...' : 'No data available'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {row.symbol}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={row.timeframe} 
                      size="small"
                      color={
                        row.timeframe.includes('d') || row.timeframe.includes('w') ? 'secondary' : 'primary'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(row.startDate)} — {formatDate(row.endDate)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2">
                      {row.recordCount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {row.hasIndicators ? (
                      <Tooltip title={row.appliedIndicators?.join(', ') || 'Technical indicators are available'}>
                        <Chip 
                          label={`${row.appliedIndicators?.length || '+'} Indicators`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Chip 
                        label="Raw Data"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(row.lastUpdated)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {onViewData && (
                        <Tooltip title="View Data">
                          <IconButton 
                            size="small" 
                            onClick={() => onViewData(row.id)}
                            aria-label="view"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onChartData && (
                        <Tooltip title="Chart Data">
                          <IconButton 
                            size="small" 
                            onClick={() => onChartData(row.id)}
                            aria-label="chart"
                          >
                            <ChartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onEditData && (
                        <Tooltip title="Edit Data">
                          <IconButton 
                            size="small" 
                            onClick={() => onEditData(row.id)}
                            aria-label="edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {onDeleteData && (
                        <Tooltip title="Delete Data">
                          <IconButton 
                            size="small" 
                            onClick={() => onDeleteData(row.id)}
                            color="error"
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={sortedData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default DataTable;