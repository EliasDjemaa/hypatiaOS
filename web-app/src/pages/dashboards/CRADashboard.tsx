import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Visibility,
  Assignment,
  Warning,
  CheckCircle,
  Flag,
  TravelExplore,
  Assessment,
  Upload,
  Download,
  Comment,
  Schedule,
  LocationOn,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data for CRA dashboard
const mockSites = [
  { 
    id: 1, 
    name: 'Boston Medical Center', 
    pi: 'Dr. Sarah Johnson', 
    status: 'Active', 
    enrollment: 12, 
    target: 15, 
    lastVisit: '2024-01-10',
    nextVisit: '2024-01-25',
    queries: 3,
    riskScore: 'Low'
  },
  { 
    id: 2, 
    name: 'Mayo Clinic', 
    pi: 'Dr. Michael Chen', 
    status: 'Active', 
    enrollment: 8, 
    target: 20, 
    lastVisit: '2024-01-08',
    nextVisit: '2024-01-22',
    queries: 7,
    riskScore: 'Medium'
  },
  { 
    id: 3, 
    name: 'Johns Hopkins', 
    pi: 'Dr. Emily Rodriguez', 
    status: 'Active', 
    enrollment: 18, 
    target: 25, 
    lastVisit: '2024-01-12',
    nextVisit: '2024-01-28',
    queries: 1,
    riskScore: 'Low'
  },
];

const mockMonitoringTasks = [
  { id: 1, site: 'Boston Medical Center', type: 'Site Visit', dueDate: '2024-01-25', priority: 'High', status: 'Scheduled' },
  { id: 2, site: 'Mayo Clinic', type: 'Remote Monitoring', dueDate: '2024-01-22', priority: 'Medium', status: 'In Progress' },
  { id: 3, site: 'Johns Hopkins', type: 'Query Resolution', dueDate: '2024-01-20', priority: 'High', status: 'Overdue' },
  { id: 4, site: 'Boston Medical Center', type: 'Document Review', dueDate: '2024-01-30', priority: 'Low', status: 'Pending' },
];

const mockQueries = [
  { id: 1, site: 'Boston Medical Center', participant: 'S001', form: 'Demographics', field: 'Height', message: 'Please verify height measurement', priority: 'Medium', status: 'Open', age: 2 },
  { id: 2, site: 'Mayo Clinic', participant: 'S003', form: 'Vital Signs', field: 'Blood Pressure', message: 'BP reading seems high, please confirm', priority: 'High', status: 'Open', age: 1 },
  { id: 3, site: 'Johns Hopkins', participant: 'S007', form: 'Lab Results', field: 'Hemoglobin', message: 'Lab value out of normal range', priority: 'High', status: 'Responded', age: 3 },
];

const mockFindings = [
  { id: 1, site: 'Mayo Clinic', type: 'Major', description: 'Missing informed consent signature', status: 'Open', severity: 'Critical' },
  { id: 2, site: 'Boston Medical Center', type: 'Minor', description: 'Late visit window', status: 'Resolved', severity: 'Low' },
  { id: 3, site: 'Johns Hopkins', type: 'Major', description: 'Protocol deviation - concomitant medication', status: 'Open', severity: 'High' },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const CRADashboard: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<any>(null);
  const [monitoringDialogOpen, setMonitoringDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newFinding, setNewFinding] = useState({
    type: '',
    description: '',
    severity: '',
    correctionRequired: false,
  });

  const siteColumns: GridColDef[] = [
    { field: 'name', headerName: 'Site Name', width: 200 },
    { field: 'pi', headerName: 'Principal Investigator', width: 180 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Active' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    { 
      field: 'enrollment', 
      headerName: 'Enrollment', 
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            {params.value}/{params.row.target}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(params.value / params.row.target) * 100} 
            sx={{ width: 40, height: 4 }}
            color={params.value / params.row.target >= 0.8 ? 'success' : 'warning'}
          />
        </Box>
      )
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 120 },
    { field: 'nextVisit', headerName: 'Next Visit', width: 120 },
    { 
      field: 'queries', 
      headerName: 'Open Queries', 
      width: 120,
      renderCell: (params) => (
        <Badge badgeContent={params.value} color={params.value > 5 ? 'error' : 'primary'}>
          <Flag />
        </Badge>
      )
    },
    { 
      field: 'riskScore', 
      headerName: 'Risk Score', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Low' ? 'success' : 
            params.value === 'Medium' ? 'warning' : 'error'
          }
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => setSelectedSite(params.row)}>
            <Visibility />
          </IconButton>
          <IconButton size="small" onClick={() => setMonitoringDialogOpen(true)}>
            <TravelExplore />
          </IconButton>
          <IconButton size="small">
            <Assessment />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          CRA Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<TravelExplore />}>
            Schedule Visit
          </Button>
          <Button variant="outlined" startIcon={<Upload />}>
            Upload Report
          </Button>
          <Button variant="contained" startIcon={<Assessment />}>
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Sites
                  </Typography>
                  <Typography variant="h4">
                    12
                  </Typography>
                </Box>
                <LocationOn color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Queries
                  </Typography>
                  <Typography variant="h4">
                    <Badge badgeContent={8} color="error">
                      23
                    </Badge>
                  </Typography>
                </Box>
                <Flag color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Monitoring Tasks
                  </Typography>
                  <Typography variant="h4">
                    7
                  </Typography>
                </Box>
                <Assignment color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Overall Compliance
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    96%
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="CRA dashboard tabs">
            <Tab label="Sites Overview" />
            <Tab label="Monitoring Tasks" />
            <Tab label="Data Queries" />
            <Tab label="Findings" />
          </Tabs>
        </Box>

        {/* Sites Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={mockSites}
              columns={siteColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
            />
          </Box>
        </TabPanel>

        {/* Monitoring Tasks Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell>Task Type</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockMonitoringTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.site}</TableCell>
                    <TableCell>{task.type}</TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={task.priority} 
                        size="small"
                        color={
                          task.priority === 'High' ? 'error' :
                          task.priority === 'Medium' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status} 
                        size="small"
                        color={
                          task.status === 'Completed' ? 'success' :
                          task.status === 'Overdue' ? 'error' :
                          task.status === 'In Progress' ? 'info' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Comment />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Data Queries Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info">
              You have 8 high-priority queries that require immediate attention.
            </Alert>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell>Participant</TableCell>
                  <TableCell>Form</TableCell>
                  <TableCell>Field</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Age (days)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockQueries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell>{query.site}</TableCell>
                    <TableCell>{query.participant}</TableCell>
                    <TableCell>{query.form}</TableCell>
                    <TableCell>{query.field}</TableCell>
                    <TableCell>{query.message}</TableCell>
                    <TableCell>
                      <Chip 
                        label={query.priority} 
                        size="small"
                        color={
                          query.priority === 'High' ? 'error' :
                          query.priority === 'Medium' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={query.status} 
                        size="small"
                        color={query.status === 'Open' ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={query.age > 7 ? 'error' : query.age > 3 ? 'warning.main' : 'text.primary'}
                      >
                        {query.age}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Comment />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Findings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Monitoring Findings</Typography>
            <Button variant="contained" size="small">
              Add Finding
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Site</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockFindings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>{finding.site}</TableCell>
                    <TableCell>
                      <Chip 
                        label={finding.type} 
                        size="small"
                        color={finding.type === 'Major' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{finding.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={finding.severity} 
                        size="small"
                        color={
                          finding.severity === 'Critical' ? 'error' :
                          finding.severity === 'High' ? 'warning' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={finding.status} 
                        size="small"
                        color={finding.status === 'Resolved' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small">
                        <Comment />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Site Monitoring Dialog */}
      <Dialog open={monitoringDialogOpen} onClose={() => setMonitoringDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Monitoring Visit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Site</InputLabel>
                <Select defaultValue="">
                  {mockSites.map((site) => (
                    <MenuItem key={site.id} value={site.id}>
                      {site.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Visit Type</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="initiation">Site Initiation</MenuItem>
                  <MenuItem value="monitoring">Routine Monitoring</MenuItem>
                  <MenuItem value="closeout">Site Close-out</MenuItem>
                  <MenuItem value="corrective">Corrective Action</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Visit Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (hours)"
                type="number"
                defaultValue={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Visit Objectives"
                multiline
                rows={3}
                placeholder="Describe the objectives and scope of this monitoring visit..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMonitoringDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Schedule Visit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
