import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PsychologyOutlined as AIIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

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

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Planning': return 'warning';
      case 'Recruiting': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
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

      {/* Recent Studies Cards */}
      <Box>
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {recentStudies.map((study) => (
            <Card 
              key={study.id} 
              sx={{ 
                p: 2.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Study Info */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: '#1a1a1a' }}>
                      {study.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.4 }}>
                      {study.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {study.tags.map((tag, index) => (
                        <Chip 
                          key={index}
                          label={tag} 
                          size="small" 
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.7rem',
                            height: 20,
                            '& .MuiChip-label': { px: 1 }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Sponsor */}
                <Grid item xs={12} md={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Sponsor
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.5 }}>
                      {study.sponsor}
                    </Typography>
                  </Box>
                </Grid>

                {/* Status */}
                <Grid item xs={12} md={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Status
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={study.status} 
                        color={getStatusColor(study.status) as any}
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                </Grid>

                {/* Budget */}
                <Grid item xs={12} md={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Budget
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981', mt: 0.5 }}>
                      {study.budget}
                    </Typography>
                  </Box>
                </Grid>

                {/* Sites */}
                <Grid item xs={12} md={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: 0.5 }}>
                      Sites
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {study.sites}
                    </Typography>
                  </Box>
                </Grid>

                {/* Action */}
                <Grid item xs={12} md={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        minWidth: 'auto',
                        px: 2,
                        fontSize: '0.75rem'
                      }}
                    >
                      View
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
