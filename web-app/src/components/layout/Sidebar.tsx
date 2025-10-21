import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  DashboardOutlined as DashboardIcon,
  AnalyticsOutlined as AnalyticsIcon,
  ArticleOutlined as WriteNewsIcon,
  PhotoLibraryOutlined as MediaLibraryIcon,
  LocalOfferOutlined as TagManagerIcon,
  DescriptionOutlined as AllArticlesIcon,
  DraftsOutlined as DraftsIcon,
  ScheduleOutlined as ScheduledPostsIcon,
  NewspaperOutlined as BreakingNewsIcon,
  PeopleOutlined as SubscribersIcon,
  EmailOutlined as NewsletterIcon,
  CampaignOutlined as AdManagementIcon,
  AssessmentOutlined as ReportsIcon,
  SearchOutlined as SearchIcon,
  ScienceOutlined as StudiesIcon,
  NotificationsOutlined as NotificationIcon,
  FilterListOutlined as FilterIcon,
} from '@mui/icons-material';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const notificationOpen = Boolean(notificationAnchor);
  const [notificationFilter, setNotificationFilter] = useState('all');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const menuSections = [
    {
      title: 'ESSENTIALS',
      items: [
        { icon: DashboardIcon, label: 'Dashboard', path: '/dashboard', color: '#E0F2FE', iconColor: '#0284C7' },
        { icon: StudiesIcon, label: 'Studies', path: '/studies', color: '#F3E8FF', iconColor: '#7C3AED' },
        { icon: AnalyticsIcon, label: 'Analytics', path: '/analytics', color: '#ECFDF5', iconColor: '#059669' },
        { icon: ReportsIcon, label: 'Reports', path: '/reports', color: '#FEF3C7', iconColor: '#D97706' },
      ]
    },
    {
      title: 'FINANCIAL MANAGEMENT',
      items: [
        { icon: AllArticlesIcon, label: 'Budgets', path: '/budgets' },
        { icon: DraftsIcon, label: 'Contracts', path: '/contracts' },
        { icon: ScheduledPostsIcon, label: 'Payments', path: '/payments' },
        { icon: BreakingNewsIcon, label: 'Forecasting', path: '/forecasting' },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { icon: SubscribersIcon, label: 'Sites', path: '/sites' },
        { icon: NewsletterIcon, label: 'Investigators', path: '/investigators' },
        { icon: AdManagementIcon, label: 'Regulatory', path: '/regulatory' },
        { icon: TagManagerIcon, label: 'Data Management', path: '/data-management' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: '#FAFBFC',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700, 
            color: '#1F2937',
            fontSize: '24px',
            letterSpacing: '-0.5px',
          }}
        >
          Hypatia
        </Typography>
      </Box>

      {/* Search and Notifications */}
      <Box sx={{ px: 2, mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '11px' }}>
                  ⌘F
                </Typography>
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              '& fieldset': {
                borderColor: '#E5E7EB',
              },
              '&:hover fieldset': {
                borderColor: '#D1D5DB',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#3B82F6',
                borderWidth: '1px',
              },
            },
          }}
        />
        
        {/* Notification Button */}
        <IconButton
          onClick={handleNotificationClick}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: '#F9FAFB',
              borderColor: '#D1D5DB',
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <NotificationIcon sx={{ fontSize: 18, color: '#6B7280' }} />
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                backgroundColor: '#EF4444',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </Box>
        </IconButton>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                display: 'block',
                color: '#6B7280',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.5px',
              }}
            >
              {section.title}
            </Typography>
            <List sx={{ py: 0 }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <ListItem key={item.path} disablePadding sx={{ px: 2 }}>
                    <ListItemButton
                      onClick={() => navigate(item.path)}
                      sx={{
                        borderRadius: '12px',
                        mb: 1,
                        py: 1.5,
                        px: 2,
                        backgroundColor: active ? '#F3F4F6' : 'transparent',
                        color: '#374151',
                        border: active ? '1px solid #E5E7EB' : '1px solid transparent',
                        '&:hover': {
                          backgroundColor: '#F9FAFB',
                        },
                        '& .MuiListItemIcon-root': {
                          minWidth: 44,
                        },
                        '& .MuiListItemText-primary': {
                          fontSize: '14px',
                          fontWeight: active ? 600 : 500,
                          color: '#374151',
                        },
                      }}
                    >
                      <ListItemIcon>
                        {item.color ? (
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              backgroundColor: item.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon sx={{ fontSize: 18, color: item.iconColor }} />
                          </Box>
                        ) : (
                          <Icon sx={{ fontSize: 20, color: active ? '#374151' : '#6B7280' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: '1px solid #E5E7EB' }}>
        <Box
          sx={{
            backgroundColor: '#FEF3C7',
            borderRadius: '12px',
            p: 2,
            textAlign: 'center',
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400E', mb: 0.5 }}>
            NEED HELP?
          </Typography>
          <Typography variant="caption" sx={{ color: '#92400E', display: 'block', mb: 1 }}>
            Clinical trials support
          </Typography>
          <Box
            sx={{
              backgroundColor: '#92400E',
              color: 'white',
              borderRadius: '6px',
              py: 0.5,
              px: 1,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Documentation
          </Box>
        </Box>

        {/* User Profile */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            cursor: 'pointer',
            borderRadius: '12px',
            p: 1,
            '&:hover': {
              backgroundColor: '#F9FAFB',
            },
          }}
          onClick={handleMenuClick}
        >
          <Avatar sx={{ width: 32, height: 32, backgroundColor: '#8B5CF6' }}>
            <Typography sx={{ fontSize: '14px', color: 'white', fontWeight: 600 }}>
              U
            </Typography>
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
              User
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              HypatiaOS CRO
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#9CA3AF',
            transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}>
            ⌄
          </Box>
        </Box>

        {/* Notification Tray */}
        <Menu
          anchorEl={notificationAnchor}
          open={notificationOpen}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E5E7EB',
              minWidth: 320,
              maxHeight: 400,
              mt: 1,
            },
          }}
        >
          <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
              Notifications
            </Typography>
            
            {/* Filter Tabs */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['all', 'unread', 'mentions'].map((filter) => (
                <Box
                  key={filter}
                  onClick={() => setNotificationFilter(filter)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: notificationFilter === filter ? '#F3F4F6' : 'transparent',
                    color: notificationFilter === filter ? '#374151' : '#6B7280',
                    fontSize: '14px',
                    fontWeight: notificationFilter === filter ? 600 : 500,
                    textTransform: 'capitalize',
                    '&:hover': {
                      backgroundColor: '#F9FAFB',
                    },
                  }}
                >
                  {filter}
                </Box>
              ))}
            </Box>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {/* Sample Notifications */}
            {[
              {
                id: 1,
                title: 'Study Protocol Updated',
                message: 'HYPATIA-001 protocol has been updated by Dr. Smith',
                time: '2 minutes ago',
                type: 'study',
                unread: true,
              },
              {
                id: 2,
                title: 'New Site Activated',
                message: 'Memorial Hospital has been activated for HYPATIA-002',
                time: '1 hour ago',
                type: 'site',
                unread: true,
              },
              {
                id: 3,
                title: 'Regulatory Submission Due',
                message: 'FDA submission deadline approaching for HYPATIA-003',
                time: '3 hours ago',
                type: 'regulatory',
                unread: false,
              },
              {
                id: 4,
                title: 'Patient Enrollment Milestone',
                message: 'HYPATIA-001 reached 50% enrollment target',
                time: '1 day ago',
                type: 'milestone',
                unread: false,
              },
            ].map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #F3F4F6',
                  cursor: 'pointer',
                  backgroundColor: notification.unread ? '#F8FAFC' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#F3F4F6',
                  },
                  '&:last-child': {
                    borderBottom: 'none',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      backgroundColor: 
                        notification.type === 'study' ? '#F3E8FF' :
                        notification.type === 'site' ? '#E0F2FE' :
                        notification.type === 'regulatory' ? '#FEE2E2' :
                        '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {notification.type === 'study' ? '📋' :
                     notification.type === 'site' ? '🏥' :
                     notification.type === 'regulatory' ? '⚖️' :
                     '🎯'}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                        {notification.title}
                      </Typography>
                      {notification.unread && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: '#3B82F6',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 1, lineHeight: 1.4 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                      {notification.time}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ p: 2, borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#3B82F6', 
                cursor: 'pointer',
                fontWeight: 600,
                '&:hover': {
                  color: '#2563EB',
                },
              }}
            >
              View all notifications
            </Typography>
          </Box>
        </Menu>

        {/* User Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #E5E7EB',
              minWidth: 200,
              mt: -1,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #F3F4F6' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
              Workspace
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              HypatiaOS CRO Platform
            </Typography>
          </Box>
          
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                backgroundColor: '#F3E8FF', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                👤
              </Box>
              <Typography variant="body2">Profile</Typography>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                backgroundColor: '#E0F2FE', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                ⚙️
              </Box>
              <Typography variant="body2">Settings</Typography>
            </Box>
          </MenuItem>
          
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                backgroundColor: '#ECFDF5', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                🌙
              </Box>
              <Typography variant="body2">Theme</Typography>
            </Box>
          </MenuItem>
          
          <Divider sx={{ my: 1 }} />
          
          <MenuItem onClick={handleMenuClose} sx={{ py: 1.5, px: 2, color: '#DC2626' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Box sx={{ 
                width: 24, 
                height: 24, 
                backgroundColor: '#FEE2E2', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                🚪
              </Box>
              <Typography variant="body2" sx={{ color: '#DC2626' }}>Log out</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Sidebar;
