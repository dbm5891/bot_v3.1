import { Box, Typography, Grid, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const StrategiesPage = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Trading Strategies</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
        >
          Create New Strategy
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography>
            Your trading strategies will appear here. Create a new strategy to get started.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StrategiesPage;