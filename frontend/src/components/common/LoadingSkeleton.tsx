import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid, useTheme } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'stat' | 'text';
  count?: number;
  height?: number | string;
  width?: number | string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1, 
  height,
  width 
}) => {
  const theme = useTheme();
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'stat':
        return (
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={48} />
            </CardContent>
          </Card>
        );
        
      case 'chart':
        const chartHeight = typeof height === 'number' ? height : 400;
        return (
          <Card variant="outlined" sx={{ height: chartHeight, p: 2 }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={chartHeight - 80} />
          </Card>
        );
        
      case 'table':
        return (
          <Card variant="outlined">
            <CardContent>
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
              <Box>
                {/* Table header */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="20%" />
                  <Skeleton variant="text" width="20%" />
                </Box>
                {/* Table rows */}
                {[...Array(5)].map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="20%" />
                    <Skeleton variant="text" width="20%" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
        
      case 'text':
        return (
          <Box>
            <Skeleton variant="text" width={width || '100%'} height={height || 24} />
          </Box>
        );
        
      case 'card':
      default:
        return (
          <Card variant="outlined" sx={{ height: height || 'auto' }}>
            <CardContent>
              <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="60%" />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" width="30%" height={36} />
              </Box>
            </CardContent>
          </Card>
        );
    }
  };
  
  if (count > 1) {
    return (
      <Grid container spacing={3}>
        {[...Array(count)].map((_, index) => (
          <Grid item xs={12} md={variant === 'stat' ? 3 : 12} key={index}>
            {renderSkeleton()}
          </Grid>
        ))}
      </Grid>
    );
  }
  
  return renderSkeleton();
};

export default LoadingSkeleton; 