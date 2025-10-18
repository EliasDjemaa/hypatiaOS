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
  MenuItem,
  IconButton
} from '@mui/material';
import {
  TrendingUp,
  Receipt,
  AccountBalance,
  Warning,
  Add,
  Send,
  Visibility,
  Edit,
  Download,
  Refresh
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

export const CROFinanceDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);

  // Mock data for CRO financial operations
  const croMetrics = {
    totalRevenue: 28500000,
    activeStudies: 15,
    pendingInvoices: 1250000,
    outstandingReceivables: 3200000,
    averageCollectionDays: 42,
    budgetAccuracy: 87
  };

  const studyBudgets = [
    {
      id: '1',
      studyTitle: 'Phase III Oncology Study - ONCX-301',
      sponsor: 'BioPharma Corp',
      totalBudget: 3200000,
      utilizedAmount: 2180000,
      utilization: 68,
      status: 'active',
      forecastCompletion: '2024-08-15',
      profitMargin: 18
    },
    {
      id: '2',
      studyTitle: 'Cardiovascular Device Trial - CVD-205',
      sponsor: 'MedDevice Inc',
      totalBudget: 1800000,
      utilizedAmount: 720000,
      utilization: 40,
      status: 'active',
      forecastCompletion: '2024-12-30',
      profitMargin: 22
    },
    {
      id: '3',
      studyTitle: 'Diabetes Management Study - DM-401',
      sponsor: 'Pharma Solutions',
      totalBudget: 950000,
      utilizedAmount: 285000,
      utilization: 30,
      status: 'startup',
      forecastCompletion: '2025-03-15',
      profitMargin: 15
    }
  ];

  const invoicesPending = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-0156',
      study: 'Phase III Oncology Study',
      sponsor: 'BioPharma Corp',
      amount: 450000,
      milestone: 'First Patient In',
      readyToSend: true,
      dueDate: '2024-02-15',
      status: 'draft'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-0157',
      study: 'Cardiovascular Device Trial',
      sponsor: 'MedDevice Inc',
      amount: 280000,
      milestone: 'Site Activation Complete',
      readyToSend: true,
      dueDate: '2024-02-20',
      status: 'ready_to_send'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-0158',
      study: 'Diabetes Management Study',
      sponsor: 'Pharma Solutions',
      amount: 125000,
      milestone: '25% Enrollment',
      readyToSend: false,
      dueDate: '2024-02-28',
      status: 'milestone_pending'
    }
  ];

  const receivablesTracking = [
    {
      id: '1',
      invoiceNumber: 'INV-2024-0145',
      sponsor: 'BioPharma Corp',
      amount: 380000,
      invoiceDate: '2024-01-05',
      dueDate: '2024-02-04',
      daysOverdue: 14,
      status: 'overdue',
      lastFollowUp: '2024-02-10'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-0148',
      sponsor: 'MedDevice Inc',
      amount: 220000,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-14',
      daysOverdue: 4,
      status: 'overdue',
      lastFollowUp: '2024-02-12'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024-0152',
      sponsor: 'Pharma Solutions',
      amount: 95000,
      invoiceDate: '2024-01-20',
      dueDate: '2024-02-19',
      daysOverdue: 0,
      status: 'current',
      lastFollowUp: null
    }
  ];

  const milestoneTracking = [
    {
      id: '1',
      study: 'Phase III Oncology Study',
      milestone: 'Database Lock',
      scheduledDate: '2024-03-01',
      probability: 95,
      invoiceAmount: 320000,
      status: 'on_track'
    },
    {
      id: '2',
      study: 'Cardiovascular Device Trial',
      milestone: '50% Enrollment',
      scheduledDate: '2024-02-28',
      probability: 78,
      invoiceAmount: 180000,
      status: 'at_risk'
    },
    {
      id: '3',
      study: 'Diabetes Management Study',
      milestone: 'First Patient In',
      scheduledDate: '2024-02-25',
      probability: 60,
      invoiceAmount: 85000,
      status: 'delayed'
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
      startup: 'info',
      draft: 'default',
      ready_to_send: 'success',
      milestone_pending: 'warning',
      overdue: 'error',
      current: 'success',
      on_track: 'success',
      at_risk: 'warning',
      delayed: 'error'
    };
    return colors[status] || 'default';
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSendInvoice = (invoice: any) => {
    console.log('Sending invoice:', invoice);
    // Implementation for sending invoice
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        CRO Financial Operations
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Budget management, invoice generation, and receivables tracking
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Revenue</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(croMetrics.totalRevenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                YTD across {croMetrics.activeStudies} studies
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending Invoices</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(croMetrics.pendingInvoices)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ready to send
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Outstanding A/R</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {formatCurrency(croMetrics.outstandingReceivables)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg {croMetrics.averageCollectionDays} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Budget Accuracy</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {croMetrics.budgetAccuracy}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={croMetrics.budgetAccuracy} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Cash Flow Forecast</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                +{formatCurrency(2100000)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Next 90 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="warning">
            3 invoices totaling $695K are ready to send - review and submit to sponsors
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="error">
            2 payments are overdue by more than 10 days - follow up required
          </Alert>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Study Budgets" />
          <Tab label="Invoice Management" />
          <Tab label="Receivables Tracking" />
          <Tab label="Milestone Forecast" />
        </Tabs>
      </Box>

      {/* Study Budgets Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Study Budget Performance</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setBudgetDialog(true)}
          >
            Create Budget
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Study Title</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Total Budget</TableCell>
                <TableCell>Utilized</TableCell>
                <TableCell>Utilization %</TableCell>
                <TableCell>Profit Margin</TableCell>
                <TableCell>Forecast Completion</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studyBudgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.studyTitle}</TableCell>
                  <TableCell>{budget.sponsor}</TableCell>
                  <TableCell>{formatCurrency(budget.totalBudget)}</TableCell>
                  <TableCell>{formatCurrency(budget.utilizedAmount)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={budget.utilization} 
                        sx={{ width: 60, mr: 1 }}
                      />
                      {budget.utilization}%
                    </Box>
                  </TableCell>
                  <TableCell>{budget.profitMargin}%</TableCell>
                  <TableCell>{budget.forecastCompletion}</TableCell>
                  <TableCell>
                    <Chip 
                      label={budget.status} 
                      color={getStatusColor(budget.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Invoice Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Invoice Generation & Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setInvoiceDialog(true)}
          >
            Create Invoice
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Study</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoicesPending.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.study}</TableCell>
                  <TableCell>{invoice.sponsor}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{invoice.milestone}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.status.replace('_', ' ')} 
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.readyToSend ? (
                      <Button 
                        size="small" 
                        startIcon={<Send />}
                        onClick={() => handleSendInvoice(invoice)}
                      >
                        Send
                      </Button>
                    ) : (
                      <Button size="small" startIcon={<Visibility />}>
                        View
                      </Button>
                    )}
                    <IconButton size="small">
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Receivables Tracking Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Accounts Receivable Management
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Invoice Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Follow-up</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receivablesTracking.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>{receivable.invoiceNumber}</TableCell>
                  <TableCell>{receivable.sponsor}</TableCell>
                  <TableCell>{formatCurrency(receivable.amount)}</TableCell>
                  <TableCell>{receivable.invoiceDate}</TableCell>
                  <TableCell>{receivable.dueDate}</TableCell>
                  <TableCell>
                    {receivable.daysOverdue > 0 ? (
                      <Typography color="error">{receivable.daysOverdue}</Typography>
                    ) : (
                      <Typography color="success">Current</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={receivable.status} 
                      color={getStatusColor(receivable.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{receivable.lastFollowUp || 'N/A'}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Send />}>
                      Follow Up
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Milestone Forecast Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Upcoming Milestone Forecast</Typography>
          <IconButton>
            <Refresh />
          </IconButton>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Study</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Scheduled Date</TableCell>
                <TableCell>Probability</TableCell>
                <TableCell>Invoice Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {milestoneTracking.map((milestone) => (
                <TableRow key={milestone.id}>
                  <TableCell>{milestone.study}</TableCell>
                  <TableCell>{milestone.milestone}</TableCell>
                  <TableCell>{milestone.scheduledDate}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={milestone.probability} 
                        sx={{ width: 60, mr: 1 }}
                      />
                      {milestone.probability}%
                    </Box>
                  </TableCell>
                  <TableCell>{formatCurrency(milestone.invoiceAmount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={milestone.status.replace('_', ' ')} 
                      color={getStatusColor(milestone.status)}
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

      {/* Budget Creation Dialog */}
      <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Study Budget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Study"
                select
              >
                <MenuItem value="1">Phase III Oncology Study</MenuItem>
                <MenuItem value="2">Cardiovascular Device Trial</MenuItem>
                <MenuItem value="3">Diabetes Management Study</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Budget"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Expected Profit Margin"
                type="number"
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Budget</Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Creation Dialog */}
      <Dialog open={invoiceDialog} onClose={() => setInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Study"
                select
              >
                <MenuItem value="1">Phase III Oncology Study</MenuItem>
                <MenuItem value="2">Cardiovascular Device Trial</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Milestone"
                select
              >
                <MenuItem value="1">First Patient In</MenuItem>
                <MenuItem value="2">Site Activation</MenuItem>
                <MenuItem value="3">Database Lock</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Invoice Amount"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Invoice</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
