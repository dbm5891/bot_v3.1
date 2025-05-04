import React from 'react';
import { Card, CardContent, CardHeader, Divider, Box, Typography, Chip } from '@mui/material';

const StatusCard: React.FC = () => {
  const statusItems = [
    {
      name: 'System Status',
      status: 'Online',
      color: 'success',
      details: 'All systems operational'
    },
    {
      name: 'Data Feed',
      status: 'Connected',
      color: 'success',
      details: 'Last update: 5 minutes ago'
    },
    {
      name: 'Broker Connection',
      status: 'Authenticated',
      color: 'success',
      details: 'TD Ameritrade'
    },
    {
      name: 'Indicator Service',
      status: 'Active',
      color: 'success',
      details: '43 indicators available'
    }
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="System Status" />
      <Divider />
      <CardContent>
        {statusItems.map((item, index) => (
          <React.Fragment key={item.name}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography variant="body1">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">{item.details}</Typography>
              </Box>
              <Chip 
                label={item.status} 
                color={item.color as 'success' | 'warning' | 'error' | 'default'}
                size="small"
              />
            </Box>
            {index < statusItems.length - 1 && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default StatusCard;