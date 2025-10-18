import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  Payment,
  Visibility,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const SponsorFinanceDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  // Mock data for sponsor financial operations
  const sponsorMetrics = {
    totalCommittedBudget: 45000000,
    activeStudies: 12,
    pendingApprovals: 8,
    overduePayments: 2,
    budgetUtilization: 72,
    contractsExpiringSoon: 3
  };

  const pendingBudgets = [
    {
      id: '1',
      studyTitle: 'Phase III Oncology Study - ONCX-301',
      cro: 'Premier Clinical Research',
      totalBudget: 3200000,
      submittedDate: '2024-01-15',
      category: 'Full Service',
      urgency: 'high',
      reviewer: 'Sarah Johnson'
    },
    {
      id: '2',
      studyTitle: 'Cardiovascular Device Trial - CVD-205',
      cro: 'Global CRO Solutions',
      totalBudget: 1800000,
      submittedDate: '2024-01-18',
      category: 'FSP',
      urgency: 'medium',
      reviewer: 'Michael Chen'
    },
    {
      id: '3',
      studyTitle: 'Diabetes Management Study - DM-401',
      cro: 'Regional Research Partners',
      totalBudget: 950000,
      submittedDate: '2024-01-20',
      category: 'Site Management',
      urgency: 'low',
      reviewer: 'Emily Rodriguez'
    }
  ];

  const milestonePayments = [
    {
      id: '1',
      study: 'Phase III Oncology Study',
      cro: 'Premier Clinical Research',
      milestone: 'First Patient In',
      amount: 450000,
      dueDate: '2024-02-01',
      status: 'pending_approval',
      evidence: 'FPFV Certificate uploaded'
    },
    {
      id: '2',
      study: 'Cardiovascular Device Trial',
      cro: 'Global CRO Solutions',
      milestone: 'Site Activation Complete',
      amount: 280000,
      dueDate: '2024-02-05',
      status: 'approved',
      evidence: 'All 15 sites activated'
    },
    {
      id: '3',
      study: 'Diabetes Management Study',
      cro: 'Regional Research Partners',
      milestone: '50% Enrollment',
      amount: 125000,
      dueDate: '2024-02-10',
      status: 'evidence_pending',
      evidence: 'Awaiting enrollment report'
    }
  ];

  const contractsNeedingAttention = [
    {
      id: '1',
      title: 'Master Service Agreement - Premier Clinical',
      type: 'MSA Renewal',
      expirationDate: '2024-03-31',
      daysUntilExpiration: 45,
      action: 'Review renewal terms',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Phase II Neurology Study Amendment',
      type: 'Study Amendment',
      expirationDate: '2024-02-28',
      daysUntilExpiration: 15,
      action: 'Approve scope change',
      priority: 'urgent'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'default' } = {
      pending_approval: 'warning',
      approved: 'success',
      evidence_pending: 'info',
      overdue: 'error',
      high: 'error',
      medium: 'warning',
      low: 'info',
      urgent: 'error'
    };
    return colors[status] || 'default';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprovalAction = (budget: any, action: 'approve' | 'reject') => {
    console.log(`${action} budget:`, budget);
    setApprovalDialog(false);
    setSelectedBudget(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sponsor Financial Operations
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Contract oversight, budget approvals, and milestone payment management
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Committed</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(sponsorMetrics.totalCommittedBudget)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across {sponsorMetrics.activeStudies} active studies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Approvals</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {sponsorMetrics.pendingApprovals}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Budgets awaiting review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Overdue Payments</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {sponsorMetrics.overduePayments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require immediate attention
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Budget Utilization</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {sponsorMetrics.budgetUtilization}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={sponsorMetrics.budgetUtilization} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Contracts Expiring</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {sponsorMetrics.contractsExpiringSoon}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Within 90 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="warning">
            2 milestone payments are overdue for approval - review evidence and approve
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="error">
            Master Service Agreement with Premier Clinical expires in 45 days
          </Alert>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Budget Approvals" />
          <Tab label="Milestone Payments" />
          <Tab label="Contract Management" />
          <Tab label="Financial Analytics" />
        </Tabs>
      </Box>

      {/* Budget Approvals Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Pending Budget Approvals
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Study Title</TableCell>
                <TableCell>CRO</TableCell>
                <TableCell>Total Budget</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Urgency</TableCell>
                <TableCell>Reviewer</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.studyTitle}</TableCell>
                  <TableCell>{budget.cro}</TableCell>
                  <TableCell>{formatCurrency(budget.totalBudget)}</TableCell>
                  <TableCell>{budget.submittedDate}</TableCell>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>
                    <Chip 
                      label={budget.urgency} 
                      color={getStatusColor(budget.urgency)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{budget.reviewer}</TableCell>
                  <TableCell>
                    <Button 
                      size="small" 
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedBudget(budget);
                        setApprovalDialog(true);
                      }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Milestone Payments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Milestone Payment Approvals
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Study</TableCell>
                <TableCell>CRO</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Evidence</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestonePayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.study}</TableCell>
                  <TableCell>{payment.cro}</TableCell>
                  <TableCell>{payment.milestone}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.dueDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status.replace('_', ' ')} 
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{payment.evidence}</TableCell>
                  <TableCell>
                    {payment.status === 'pending_approval' && (
                      <Box>
                        <Button size="small" startIcon={<ThumbUp />} color="success">
                          Approve
                        </Button>
                        <Button size="small" startIcon={<ThumbDown />} color="error">
                          Reject
                        </Button>
                      </Box>
                    )}
                    {payment.status === 'approved' && (
                      <Button size="small" startIcon={<Payment />}>
                        Process Payment
                      </Button>
                    )}
                    {payment.status === 'evidence_pending' && (
                      <Button size="small" startIcon={<Visibility />}>
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Contract Management Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Contracts Requiring Attention
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Expiration Date</TableCell>
                <TableCell>Days Until Expiration</TableCell>
                <TableCell>Required Action</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contractsNeedingAttention.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{contract.expirationDate}</TableCell>
                  <TableCell>{contract.daysUntilExpiration}</TableCell>
                  <TableCell>{contract.action}</TableCell>
                  <TableCell>
                    <Chip 
                      label={contract.priority} 
                      color={getStatusColor(contract.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Financial Analytics Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Financial Performance Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered insights into budget performance, cost trends, and payment patterns across your study portfolio.
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Budget vs. Actual Spending</Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time comparison across all active studies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Payment Velocity Analysis</Typography>
                <Typography variant="body2" color="text.secondary">
                  Average time from milestone completion to payment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Budget Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Budget Review & Approval</DialogTitle>
        <DialogContent>
          {selectedBudget && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedBudget.studyTitle}
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CRO"
                    value={selectedBudget.cro}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Total Budget"
                    value={formatCurrency(selectedBudget.totalBudget)}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Approval Comments"
                    multiline
                    rows={3}
                    placeholder="Enter comments for this budget approval..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button 
            color="error" 
            onClick={() => handleApprovalAction(selectedBudget, 'reject')}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => handleApprovalAction(selectedBudget, 'approve')}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
