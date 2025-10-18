import React from 'react';
import { Box, Typography } from '@mui/material';

export const StudyManagement: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Study Management
      </Typography>
      <Typography variant="body1">
        Study management features will be available here.
      </Typography>
    </Box>
  );
};
