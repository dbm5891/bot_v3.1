import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Tabs, Tab } from '@mui/material';

const StrategyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Strategy Details</Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Strategy #{id}</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography>
              This is a placeholder for the strategy details page. In a complete implementation,
              this would show configuration, performance metrics, and allow for editing.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StrategyDetailPage;