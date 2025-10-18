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
} from '@mui/material';
import {
  PersonAdd,
  Assignment,
  Schedule,
  Notifications,
  CheckCircle,
  Warning,
  Upload,
  Edit,
  Visibility,
  Add,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data for demonstration
const mockParticipants = [
  { id: 1, subjectId: 'S001', status: 'Enrolled', lastVisit: '2024-01-15', nextVisit: '2024-02-15', compliance: 95 },
  { id: 2, subjectId: 'S002', status: 'Screening', lastVisit: '2024-01-10', nextVisit: '2024-01-24', compliance: 100 },
  { id: 3, subjectId: 'S003', status: 'Enrolled', lastVisit: '2024-01-12', nextVisit: '2024-02-12', compliance: 88 },
  { id: 4, subjectId: 'S004', status: 'Completed', lastVisit: '2024-01-08', nextVisit: null, compliance: 92 },
];

const mockTasks = [
  { id: 1, type: 'CRF Entry', participant: 'S001', dueDate: '2024-01-20', priority: 'High', status: 'Pending' },
  { id: 2, type: 'Consent Renewal', participant: 'S002', dueDate: '2024-01-22', priority: 'Medium', status: 'Pending' },
  { id: 3, type: 'Lab Upload', participant: 'S003', dueDate: '2024-01-18', priority: 'High', status: 'Overdue' },
  { id: 4, type: 'Visit Schedule', participant: 'S004', dueDate: '2024-01-25', priority: 'Low', status: 'Pending' },
];

const mockUpcomingVisits = [
  { id: 1, participant: 'S001', visitType: 'Week 4 Follow-up', scheduledTime: '2024-01-20 09:00', status: 'Confirmed' },
  { id: 2, participant: 'S002', visitType: 'Screening Visit', scheduledTime: '2024-01-21 14:30', status: 'Confirmed' },
  { id: 3, participant: 'S003', visitType: 'Week 2 Follow-up', scheduledTime: '2024-01-22 10:15', status: 'Pending' },
];

export const SiteCoordinatorDashboard: React.FC = () => {
  const [selectedParticipant, setSelectedParticipant] = useState<any>(null);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    email: '',
    phone: '',
  });

  const participantColumns: GridColDef[] = [
    { field: 'subjectId', headerName: 'Subject ID', width: 120 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'Enrolled' ? 'success' : 
            params.value === 'Screening' ? 'warning' : 
            params.value === 'Completed' ? 'info' : 'default'
          }
          size="small"
        />
      )
    },
    { field: 'lastVisit', headerName: 'Last Visit', width: 130 },
    { field: 'nextVisit', headerName: 'Next Visit', width: 130 },
    { 
      field: 'compliance', 
      headerName: 'Compliance %', 
      width: 130,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={params.value} 
            sx={{ width: 60, height: 6 }}
            color={params.value >= 90 ? 'success' : params.value >= 75 ? 'warning' : 'error'}
          />
          <Typography variant="caption">{params.value}%</Typography>
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => setSelectedParticipant(params.row)}>
            <Visibility />
          </IconButton>
          <IconButton size="small">
            <Edit />
          </IconButton>
          <IconButton size="small" onClick={() => setVisitDialogOpen(true)}>
            <Schedule />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleEnrollParticipant = () => {
    // In real implementation, this would call the API
    console.log('Enrolling participant:', newParticipant);
    setEnrollmentDialogOpen(false);
    setNewParticipant({
      firstName: '',
      lastName: '',
      dateOfBirth: null,
      gender: '',
      email: '',
      phone: '',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Site Coordinator Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => setEnrollmentDialogOpen(true)}
        >
          Enroll New Participant
        </Button>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Participants
                  </Typography>
                  <Typography variant="h4">
                    12
                  </Typography>
                </Box>
                <PersonAdd color="primary" sx={{ fontSize: 40 }} />
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
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4">
                    <Badge badgeContent={3} color="error">
                      8
                    </Badge>
                  </Typography>
                </Box>
                <Assignment color="warning" sx={{ fontSize: 40 }} />
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
                    Upcoming Visits
                  </Typography>
                  <Typography variant="h4">
                    5
                  </Typography>
                </Box>
                <Schedule color="info" sx={{ fontSize: 40 }} />
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
                    Compliance Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    94%
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Participants Table */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Participants
              </Typography>
              <Box sx={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={mockParticipants}
                  columns={participantColumns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  disableSelectionOnClick
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasks and Notifications */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Pending Tasks */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment />
                    Pending Tasks
                    <Badge badgeContent={3} color="error" />
                  </Typography>
                  <List dense>
                    {mockTasks.map((task) => (
                      <ListItem key={task.id} divider>
                        <ListItemIcon>
                          {task.status === 'Overdue' ? (
                            <Warning color="error" />
                          ) : (
                            <Assignment color={task.priority === 'High' ? 'error' : 'primary'} />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={task.type}
                          secondary={`${task.participant} - Due: ${task.dueDate}`}
                        />
                        <Chip 
                          label={task.priority} 
                          size="small"
                          color={
                            task.priority === 'High' ? 'error' :
                            task.priority === 'Medium' ? 'warning' : 'default'
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Upcoming Visits */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule />
                    Upcoming Visits
                  </Typography>
                  <List dense>
                    {mockUpcomingVisits.map((visit) => (
                      <ListItem key={visit.id} divider>
                        <ListItemIcon>
                          <Schedule color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={visit.visitType}
                          secondary={`${visit.participant} - ${visit.scheduledTime}`}
                        />
                        <Chip 
                          label={visit.status} 
                          size="small"
                          color={visit.status === 'Confirmed' ? 'success' : 'warning'}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Participant Enrollment Dialog */}
      <Dialog open={enrollmentDialogOpen} onClose={() => setEnrollmentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Enroll New Participant</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newParticipant.firstName}
                onChange={(e) => setNewParticipant({ ...newParticipant, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newParticipant.lastName}
                onChange={(e) => setNewParticipant({ ...newParticipant, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date of Birth"
                value={newParticipant.dateOfBirth}
                onChange={(date) => setNewParticipant({ ...newParticipant, dateOfBirth: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={newParticipant.gender}
                  onChange={(e) => setNewParticipant({ ...newParticipant, gender: e.target.value })}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newParticipant.email}
                onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={newParticipant.phone}
                onChange={(e) => setNewParticipant({ ...newParticipant, phone: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollmentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEnrollParticipant} variant="contained">
            Send eConsent & Enroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Visit Scheduling Dialog */}
      <Dialog open={visitDialogOpen} onClose={() => setVisitDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Visit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Visit Type</InputLabel>
                <Select defaultValue="">
                  <MenuItem value="screening">Screening Visit</MenuItem>
                  <MenuItem value="baseline">Baseline Visit</MenuItem>
                  <MenuItem value="week2">Week 2 Follow-up</MenuItem>
                  <MenuItem value="week4">Week 4 Follow-up</MenuItem>
                  <MenuItem value="week8">Week 8 Follow-up</MenuItem>
                  <MenuItem value="eot">End of Treatment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Visit Date"
                value={null}
                onChange={() => {}}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                placeholder="Additional notes for this visit..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisitDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Schedule Visit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
