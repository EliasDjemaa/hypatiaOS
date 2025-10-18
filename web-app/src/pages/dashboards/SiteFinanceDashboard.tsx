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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Payment,
  Schedule,
  TrendingUp,
  Receipt,
  Person,
  LocalHospital,
  CheckCircle,
  Pending,
  Visibility,
  Download,
  AttachMoney
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

export const SiteFinanceDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expenseDialog, setExpenseDialog] = useState(false);

  // Mock data for site financial operations
  const siteMetrics = {
    totalEarnings: 485000,
    activeStudies: 4,
    pendingPayments: 125000,
    completedVisits: 342,
    averagePaymentDelay: 18,
    monthlyRevenue: 45000
  };

  const studyPayments = [
    {
      id: '1',
      studyTitle: 'Phase III Oncology Study - ONCX-301',
      sponsor: 'BioPharma Corp',
      totalContract: 180000,
      paidToDate: 125000,
      pendingAmount: 35000,
      nextPaymentDue: '2024-02-20',
      enrolledParticipants: 12,
      completedVisits: 89,
      status: 'active'
    },
    {
      id: '2',
      studyTitle: 'Cardiovascular Device Trial - CVD-205',
      sponsor: 'MedDevice Inc',
      totalContract: 145000,
      paidToDate: 98000,
      pendingAmount: 28000,
      nextPaymentDue: '2024-02-25',
      enrolledParticipants: 8,
      completedVisits: 64,
      status: 'active'
    },
    {
      id: '3',
      studyTitle: 'Diabetes Management Study - DM-401',
      sponsor: 'Pharma Solutions',
      totalContract: 95000,
      paidToDate: 45000,
      pendingAmount: 15000,
      nextPaymentDue: '2024-03-01',
      enrolledParticipants: 6,
      completedVisits: 32,
      status: 'enrolling'
    }
  ];

  const visitPayments = [
    {
      id: '1',
      participantId: 'ONCX-001',
      study: 'Phase III Oncology Study',
      visitType: 'Week 12 Follow-up',
      visitDate: '2024-02-10',
      paymentAmount: 850,
      status: 'completed',
      paymentStatus: 'pending',
      proceduresCompleted: ['Physical Exam', 'Lab Draw', 'ECG', 'Questionnaire']
    },
    {
      id: '2',
      participantId: 'CVD-003',
      study: 'Cardiovascular Device Trial',
      visitType: 'Month 6 Assessment',
      visitDate: '2024-02-12',
      paymentAmount: 1200,
      status: 'completed',
      paymentStatus: 'paid',
      proceduresCompleted: ['Device Check', 'Echocardiogram', 'Blood Work']
    },
    {
      id: '3',
      participantId: 'DM-002',
      study: 'Diabetes Management Study',
      visitType: 'Baseline Visit',
      visitDate: '2024-02-15',
      paymentAmount: 650,
      status: 'completed',
      paymentStatus: 'processing',
      proceduresCompleted: ['Consent', 'Medical History', 'HbA1c', 'Training']
    }
  ];

  const reimbursableExpenses = [
    {
      id: '1',
      category: 'Lab Processing',
      description: 'Central lab shipping - Week 8 samples',
      amount: 245,
      date: '2024-02-08',
      study: 'Phase III Oncology Study',
      status: 'submitted',
      receiptAttached: true
    },
    {
      id: '2',
      category: 'Patient Travel',
      description: 'Participant transport reimbursement',
      amount: 85,
      date: '2024-02-10',
      study: 'Cardiovascular Device Trial',
      status: 'approved',
      receiptAttached: true
    },
    {
      id: '3',
      category: 'Equipment',
      description: 'Glucose meter calibration',
      amount: 125,
      date: '2024-02-12',
      study: 'Diabetes Management Study',
      status: 'pending',
      receiptAttached: false
    }
  ];

  const upcomingMilestones = [
    {
      id: '1',
      study: 'Phase III Oncology Study',
      milestone: 'Complete 15 participants',
      currentProgress: 12,
      targetProgress: 15,
      estimatedCompletion: '2024-03-15',
      paymentAmount: 15000,
      probability: 85
    },
    {
      id: '2',
      study: 'Cardiovascular Device Trial',
      milestone: '6-month follow-up complete',
      currentProgress: 6,
      targetProgress: 8,
      estimatedCompletion: '2024-04-01',
      paymentAmount: 12000,
      probability: 70
    },
    {
      id: '3',
      study: 'Diabetes Management Study',
      milestone: 'First 10 participants enrolled',
      currentProgress: 6,
      targetProgress: 10,
      estimatedCompletion: '2024-03-30',
      paymentAmount: 8000,
      probability: 60
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
      active: 'success',
      enrolling: 'info',
      completed: 'success',
      pending: 'warning',
      paid: 'success',
      processing: 'info',
      submitted: 'info',
      approved: 'success',
      overdue: 'error'
    };
    return colors[status] || 'default';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Site Financial Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Visit payments, expense reimbursements, and milestone tracking
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Earnings</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(siteMetrics.totalEarnings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                YTD across {siteMetrics.activeStudies} studies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Payments</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(siteMetrics.pendingPayments)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalHospital color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed Visits</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {siteMetrics.completedVisits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month: 45 visits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Payment Delay</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {siteMetrics.averagePaymentDelay} days
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average processing time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly Revenue</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(siteMetrics.monthlyRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                February 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="info">
            3 visit payments totaling $2,700 are processing and will be paid within 5 business days
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="success">
            Milestone payment of $15K expected within 30 days for ONCX-301 completion
          </Alert>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Study Payments" />
          <Tab label="Visit Payments" />
          <Tab label="Expense Reimbursements" />
          <Tab label="Milestone Tracking" />
        </Tabs>
      </Box>

      {/* Study Payments Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Study-Level Payment Summary
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Study Title</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Total Contract</TableCell>
                <TableCell>Paid to Date</TableCell>
                <TableCell>Pending</TableCell>
                <TableCell>Next Payment</TableCell>
                <TableCell>Participants</TableCell>
                <TableCell>Visits</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studyPayments.map((study) => (
                <TableRow key={study.id}>
                  <TableCell>{study.studyTitle}</TableCell>
                  <TableCell>{study.sponsor}</TableCell>
                  <TableCell>{formatCurrency(study.totalContract)}</TableCell>
                  <TableCell>{formatCurrency(study.paidToDate)}</TableCell>
                  <TableCell>{formatCurrency(study.pendingAmount)}</TableCell>
                  <TableCell>{study.nextPaymentDue}</TableCell>
                  <TableCell>{study.enrolledParticipants}</TableCell>
                  <TableCell>{study.completedVisits}</TableCell>
                  <TableCell>
                    <Chip 
                      label={study.status} 
                      color={getStatusColor(study.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Visit Payments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Individual Visit Payments
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participant ID</TableCell>
                <TableCell>Study</TableCell>
                <TableCell>Visit Type</TableCell>
                <TableCell>Visit Date</TableCell>
                <TableCell>Payment Amount</TableCell>
                <TableCell>Visit Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Procedures</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visitPayments.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.participantId}</TableCell>
                  <TableCell>{visit.study}</TableCell>
                  <TableCell>{visit.visitType}</TableCell>
                  <TableCell>{visit.visitDate}</TableCell>
                  <TableCell>{formatCurrency(visit.paymentAmount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={visit.status} 
                      color={getStatusColor(visit.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={visit.paymentStatus} 
                      color={getStatusColor(visit.paymentStatus)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {visit.proceduresCompleted.length} completed
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Expense Reimbursements Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Reimbursable Expenses</Typography>
          <Button
            variant="contained"
            startIcon={<Receipt />}
            onClick={() => setExpenseDialog(true)}
          >
            Submit Expense
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Study</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Receipt</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reimbursableExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.study}</TableCell>
                  <TableCell>
                    <Chip 
                      label={expense.status} 
                      color={getStatusColor(expense.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {expense.receiptAttached ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Pending color="warning" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Download />}>
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Milestone Tracking Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Upcoming Payment Milestones
        </Typography>
        
        <Grid container spacing={3}>
          {upcomingMilestones.map((milestone) => (
            <Grid item xs={12} md={4} key={milestone.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {milestone.study}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {milestone.milestone}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="body2">
                        {milestone.currentProgress}/{milestone.targetProgress}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(milestone.currentProgress / milestone.targetProgress) * 100}
                    />
                  </Box>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Schedule />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Estimated Completion"
                        secondary={milestone.estimatedCompletion}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Payment />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Payment Amount"
                        secondary={formatCurrency(milestone.paymentAmount)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Probability"
                        secondary={`${milestone.probability}%`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Expense Submission Dialog */}
      <Dialog open={expenseDialog} onClose={() => setExpenseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submit Reimbursable Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                select
                SelectProps={{ native: true }}
              >
                <option value="">Select Category</option>
                <option value="lab">Lab Processing</option>
                <option value="travel">Patient Travel</option>
                <option value="equipment">Equipment</option>
                <option value="supplies">Medical Supplies</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Study"
                select
                SelectProps={{ native: true }}
              >
                <option value="">Select Study</option>
                <option value="1">Phase III Oncology Study</option>
                <option value="2">Cardiovascular Device Trial</option>
                <option value="3">Diabetes Management Study</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                placeholder="Describe the expense..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                Upload Receipt
                <input type="file" hidden accept="image/*,.pdf" />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpenseDialog(false)}>Cancel</Button>
          <Button variant="contained">Submit Expense</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
