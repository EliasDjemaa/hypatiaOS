import React from 'react';
import { Box, Typography } from '@mui/material';

export const Reporting: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reporting
      </Typography>
      <Typography variant="body1">
        Reporting features will be available here.
      </Typography>
    </Box>
  );
};
