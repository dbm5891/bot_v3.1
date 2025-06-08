import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../store';
import { fetchStrategies, deleteStrategy, Strategy } from '../store/slices/strategySlice';

const StrategiesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { strategies, loading, error } = useSelector((state: RootState) => state.strategy);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchStrategies());
  }, [dispatch]);

  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'all' || (strategy.status ?? '').toLowerCase() === status;
    return matchesSearch && matchesStatus;
  });

  const renderStrategyCard = (strategy: Strategy) => {
    return (
    <Card
      key={strategy.id}
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 160,
        maxHeight: 240
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              variant="h6"
              component={Link}
              to={`/strategies/${strategy.id}`}
              sx={{
                mr: 1,
                flexGrow: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                '&:hover': { textDecoration: 'underline', color: 'primary.main' }
              }}
            >
              {strategy.name}
            </Typography>
            <Tooltip title={strategy.description || "No description available"} placement="top" arrow>
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)}
              size="small"
              color={strategy.type === 'custom' ? 'primary' : 'secondary'}
              variant="outlined"
              sx={{ minHeight: 32, minWidth: 32 }}
            />
            {['active', 'inactive'].includes(strategy.status ?? '') && (
              <Chip
                className="MuiChip-root"
                data-testid="strategy-status-chip"
                label={strategy.status}
                size="small"
                color={strategy.status === 'active' ? 'success' : 'default'}
                variant="outlined"
                sx={{ minHeight: 32, minWidth: 32 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Indicators:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {strategy.indicators && strategy.indicators.map((indicator) => (
              <Chip key={indicator} label={indicator} size="small" sx={{ minHeight: 32, minWidth: 32 }} />
            ))}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(strategy.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
        <Button
          size="small"
          startIcon={<PlayArrowIcon />}
          component={Link}
          to={`/backtesting?strategyId=${strategy.id}`}
          fullWidth
          sx={{ mb: { xs: 1, sm: 0 }, minHeight: 48, minWidth: 48 }}
        >
          Backtest
        </Button>
        <Button
          size="small"
          startIcon={<EditIcon />}
          component={Link}
          to={`/strategies/${strategy.id}`}
          fullWidth
          sx={{ mb: { xs: 1, sm: 0 }, minHeight: 48, minWidth: 48 }}
        >
          Edit
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          size="small"
          color="error"
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this strategy?')) {
              dispatch(deleteStrategy(strategy.id));
            }
          }}
          sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, minHeight: 48, minWidth: 48 }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

  return (
    <Box
      sx={{
        overflowX: 'hidden',
        px: { xs: 1, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'space-between' },
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}
      >
        <Typography variant="h5" sx={{ textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Trading Strategies</Typography>
        <TextField
          placeholder="Search strategies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: { xs: '100%', sm: 240 }, mb: { xs: 2, sm: 0 } }}
          fullWidth
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, mb: { xs: 2, sm: 0 } }} fullWidth>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={status}
            label="Status"
            onChange={e => setStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/strategies/new"
          sx={{ whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' }, minHeight: 48, minWidth: 48, mb: { xs: 2, sm: 0 } }}
          fullWidth
        >
          Create New Strategy
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredStrategies.length > 0 ? (
        <Grid container spacing={2}>
          {filteredStrategies.map((strategy) => (
            <Grid item key={strategy.id} xs={12} sm={6} md={4} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {renderStrategyCard(strategy)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                No Strategies Found
              </Typography>
              <Typography color="text.secondary" paragraph>
                Your trading strategies will appear here. Create a new strategy to get started.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<AddIcon />}
                component={Link}
                to="/strategies/new"
                sx={{ minHeight: 48, minWidth: 48 }}
              >
                Create First Strategy
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StrategiesPage;