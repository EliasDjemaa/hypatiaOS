import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBackOutlined as BackIcon } from '@mui/icons-material';

interface ComingSoonPageProps {
  title: string;
  description?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title, 
  description = "This feature is currently under development and will be available soon." 
}) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 2 }}>
        {title}
      </Typography>
      
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4, maxWidth: 500 }}>
        {description}
      </Typography>
      
      <Button
        variant="outlined"
        startIcon={<BackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{
          borderColor: '#E5E7EB',
          color: '#6B7280',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            borderColor: '#D1D5DB',
            backgroundColor: '#F9FAFB',
          },
        }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default ComingSoonPage;
