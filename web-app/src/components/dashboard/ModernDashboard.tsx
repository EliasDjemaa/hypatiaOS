import React, { useState } from 'react';
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
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Badge,
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
  AccountCircleOutlined as AccountIcon,
  AddOutlined as AddIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

// Sample data for the dashboard
const quickActions = [
  { id: 1, title: 'Contract Analysis', icon: '📄', color: '#3B82F6', description: 'AI-powered contract review' },
  { id: 2, title: 'Budget Creation', icon: '💰', color: '#10B981', description: 'Generate study budgets' },
  { id: 3, title: 'Payment Processing', icon: '💳', color: '#F59E0B', description: 'Multi-currency payments' },
  { id: 4, title: 'Site Management', icon: '🏥', color: '#8B5CF6', description: 'Manage clinical sites' },
  { id: 5, title: 'Financial Reports', icon: '📊', color: '#EF4444', description: 'Real-time analytics' },
];

const recentStudies = [
  { 
    id: 1, 
    name: 'ONCOLOGY-2024-001', 
    description: 'Phase III Oncology Trial - Multi-site global study', 
    sponsor: 'BioPharma Corp', 
    status: 'Active',
    budget: '$2.5M',
    sites: 15,
    tags: ['Oncology', 'Phase III', 'Global']
  },
  { 
    id: 2, 
    name: 'CARDIO-2024-002', 
    description: 'Cardiovascular Device Study - US and EU sites', 
    sponsor: 'MedDevice Inc', 
    status: 'Planning',
    budget: '$1.8M',
    sites: 8,
    tags: ['Cardiology', 'Device', 'Multi-region']
  },
  { 
    id: 3, 
    name: 'NEURO-2024-003', 
    description: 'Neurology Drug Trial - Single-center study', 
    sponsor: 'NeuroTech Ltd', 
    status: 'Recruiting',
    budget: '$950K',
    sites: 3,
    tags: ['Neurology', 'Phase II', 'Single-center']
  },
  { 
    id: 4, 
    name: 'DIABETES-2024-004', 
    description: 'Diabetes Management Platform - Digital health study', 
    sponsor: 'DigiHealth Co', 
    status: 'Active',
    budget: '$1.2M',
    sites: 12,
    tags: ['Diabetes', 'Digital', 'Platform']
  },
];

const navigationItems = [
  { text: 'Studies', icon: <StudiesIcon />, active: true },
  { text: 'Budgets', icon: <BudgetsIcon />, active: false },
  { text: 'Contracts', icon: <ContractsIcon />, active: false },
  { text: 'Payments', icon: <PaymentsIcon />, active: false },
  { text: 'Forecasting', icon: <ForecastingIcon />, active: false },
  { text: 'Reporting', icon: <ReportingIcon />, active: false },
];

export const ModernDashboard: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Planning': return 'warning';
      case 'Recruiting': return 'info';
      default: return 'default';
    }
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
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton sx={{ 
              mx: 1, 
              borderRadius: 1,
              bgcolor: item.active ? '#E1E2E4' : 'transparent',
              color: item.active ? '#1D2C29' : '#C1C5C5',
              '&:hover': {
                bgcolor: item.active ? '#E1E2E4' : 'rgba(193, 197, 197, 0.1)'
              }
            }}>
              <ListItemIcon sx={{ color: item.active ? '#1D2C29' : '#C1C5C5' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
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
    <Box sx={{ display: 'flex' }}>
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
              top: '64px', // Height of AppBar
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
              top: '64px', // Height of AppBar
              height: 'calc(100% - 64px)',
              position: 'fixed'
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#F9FAFB',
          minHeight: '100vh'
        }}
      >
        <Toolbar />

        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Clinical Research Workspace
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Good morning, {user?.displayName || 'User'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              sx={{ bgcolor: '#6366F1', '&:hover': { bgcolor: '#5856EB' } }}
            >
              Ask AI
            </Button>
          </Box>
        </Box>

        {/* Quick Actions Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickActions.map((action) => (
            <Grid item xs={12} sm={6} md={2.4} key={action.id}>
              <Card sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: action.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '24px'
                  }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Studies Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Latest from the Studies
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Explore Studies
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Study</TableCell>
                    <TableCell>Sponsor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Budget</TableCell>
                    <TableCell>Sites</TableCell>
                    <TableCell>Tags</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentStudies.map((study) => (
                    <TableRow key={study.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {study.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {study.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{study.sponsor}</TableCell>
                      <TableCell>
                        <Chip 
                          label={study.status} 
                          color={getStatusColor(study.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{study.budget}</TableCell>
                      <TableCell>{study.sites}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {study.tags.map((tag, index) => (
                            <Chip 
                              key={index}
                              label={tag} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
