import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Switch, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button
} from '@mui/material';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [riskLevel, setRiskLevel] = useState('medium');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>User Interface</Typography>
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Dark Mode" 
                  secondary="Toggle between light and dark theme" 
                />
                <Switch 
                  checked={darkMode} 
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive email alerts for important events" 
                />
                <Switch 
                  checked={emailNotifications} 
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Trading Preferences</Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={riskLevel}
                  label="Risk Level"
                  onChange={(e) => setRiskLevel(e.target.value as string)}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Default Position Size (%)"
                type="number"
                defaultValue={2}
                inputProps={{ min: 0.1, max: 100, step: 0.1 }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>API Configuration</Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="API Key" type="password" />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="API Secret" type="password" />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;