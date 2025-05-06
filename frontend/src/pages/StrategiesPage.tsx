import React, { useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../store';
import { fetchStrategies, deleteStrategy, Strategy } from '../store/slices/strategySlice';

const StrategiesPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { strategies, loading, error } = useSelector((state: RootState) => state.strategy);

  useEffect(() => {
    dispatch(fetchStrategies());
  }, [dispatch]);

  const renderStrategyCard = (strategy: Strategy) => (
    <Card key={strategy.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {strategy.name}
          </Typography>
          <Chip 
            label={strategy.type.charAt(0).toUpperCase() + strategy.type.slice(1)} 
            size="small" 
            color={strategy.type === 'custom' ? 'primary' : 'secondary'} 
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {strategy.description}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Indicators:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {strategy.indicators.map((indicator) => (
              <Chip key={indicator} label={indicator} size="small" />
            ))}
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date(strategy.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <Divider />
      <CardActions>
        <Button 
          size="small" 
          startIcon={<PlayArrowIcon />}
          component={Link}
          to={`/backtesting?strategyId=${strategy.id}`}
        >
          Backtest
        </Button>
        <Button 
          size="small" 
          startIcon={<EditIcon />}
          component={Link}
          to={`/strategies/${strategy.id}`}
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
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trading Strategies</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/strategies/new"
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
      ) : strategies.length > 0 ? (
        <Grid container spacing={3}>
          {strategies.map((strategy) => (
            <Grid item key={strategy.id} xs={12} sm={6} md={4}>
              {renderStrategyCard(strategy)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
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