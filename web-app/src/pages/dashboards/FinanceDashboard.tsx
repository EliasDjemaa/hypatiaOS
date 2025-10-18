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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Receipt,
  Warning,
  Add,
  Visibility,
  Edit
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

export const FinanceDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [contractDialog, setContractDialog] = useState(false);
  const [budgetDialog, setBudgetDialog] = useState(false);

  // Mock data
  const financialMetrics = {
    totalContractValue: 12500000,
    activeContracts: 23,
    pendingInvoices: 145000,
    overduePayments: 32000,
    budgetUtilization: 68,
    forecastAccuracy: 94
  };

  const contracts = [
    {
      id: '1',
      number: 'MSA-2024-0001',
      title: 'Phase III Oncology Study - Site Agreement',
      sponsor: 'BioPharma Corp',
      value: 2500000,
      status: 'active',
      signedDate: '2024-01-15',
      expirationDate: '2025-12-31'
    },
    {
      id: '2',
      number: 'SC-2024-0012',
      title: 'Cardiovascular Device Trial',
      sponsor: 'MedDevice Inc',
      value: 1800000,
      status: 'pending_signature',
      signedDate: null,
      expirationDate: '2025-06-30'
    },
    {
      id: '3',
      number: 'SA-2024-0034',
      title: 'Diabetes Management Study',
      sponsor: 'Pharma Solutions',
      value: 950000,
      status: 'negotiating',
      signedDate: null,
      expirationDate: '2024-12-31'
    }
  ];

  const budgets = [
    {
      id: '1',
      number: 'SB-2024-0001',
      study: 'Phase III Oncology Study',
      totalBudget: 2500000,
      utilizedAmount: 1700000,
      utilization: 68,
      status: 'active',
      remainingBudget: 800000
    },
    {
      id: '2',
      number: 'STB-2024-0012',
      study: 'Cardiovascular Device Trial - Site 001',
      totalBudget: 450000,
      utilizedAmount: 180000,
      utilization: 40,
      status: 'active',
      remainingBudget: 270000
    },
    {
      id: '3',
      number: 'SB-2024-0023',
      study: 'Diabetes Management Study',
      totalBudget: 950000,
      utilizedAmount: 285000,
      utilization: 30,
      status: 'approved',
      remainingBudget: 665000
    }
  ];

  const invoices = [
    {
      id: '1',
      number: 'INV-2024-0156',
      study: 'Phase III Oncology Study',
      amount: 125000,
      dueDate: '2024-02-15',
      status: 'overdue',
      milestone: 'First Patient In'
    },
    {
      id: '2',
      number: 'INV-2024-0157',
      study: 'Cardiovascular Device Trial',
      amount: 85000,
      dueDate: '2024-02-28',
      status: 'sent',
      milestone: 'Site Activation'
    },
    {
      id: '3',
      number: 'INV-2024-0158',
      study: 'Diabetes Management Study',
      amount: 45000,
      dueDate: '2024-03-10',
      status: 'draft',
      milestone: 'Enrollment Milestone'
    }
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'default' } = {
      active: 'success',
      pending_signature: 'warning',
      negotiating: 'info',
      approved: 'success',
      overdue: 'error',
      sent: 'info',
      draft: 'default'
    };
    return colors[status] || 'default';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Operations Dashboard
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Contract Value</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(financialMetrics.totalContractValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {financialMetrics.activeContracts} active contracts
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
                {formatCurrency(financialMetrics.pendingInvoices)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting payment
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
                {formatCurrency(financialMetrics.overduePayments)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requires attention
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
                {financialMetrics.budgetUtilization}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={financialMetrics.budgetUtilization} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Forecast Accuracy</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {financialMetrics.forecastAccuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last 6 months
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="warning">
            3 contracts expire within 90 days - review renewal status
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="error">
            2 invoices are overdue - follow up on payments required
          </Alert>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Contracts" />
          <Tab label="Budgets" />
          <Tab label="Invoices & Payments" />
          <Tab label="Financial Forecast" />
        </Tabs>
      </Box>

      {/* Contracts Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Contract Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setContractDialog(true)}
          >
            New Contract
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract Number</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Sponsor</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expiration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.number}</TableCell>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{contract.sponsor}</TableCell>
                  <TableCell>{formatCurrency(contract.value)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={contract.status.replace('_', ' ')} 
                      color={getStatusColor(contract.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{contract.expirationDate}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Budgets Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Budget Management</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setBudgetDialog(true)}
          >
            New Budget
          </Button>
        </Box>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Budget Number</TableCell>
                <TableCell>Study</TableCell>
                <TableCell>Total Budget</TableCell>
                <TableCell>Utilized</TableCell>
                <TableCell>Utilization %</TableCell>
                <TableCell>Remaining</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.number}</TableCell>
                  <TableCell>{budget.study}</TableCell>
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
                  <TableCell>{formatCurrency(budget.remainingBudget)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={budget.status} 
                      color={getStatusColor(budget.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Invoices Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Invoices & Payments
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Study</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Milestone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.number}</TableCell>
                  <TableCell>{invoice.study}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.status} 
                      color={getStatusColor(invoice.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{invoice.milestone}</TableCell>
                  <TableCell>
                    <Button size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                    <Button size="small" startIcon={<Edit />}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Financial Forecast Tab */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Financial Forecast & Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          AI-powered financial forecasting and budget optimization recommendations will be displayed here.
        </Typography>
      </TabPanel>

      {/* Contract Dialog */}
      <Dialog open={contractDialog} onClose={() => setContractDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Contract</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Type"
                select
                defaultValue="study_contract"
              >
                <MenuItem value="master_service_agreement">Master Service Agreement</MenuItem>
                <MenuItem value="study_contract">Study Contract</MenuItem>
                <MenuItem value="site_agreement">Site Agreement</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sponsor Organization"
                select
              >
                <MenuItem value="1">BioPharma Corp</MenuItem>
                <MenuItem value="2">MedDevice Inc</MenuItem>
                <MenuItem value="3">Pharma Solutions</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contract Title"
                placeholder="Enter contract title"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contract Value"
                type="number"
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Currency"
                select
                defaultValue="USD"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Contract</Button>
        </DialogActions>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={budgetDialog} onClose={() => setBudgetDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget Type"
                select
                defaultValue="study_level"
              >
                <MenuItem value="study_level">Study Level</MenuItem>
                <MenuItem value="site_level">Site Level</MenuItem>
                <MenuItem value="pass_through">Pass Through</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
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
                label="Currency"
                select
                defaultValue="USD"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Budget</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
