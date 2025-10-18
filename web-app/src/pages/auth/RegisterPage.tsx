import React from 'react';
import { Typography, Box } from '@mui/material';

export const RegisterPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Register
      </Typography>
      <Typography variant="body1">
        Registration is by invitation only. Please contact your organization administrator.
      </Typography>
    </Box>
  );
};
