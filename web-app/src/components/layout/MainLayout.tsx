import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Badge,
  Chip,
} from '@mui/material';
import {
  MenuOutlined as MenuIcon,
  SearchOutlined as SearchIcon,
  ScienceOutlined as StudiesIcon,
  AccountBalanceWalletOutlined as BudgetsIcon,
  DescriptionOutlined as ContractsIcon,
  PaymentOutlined as PaymentsIcon,
  TrendingUpOutlined as ForecastingIcon,
  AssessmentOutlined as ReportingIcon,
  PsychologyOutlined as AIIcon,
  SettingsOutlined as SettingsIcon,
  HelpOutlineOutlined as HelpIcon,
  NotificationsOutlined as NotificationsIcon,
  DashboardOutlined as DashboardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Studies', icon: <StudiesIcon />, path: '/studies' },
  { text: 'Budgets', icon: <BudgetsIcon />, path: '/budgets' },
  { text: 'Contracts', icon: <ContractsIcon />, path: '/contracts' },
  { text: 'Payments', icon: <PaymentsIcon />, path: '/payments' },
  { text: 'Forecasting', icon: <ForecastingIcon />, path: '/forecasting' },
  { text: 'Reporting', icon: <ReportingIcon />, path: '/reporting' },
];

export const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const drawer = (
    <Box sx={{ 
      bgcolor: '#1D2C29', 
      height: '100%', 
      color: '#C1C5C5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Navigation */}
      <Typography variant="overline" sx={{ px: 2, py: 2, display: 'block', color: '#C1C5C5', fontSize: '0.75rem' }}>
        Main Navigation
      </Typography>
      <List>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation(item.path)}
                sx={{ 
                  mx: 1, 
                  borderRadius: 1,
                  bgcolor: isActive ? '#E1E2E4' : 'transparent',
                  color: isActive ? '#1D2C29' : '#C1C5C5',
                  '&:hover': {
                    bgcolor: isActive ? '#E1E2E4' : 'rgba(193, 197, 197, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: isActive ? '#1D2C29' : '#C1C5C5' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2, borderColor: '#3A4B47' }} />

      {/* Financial Tools */}
      <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: '#C1C5C5', fontSize: '0.75rem' }}>
        Financial Tools
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton sx={{ 
            mx: 1, 
            borderRadius: 1,
            color: '#C1C5C5',
            '&:hover': {
              bgcolor: 'rgba(193, 197, 197, 0.1)'
            }
          }}>
            <ListItemIcon sx={{ color: '#C1C5C5' }}>
              <AIIcon />
            </ListItemIcon>
            <ListItemText primary="AI Forecasting" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton sx={{ 
            mx: 1, 
            borderRadius: 1,
            color: '#C1C5C5',
            '&:hover': {
              bgcolor: 'rgba(193, 197, 197, 0.1)'
            }
          }}>
            <ListItemIcon sx={{ color: '#C1C5C5' }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Budget Tools" />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Bottom Section */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<HelpIcon />}
          sx={{ 
            color: '#C1C5C5',
            borderColor: '#C1C5C5',
            '&:hover': {
              borderColor: '#E1E2E4',
              color: '#E1E2E4'
            }
          }}
        >
          Help & Support
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          bgcolor: '#152523',
          color: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 4 }}>
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              H
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#E1E2E4' }}>
              HypatiaOS
            </Typography>
          </Box>

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Centered Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flex: 1,
            px: 4
          }}>
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              sx={{ 
                width: 400,
                maxWidth: '50%',
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#283837',
                  color: 'white',
                  '& fieldset': { 
                    borderColor: '#5C6B6A',
                    borderWidth: '1px'
                  },
                  '&:hover fieldset': {
                    borderColor: '#5C6B6A'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5C6B6A'
                  }
                },
                '& .MuiInputBase-input': {
                  color: 'white'
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#C1C5C5',
                  opacity: 1
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#C1C5C5' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip 
                      label="⌘K" 
                      size="small" 
                      sx={{
                        bgcolor: '#475554',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.75rem'
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Right side icons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton color="inherit" onClick={logout}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.displayName?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#1D2C29',
              top: '64px',
              height: 'calc(100% - 64px)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              bgcolor: '#1D2C29',
              top: '64px',
              height: 'calc(100vh - 64px)',
              position: 'fixed',
              left: 0
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#F9FAFB',
          height: '100vh',
          overflow: 'auto',
          pt: '88px', // AppBar height (64px) + padding (24px)
          pl: { xs: 3, sm: `${drawerWidth + 24}px` }, // Sidebar width + padding
          pr: 3,
          pb: 3
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
