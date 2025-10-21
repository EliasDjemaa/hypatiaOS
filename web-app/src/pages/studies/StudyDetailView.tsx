import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  ScienceOutlined as StudyIcon,
  GroupOutlined as ParticipantsIcon,
  AttachMoneyOutlined as BudgetIcon,
  CalendarTodayOutlined as CalendarIcon,
  TrendingUpOutlined as TrendingIcon,
  DescriptionOutlined as ContractIcon,
  PaymentOutlined as PaymentIcon,
  AssessmentOutlined as ReportIcon,
  WarningOutlined as WarningIcon,
} from '@mui/icons-material';

// Sample detailed study data
const getStudyDetails = (studyId: string) => ({
  id: 1,
  studyId: 'ONCOLOGY-2024-001',
  title: 'Phase III Oncology Trial - Advanced Lung Cancer',
  sponsor: 'BioPharma Corp',
  therapeuticArea: 'Oncology',
  phase: 'Phase III',
  status: 'Active',
  targetEnrollment: 500,
  currentEnrollment: 342,
  enrollmentProgress: 68.4,
  sitesActivated: 12,
  totalSites: 15,
  finalizedBudget: 2500000,
  budgetUtilization: 62.8,
  ctaStatus: 'Executed',
  healthScore: 85,
  healthIndicator: 'good',
  lastUpdated: '2024-10-18T14:30:00Z',
  currency: 'USD',
  sites: [
    { id: 1, name: 'Memorial Sloan Kettering', location: 'New York, NY', enrolled: 45, target: 50, status: 'Active', ctaStatus: 'Executed' },
    { id: 2, name: 'MD Anderson Cancer Center', location: 'Houston, TX', enrolled: 38, target: 40, status: 'Active', ctaStatus: 'Executed' },
    { id: 3, name: 'Mayo Clinic', location: 'Rochester, MN', enrolled: 42, target: 45, status: 'Active', ctaStatus: 'Executed' },
  ],
  budgetBreakdown: [
    { category: 'Site Fees', budgeted: 800000, actual: 520000, variance: -35 },
    { category: 'Patient Procedures', budgeted: 650000, actual: 410000, variance: -37 },
    { category: 'Lab Costs', budgeted: 450000, actual: 285000, variance: -37 },
    { category: 'Monitoring', budgeted: 300000, actual: 195000, variance: -35 },
  ],
  payments: [
    { id: 1, site: 'Memorial Sloan Kettering', amount: 125000, status: 'Paid', date: '2024-10-15', type: 'Site Fee' },
    { id: 2, site: 'MD Anderson Cancer Center', amount: 95000, status: 'Pending', date: '2024-10-20', type: 'Patient Procedures' },
    { id: 3, site: 'Mayo Clinic', amount: 110000, status: 'Paid', date: '2024-10-12', type: 'Site Fee' },
  ],
  alerts: [
    { type: 'warning', message: 'Site #5 enrollment behind target by 15%', priority: 'medium' },
    { type: 'info', message: 'CTA amendment pending for 2 sites', priority: 'low' },
    { type: 'error', message: 'Budget variance exceeding 10% threshold', priority: 'high' },
  ]
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const StudyDetailView: React.FC = () => {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const study = getStudyDetails(studyId || '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getHealthColor = (indicator: string) => {
    switch (indicator) {
      case 'good': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/studies')}
          sx={{ mb: 2 }}
        >
          Back to Studies
        </Button>
        
        {/* Study Header Panel */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StudyIcon sx={{ fontSize: 32, mr: 2, color: '#6366F1' }} />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {study.studyId}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {study.title}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Sponsor</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{study.sponsor}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Phase</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{study.phase}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Therapeutic Area</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{study.therapeuticArea}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip label={study.status} color="success" size="small" />
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: getHealthColor(study.healthIndicator) }}>
                    {study.healthScore}/100
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Health Score</Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Progress Bars */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Enrollment Progress</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={study.enrollmentProgress} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2">
                  {study.currentEnrollment}/{study.targetEnrollment} patients ({study.enrollmentProgress.toFixed(1)}%)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Budget Utilization</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={study.budgetUtilization} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2">
                  {formatCurrency(study.finalizedBudget * study.budgetUtilization / 100)}/{formatCurrency(study.finalizedBudget)} ({study.budgetUtilization.toFixed(1)}%)
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="caption" color="text.secondary">Sites Activated</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(study.sitesActivated / study.totalSites) * 100} 
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Typography variant="body2">
                  {study.sitesActivated}/{study.totalSites} sites activated
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Alerts */}
        {study.alerts.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {study.alerts.map((alert, index) => (
              <Alert 
                key={index}
                severity={alert.type as any}
                sx={{ mb: 1 }}
                icon={<WarningIcon />}
              >
                {alert.message}
              </Alert>
            ))}
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Budgets" />
          <Tab label="Contracts" />
          <Tab label="Payments" />
          <Tab label="Forecasting" />
          <Tab label="Reporting" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Site Enrollment Breakdown</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Site Name</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Enrolled</TableCell>
                        <TableCell>Target</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {study.sites.map((site) => (
                        <TableRow key={site.id}>
                          <TableCell>{site.name}</TableCell>
                          <TableCell>{site.location}</TableCell>
                          <TableCell>{site.enrolled}</TableCell>
                          <TableCell>{site.target}</TableCell>
                          <TableCell>
                            <LinearProgress 
                              variant="determinate" 
                              value={(site.enrolled / site.target) * 100} 
                              sx={{ width: 100 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={site.status} color="success" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Key Metrics</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Budget</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(study.finalizedBudget)}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">CTA Status</Typography>
                    <Chip label={study.ctaStatus} color="success" />
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body1">
                      {new Date(study.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Budget vs Actuals</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Budgeted</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="right">Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {study.budgetBreakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell align="right">{formatCurrency(item.budgeted)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.actual)}</TableCell>
                      <TableCell align="right">
                        <Typography color={item.variance < 0 ? 'success.main' : 'error.main'}>
                          {item.variance > 0 ? '+' : ''}{item.variance}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <LinearProgress 
                          variant="determinate" 
                          value={(item.actual / item.budgeted) * 100} 
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Contract Status</Typography>
            <Typography variant="body1">Contract management interface coming soon...</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Payment History</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Site</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {study.payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.site}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={payment.status} 
                          color={payment.status === 'Paid' ? 'success' : 'warning'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Forecasting & Analytics</Typography>
            <Typography variant="body1">AI-powered forecasting interface coming soon...</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Reports & Analytics</Typography>
            <Typography variant="body1">Reporting dashboard coming soon...</Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};
