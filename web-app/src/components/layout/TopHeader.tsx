import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Badge,
} from '@mui/material';
import {
  NotificationsOutlined as NotificationIcon,
  AddOutlined as AddIcon,
} from '@mui/icons-material';

const TopHeader: React.FC = () => {
  return (
    <Box
      sx={{
        height: 64,
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 4,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
      }}
    >
      {/* Left side - could add breadcrumbs or page title here */}
      <Box />

      {/* Right side - Actions and Profile */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Add Button */}
        <IconButton
          sx={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: '#7C3AED',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 20 }} />
        </IconButton>

        {/* Notifications */}
        <IconButton
          sx={{
            backgroundColor: '#F3F4F6',
            width: 40,
            height: 40,
            '&:hover': {
              backgroundColor: '#E5E7EB',
            },
          }}
        >
          <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '10px' } }}>
            <NotificationIcon sx={{ fontSize: 20, color: '#6B7280' }} />
          </Badge>
        </IconButton>

        {/* Profile Avatar */}
        <Avatar
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#E5E7EB',
            cursor: 'pointer',
          }}
        >
          <Typography sx={{ fontSize: '14px', color: '#6B7280', fontWeight: 600 }}>
            U
          </Typography>
        </Avatar>
      </Box>
    </Box>
  );
};

export default TopHeader;
