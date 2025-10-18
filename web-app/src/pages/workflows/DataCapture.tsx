import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save,
  Lock,
  Warning,
  CheckCircle,
  Edit,
  Visibility,
  Upload,
  Download,
  Comment,
  Flag,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Mock data for CRF forms
const mockCRFForms = [
  {
    id: 1,
    name: 'Demographics',
    status: 'Complete',
    lastModified: '2024-01-15',
    fields: [
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, value: '1985-03-15' },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true, value: 'Female' },
      { name: 'race', label: 'Race', type: 'select', options: ['White', 'Black', 'Asian', 'Hispanic', 'Other'], required: true, value: 'White' },
      { name: 'height', label: 'Height (cm)', type: 'number', required: true, value: '165' },
      { name: 'weight', label: 'Weight (kg)', type: 'number', required: true, value: '68' },
    ]
  },
  {
    id: 2,
    name: 'Medical History',
    status: 'In Progress',
    lastModified: '2024-01-18',
    fields: [
      { name: 'previousConditions', label: 'Previous Medical Conditions', type: 'checkbox', options: ['Diabetes', 'Hypertension', 'Heart Disease', 'Cancer'], value: ['Hypertension'] },
      { name: 'currentMedications', label: 'Current Medications', type: 'textarea', value: 'Lisinopril 10mg daily' },
      { name: 'allergies', label: 'Known Allergies', type: 'textarea', value: 'Penicillin' },
      { name: 'smokingStatus', label: 'Smoking Status', type: 'radio', options: ['Never', 'Former', 'Current'], value: 'Former' },
    ]
  },
  {
    id: 3,
    name: 'Vital Signs',
    status: 'Pending',
    lastModified: null,
    fields: [
      { name: 'systolicBP', label: 'Systolic BP (mmHg)', type: 'number', required: true, value: '' },
      { name: 'diastolicBP', label: 'Diastolic BP (mmHg)', type: 'number', required: true, value: '' },
      { name: 'heartRate', label: 'Heart Rate (bpm)', type: 'number', required: true, value: '' },
      { name: 'temperature', label: 'Temperature (°C)', type: 'number', required: true, value: '' },
      { name: 'respiratoryRate', label: 'Respiratory Rate', type: 'number', required: true, value: '' },
    ]
  },
];

const mockQueries = [
  { id: 1, form: 'Demographics', field: 'Height', message: 'Height seems unusually low. Please verify.', status: 'Open', priority: 'Medium' },
  { id: 2, form: 'Medical History', field: 'Current Medications', message: 'Please specify dosage for all medications.', status: 'Responded', priority: 'Low' },
];

export const DataCapture: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<any>(mockCRFForms[0]);
  const [formData, setFormData] = useState<any>({});
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [queryResponse, setQueryResponse] = useState('');

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleSaveForm = () => {
    console.log('Saving form data:', formData);
    // In real implementation, this would call the EDC API
  };

  const handleLockForm = () => {
    console.log('Locking form:', selectedForm.name);
    // In real implementation, this would lock the form for editing
  };

  const renderFormField = (field: any) => {
    const value = formData[field.name] || field.value || '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            error={field.required && !value}
            helperText={field.required && !value ? 'This field is required' : ''}
          />
        );

      case 'date':
        return (
          <DatePicker
            label={field.label}
            value={value ? new Date(value) : null}
            onChange={(date) => handleFieldChange(field.name, date)}
            renderInput={(params) => (
              <TextField 
                {...params} 
                fullWidth 
                required={field.required}
                error={field.required && !value}
              />
            )}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              error={field.required && !value}
            >
              {field.options.map((option: string) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl component="fieldset" required={field.required}>
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
            </Typography>
            <RadioGroup
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options.map((option: string) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              {field.label}
            </Typography>
            {field.options.map((option: string) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const currentValues = value || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleFieldChange(field.name, newValues);
                    }}
                  />
                }
                label={option}
              />
            ))}
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            fullWidth
            label={field.label}
            multiline
            rows={3}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Electronic Data Capture (EDC)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Download />}>
            Export Data
          </Button>
          <Button variant="outlined" startIcon={<Upload />}>
            Import Lab Data
          </Button>
        </Box>
      </Box>

      {/* Participant Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="h6">
                Subject ID: S001
              </Typography>
            </Grid>
            <Grid item>
              <Chip label="Enrolled" color="success" />
            </Grid>
            <Grid item>
              <Typography variant="body2" color="text.secondary">
                Visit: Week 4 Follow-up | Date: January 20, 2024
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Form Selection */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                CRF Forms
              </Typography>
              {mockCRFForms.map((form) => (
                <Box
                  key={form.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: selectedForm.id === form.id ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: selectedForm.id === form.id ? 'primary.50' : 'transparent',
                  }}
                  onClick={() => setSelectedForm(form)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      {form.name}
                    </Typography>
                    {form.status === 'Complete' && <CheckCircle color="success" fontSize="small" />}
                    {form.status === 'In Progress' && <Edit color="warning" fontSize="small" />}
                    {form.status === 'Pending' && <Warning color="error" fontSize="small" />}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {form.status}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Queries */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Flag />
                Data Queries
              </Typography>
              {mockQueries.map((query) => (
                <Box
                  key={query.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: 1,
                    borderColor: query.status === 'Open' ? 'error.main' : 'success.main',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setSelectedQuery(query);
                    setQueryDialogOpen(true);
                  }}
                >
                  <Typography variant="subtitle2" color={query.status === 'Open' ? 'error' : 'success'}>
                    {query.form} - {query.field}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {query.message}
                  </Typography>
                  <Chip 
                    label={query.status} 
                    size="small" 
                    color={query.status === 'Open' ? 'error' : 'success'}
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Form Content */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  {selectedForm.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={handleSaveForm}
                  >
                    Save
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Lock />}
                    onClick={handleLockForm}
                    disabled={selectedForm.status !== 'Complete'}
                  >
                    Lock Form
                  </Button>
                </Box>
              </Box>

              {/* Form Validation Alert */}
              {selectedForm.status === 'Pending' && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  This form has required fields that need to be completed.
                </Alert>
              )}

              {/* Form Fields */}
              <Grid container spacing={3}>
                {selectedForm.fields.map((field: any, index: number) => (
                  <Grid item xs={12} sm={6} key={index}>
                    {renderFormField(field)}
                  </Grid>
                ))}
              </Grid>

              {/* Form Actions */}
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<Comment />}>
                  Add Comment
                </Button>
                <Button variant="outlined" startIcon={<Flag />}>
                  Raise Query
                </Button>
                <Button variant="outlined" startIcon={<Upload />}>
                  Attach Document
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Query Response Dialog */}
      <Dialog open={queryDialogOpen} onClose={() => setQueryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Data Query Response
        </DialogTitle>
        <DialogContent>
          {selectedQuery && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedQuery.form} - {selectedQuery.field}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Query: {selectedQuery.message}
              </Typography>
              <TextField
                fullWidth
                label="Response"
                multiline
                rows={4}
                value={queryResponse}
                onChange={(e) => setQueryResponse(e.target.value)}
                placeholder="Provide your response to this query..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQueryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            console.log('Query response:', queryResponse);
            setQueryDialogOpen(false);
            setQueryResponse('');
          }}>
            Submit Response
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
