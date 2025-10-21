import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUpOutlined as TrendingUpIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
  ManageAccountsOutlined as ManageIcon,
  AssessmentOutlined as ReportsIcon,
  GroupOutlined as TeamIcon,
  DescriptionOutlined as DocumentIcon,
  InsightsOutlined as InsightsIcon,
  CampaignOutlined as CampaignIcon,
  TagOutlined as TagIcon,
  NotificationsOutlined as NotificationIcon,
  StarOutlined as StarIcon,
} from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  color?: string;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  actionLabel,
  actionIcon,
  color = '#6B7280',
  trend,
}) => (
  <Card
    sx={{
      height: '100%',
      borderRadius: '16px',
      border: '1px solid #F3F4F6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
      },
      transition: 'all 0.2s ease-in-out',
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, color: '#1F2937', fontSize: '2.5rem' }}>
          {value}
        </Typography>
        {trend && (
          <Chip
            label={trend}
            size="small"
            sx={{
              backgroundColor: '#F0FDF4',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 600,
              height: 24,
            }}
          />
        )}
      </Box>
      
      <Typography variant="body1" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
        {subtitle}
      </Typography>
      
      <Button
        endIcon={actionIcon}
        sx={{
          color: color,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '14px',
          p: 0,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: 'transparent',
            color: '#1F2937',
          },
        }}
      >
        {actionLabel}
      </Button>
    </CardContent>
  </Card>
);

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <Card
    sx={{
      borderRadius: '16px',
      border: '1px solid #F3F4F6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      height: '400px',
    }}
  >
    <CardContent sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 600, mb: 3 }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  // Mock data for demonstration
  const metrics = [
    {
      title: 'Active Studies',
      value: '24',
      subtitle: 'Currently Running Studies',
      actionLabel: 'View All',
      actionIcon: <ViewIcon sx={{ fontSize: 16 }} />,
      trend: 'This week',
    },
    {
      title: 'Pending Reviews',
      value: '7',
      subtitle: 'Protocol Reviews Pending',
      actionLabel: 'Review',
      actionIcon: <EditIcon sx={{ fontSize: 16 }} />,
      color: '#EF4444',
    },
    {
      title: 'Sites Enrolled',
      value: '142',
      subtitle: 'Active Research Sites',
      actionLabel: 'Manage',
      actionIcon: <ManageIcon sx={{ fontSize: 16 }} />,
      color: '#8B5CF6',
    },
    {
      title: 'Patient Enrollment',
      value: '2,847',
      subtitle: 'Total Enrolled Patients',
      actionLabel: 'Review',
      actionIcon: <ReportsIcon sx={{ fontSize: 16 }} />,
      trend: 'This Month',
    },
    {
      title: 'Regulatory Alerts',
      value: '3',
      subtitle: 'Pending Regulatory Actions',
      actionLabel: 'Manage',
      actionIcon: <NotificationIcon sx={{ fontSize: 16 }} />,
      color: '#F59E0B',
    },
    {
      title: 'Budget Utilization',
      value: '73%',
      subtitle: 'Overall Budget Usage',
      actionLabel: 'View Details',
      actionIcon: <TeamIcon sx={{ fontSize: 16 }} />,
      color: '#10B981',
    },
    {
      title: 'Active Investigators',
      value: '89',
      subtitle: 'Principal Investigators',
      actionLabel: 'Manage',
      actionIcon: <ManageIcon sx={{ fontSize: 16 }} />,
      color: '#6366F1',
    },
    {
      title: 'Study Revenue',
      value: '$2.4M',
      subtitle: 'Total Study Revenue',
      actionLabel: 'View Reports',
      actionIcon: <ReportsIcon sx={{ fontSize: 16 }} />,
      color: '#059669',
      trend: 'This Month',
    },
  ];

  const reports = [
    {
      title: 'Study Performance',
      description: 'Track enrollment rates, milestones, and overall study progress across all trials.',
      icon: <InsightsIcon />,
    },
    {
      title: 'Financial Overview',
      description: 'Monitor budgets, payments, and financial performance for each study.',
      icon: <DocumentIcon />,
    },
    {
      title: 'Site Analytics',
      description: 'Analyze site performance, enrollment rates, and investigator metrics.',
      icon: <CampaignIcon />,
    },
    {
      title: 'Regulatory Compliance',
      description: 'Review regulatory submissions, approvals, and compliance status.',
      icon: <StarIcon />,
    },
    {
      title: 'Patient Enrollment',
      description: 'Track patient recruitment, screening, and enrollment across all studies.',
      icon: <ReportsIcon />,
    },
    {
      title: 'Data Quality Report',
      description: 'Monitor data completeness, quality metrics, and database lock status.',
      icon: <InsightsIcon />,
    },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280' }}>
          Welcome back! Here's what's happening with your clinical trials platform.
        </Typography>
      </Box>

      {/* Summary Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 600, mb: 3 }}>
          SUMMARY
        </Typography>
        
        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <MetricCard {...metric} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <ChartCard title="IMPRESSIONS">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {/* Mock Donut Chart */}
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'conic-gradient(#3B82F6 0deg 180deg, #10B981 180deg 270deg, #F59E0B 270deg 315deg, #EF4444 315deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      100%
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#3B82F6', borderRadius: '50%' }} />
                    <Typography variant="caption">YouTube: 89%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#10B981', borderRadius: '50%' }} />
                    <Typography variant="caption">Facebook: 6%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#F59E0B', borderRadius: '50%' }} />
                    <Typography variant="caption">Google: 3%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: '#EF4444', borderRadius: '50%' }} />
                    <Typography variant="caption">Others: 2%</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </ChartCard>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ChartCard title="ANALYTICS">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              {/* Mock Line Chart */}
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Box
                  sx={{
                    height: 200,
                    background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Analytics Chart Placeholder
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                      14,500
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      This Week
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                      18,200
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B7280' }}>
                      Last Week
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Box>
        <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 600, mb: 3 }}>
          REPORTS
        </Typography>
        
        <Grid container spacing={3}>
          {reports.map((report, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box
                      sx={{
                        p: 1,
                        backgroundColor: '#F3F4F6',
                        borderRadius: '8px',
                        color: '#6B7280',
                      }}
                    >
                      {report.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', mb: 1 }}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280', lineHeight: 1.5 }}>
                        {report.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardPage;
