import React from 'react';
import { Box, Typography } from '@mui/material';

export const ParticipantEnrollment: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Participant Enrollment
      </Typography>
      <Typography variant="body1">
        Participant enrollment features will be available here.
      </Typography>
    </Box>
  );
};
