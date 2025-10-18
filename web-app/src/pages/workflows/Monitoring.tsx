import React from 'react';
import { Box, Typography } from '@mui/material';

export const Monitoring: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Monitoring
      </Typography>
      <Typography variant="body1">
        Monitoring features will be available here.
      </Typography>
    </Box>
  );
};
