import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  EditOutlined as ManualIcon,
  UploadFileOutlined as ImportIcon,
  IntegrationInstructionsOutlined as IntegrateIcon,
  CloseOutlined as CloseIcon,
  ArrowBackOutlined as BackIcon,
  ArrowForwardOutlined as NextIcon,
  CheckCircleOutlined as CheckIcon,
  WarningOutlined as WarningIcon,
} from '@mui/icons-material';

interface CreateStudyModalProps {
  open: boolean;
  onClose: () => void;
  onStudyCreated: (study: any) => void;
}

type EntryMethod = 'manual' | 'import' | 'integrate' | null;

interface StudyFormData {
  // Study Details
  studyTitle: string;
  protocolId: string;
  therapeuticArea: string;
  studyPhase: string;
  startDate: string;
  endDate: string;
  studyType: string;
  croRole: string;
  studyStatus: string;
  numberOfCountries: number;
  
  // Sponsor Information
  sponsorName: string;
  sponsorContact: string;
  sponsorContractRef: string;
  
  // Site Information
  numberOfSites: number;
  siteList: Array<{
    country: string;
    city: string;
    siteName: string;
    principalInvestigator: string;
  }>;
  
  // Financials
  estimatedBudget: number;
  currency: string;
  paymentFrequency: string;
  budgetTemplate: string;
  
  // Forecasting
  forecastModel: string;
  enrollmentForecast: number;
  aiAssistEnabled: boolean;
}

const initialFormData: StudyFormData = {
  studyTitle: '',
  protocolId: '',
  therapeuticArea: '',
  studyPhase: '',
  startDate: '',
  endDate: '',
  studyType: 'Interventional',
  croRole: 'Lead CRO',
  studyStatus: 'Planned',
  numberOfCountries: 1,
  sponsorName: '',
  sponsorContact: '',
  sponsorContractRef: '',
  numberOfSites: 0,
  siteList: [],
  estimatedBudget: 0,
  currency: 'USD',
  paymentFrequency: 'Monthly',
  budgetTemplate: '',
  forecastModel: 'Patient-based',
  enrollmentForecast: 0,
  aiAssistEnabled: true,
};

const therapeuticAreas = [
  'Oncology', 'Cardiology', 'Neurology', 'Endocrinology', 'Infectious Disease',
  'Respiratory', 'Gastroenterology', 'Dermatology', 'Ophthalmology', 'Rare Diseases'
];

const studyPhases = ['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Pivotal', 'Real World Evidence'];

export const CreateStudyModal: React.FC<CreateStudyModalProps> = ({
  open,
  onClose,
  onStudyCreated
}) => {
  const [entryMethod, setEntryMethod] = useState<EntryMethod>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<StudyFormData>(initialFormData);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  const steps = ['Study Details', 'Sponsor Info', 'Sites & Budget', 'Review & Create'];

  const handleClose = () => {
    setEntryMethod(null);
    setActiveStep(0);
    setFormData(initialFormData);
    setValidationErrors([]);
    setImportFile(null);
    onClose();
  };

  const handleMethodSelect = (method: EntryMethod) => {
    setEntryMethod(method);
    if (method === 'manual') {
      setActiveStep(0);
    }
  };

  const handleInputChange = (field: keyof StudyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];
    
    switch (step) {
      case 0: // Study Details
        if (!formData.studyTitle) errors.push('Study Title is required');
        if (!formData.protocolId) errors.push('Protocol ID is required');
        if (!formData.therapeuticArea) errors.push('Therapeutic Area is required');
        if (!formData.studyPhase) errors.push('Study Phase is required');
        break;
      case 1: // Sponsor Info
        if (!formData.sponsorName) errors.push('Sponsor Name is required');
        if (!formData.sponsorContact) errors.push('Sponsor Contact is required');
        break;
      case 2: // Sites & Budget
        if (formData.numberOfSites <= 0) errors.push('Number of Sites must be greater than 0');
        if (formData.estimatedBudget <= 0) errors.push('Estimated Budget must be greater than 0');
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newStudy = {
        id: Date.now(),
        studyId: formData.protocolId,
        title: formData.studyTitle,
        sponsor: formData.sponsorName,
        therapeuticArea: formData.therapeuticArea,
        phase: formData.studyPhase,
        targetEnrollment: formData.enrollmentForecast,
        currentEnrollment: 0,
        enrollmentProgress: 0,
        sitesActivated: 0,
        totalSites: formData.numberOfSites,
        finalizedBudget: formData.estimatedBudget,
        budgetUtilization: 0,
        ctaStatus: 'Draft',
        healthScore: 50,
        healthIndicator: 'warning',
        lastUpdated: new Date().toISOString(),
        currency: formData.currency
      };
      
      onStudyCreated(newStudy);
      handleClose();
    } catch (error) {
      // Error handling - could be logged to error reporting service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      // Simulate file processing
      setImportProgress(0);
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const renderMethodSelection = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
        How would you like to create a new study?
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              border: '2px solid transparent',
              '&:hover': { 
                boxShadow: 3,
                borderColor: 'primary.main' 
              }
            }}
            onClick={() => handleMethodSelect('manual')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ManualIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Manual Entry
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Guided step-by-step form for entering study details manually
              </Typography>
              <Chip label="Recommended for new studies" color="primary" size="small" />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              border: '2px solid transparent',
              '&:hover': { 
                boxShadow: 3,
                borderColor: 'primary.main' 
              }
            }}
            onClick={() => handleMethodSelect('import')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <ImportIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Import from File
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Upload Excel/CSV file with study data using our template
              </Typography>
              <Chip label="Bulk import ready" color="success" size="small" />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              border: '2px solid transparent',
              '&:hover': { 
                boxShadow: 3,
                borderColor: 'primary.main' 
              }
            }}
            onClick={() => handleMethodSelect('integrate')}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <IntegrateIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                External Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect to CTMS, EDC, or ERP systems for automated data pull
              </Typography>
              <Chip label="Enterprise feature" color="warning" size="small" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderManualEntry = () => (
    <Box sx={{ p: 3 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Please fix the following errors:</Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {activeStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Study Title *"
              value={formData.studyTitle}
              onChange={(e) => handleInputChange('studyTitle', e.target.value)}
              placeholder="e.g., Phase III Oncology Trial - Advanced Lung Cancer"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Protocol ID *"
              value={formData.protocolId}
              onChange={(e) => handleInputChange('protocolId', e.target.value)}
              placeholder="e.g., ONCOLOGY-2024-001"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Therapeutic Area *</InputLabel>
              <Select
                value={formData.therapeuticArea}
                onChange={(e) => handleInputChange('therapeuticArea', e.target.value)}
                label="Therapeutic Area *"
              >
                {therapeuticAreas.map((area) => (
                  <MenuItem key={area} value={area}>{area}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Study Phase *</InputLabel>
              <Select
                value={formData.studyPhase}
                onChange={(e) => handleInputChange('studyPhase', e.target.value)}
                label="Study Phase *"
              >
                {studyPhases.map((phase) => (
                  <MenuItem key={phase} value={phase}>{phase}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="date"
              label="Planned End Date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sponsor Name *"
              value={formData.sponsorName}
              onChange={(e) => handleInputChange('sponsorName', e.target.value)}
              placeholder="e.g., BioPharma Corp"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Sponsor Contact *"
              value={formData.sponsorContact}
              onChange={(e) => handleInputChange('sponsorContact', e.target.value)}
              placeholder="e.g., john.doe@biopharma.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Sponsor Contract Reference"
              value={formData.sponsorContractRef}
              onChange={(e) => handleInputChange('sponsorContractRef', e.target.value)}
              placeholder="e.g., MSA-2024-001"
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Sites *"
              value={formData.numberOfSites}
              onChange={(e) => handleInputChange('numberOfSites', parseInt(e.target.value) || 0)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Estimated Budget *"
              value={formData.estimatedBudget}
              onChange={(e) => handleInputChange('estimatedBudget', parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="GBP">GBP</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Enrollment Forecast"
              value={formData.enrollmentForecast}
              onChange={(e) => handleInputChange('enrollmentForecast', parseInt(e.target.value) || 0)}
              placeholder="Total patients planned"
            />
          </Grid>
        </Grid>
      )}

      {activeStep === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>Review Study Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Study Title:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{formData.studyTitle}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Protocol ID:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{formData.protocolId}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Sponsor:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{formData.sponsorName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Estimated Budget:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: formData.currency }).format(formData.estimatedBudget)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderImportMethod = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Import Study Data</Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2">Template Required</Typography>
        <Typography variant="body2">
          Please use our standardized template for best results. 
          <Button size="small" sx={{ ml: 1 }}>Download Template</Button>
        </Typography>
      </Alert>

      <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 4, textAlign: 'center', mb: 3 }}>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outlined" component="span" startIcon={<ImportIcon />}>
            Choose File
          </Button>
        </label>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Supported formats: Excel (.xlsx, .xls) or CSV (.csv)
        </Typography>
      </Box>

      {importFile && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Selected File: {importFile.name}</Typography>
          <LinearProgress variant="determinate" value={importProgress} sx={{ mt: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Processing... {importProgress}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderIntegrationMethod = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>External System Integration</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>CTMS Integration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect to Clinical Trial Management System
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Configure CTMS
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>EDC Integration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pull data from Electronic Data Capture
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Configure EDC
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>ERP Integration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Connect to Enterprise Resource Planning
              </Typography>
              <Button variant="outlined" fullWidth disabled>
                Configure ERP
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Alert severity="warning" sx={{ mt: 3 }}>
        External integrations require additional setup and API credentials. Contact your system administrator.
      </Alert>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        },
      }}
      PaperProps={{ 
        sx: { 
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '90vh',
          overflow: 'hidden',
        } 
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: 4,
        py: 3,
        borderBottom: '1px solid #F3F4F6',
        backgroundColor: 'white',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {entryMethod && (
            <IconButton 
              onClick={() => setEntryMethod(null)} 
              sx={{ 
                mr: 2,
                backgroundColor: '#F9FAFB',
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              <BackIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1F2937' }}>
            {entryMethod === null ? 'Create New Study' : 
             entryMethod === 'manual' ? `Create Study - ${steps[activeStep]}` :
             entryMethod === 'import' ? 'Import Study Data' :
             'External Integration'}
          </Typography>
        </Box>
        <IconButton 
          onClick={handleClose}
          sx={{
            backgroundColor: '#F9FAFB',
            '&:hover': {
              backgroundColor: '#F3F4F6',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#FAFBFC', overflowY: 'auto' }}>
        {entryMethod === null && renderMethodSelection()}
        {entryMethod === 'manual' && renderManualEntry()}
        {entryMethod === 'import' && renderImportMethod()}
        {entryMethod === 'integrate' && renderIntegrationMethod()}
      </DialogContent>

      <DialogActions sx={{ 
        p: 4, 
        borderTop: '1px solid #F3F4F6', 
        backgroundColor: 'white',
        gap: 2,
      }}>
        {entryMethod === 'manual' && (
          <>
            <Button 
              onClick={handleBack} 
              disabled={activeStep === 0}
              startIcon={<BackIcon />}
            >
              Back
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            {activeStep < steps.length - 1 ? (
              <Button 
                variant="contained" 
                onClick={handleNext}
                endIcon={<NextIcon />}
              >
                Next
              </Button>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={isSubmitting ? null : <CheckIcon />}
              >
                {isSubmitting ? 'Creating Study...' : 'Create Study'}
              </Button>
            )}
          </>
        )}
        
        {entryMethod === 'import' && (
          <>
            <Button onClick={() => setEntryMethod(null)}>
              Back to Methods
            </Button>
            <Button 
              variant="contained" 
              disabled={!importFile || importProgress < 100}
            >
              Import Study
            </Button>
          </>
        )}
        
        {entryMethod === 'integrate' && (
          <Button onClick={() => setEntryMethod(null)}>
            Back to Methods
          </Button>
        )}
        
        {entryMethod === null && (
          <Button onClick={handleClose}>
            Cancel
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
