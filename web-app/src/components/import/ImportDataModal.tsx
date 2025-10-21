/**
 * Import Data Modal Component
 * 
 * Provides CSV/Excel import functionality with data mapping interface.
 * Supports multiple data types (enrollment, financial, site data) and
 * validates data before import.
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  CloudUploadOutlined as UploadIcon,
  CheckCircleOutlined as CheckIcon,
  ErrorOutlined as ErrorIcon,
  VisibilityOutlined as PreviewIcon,
  DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import { Modal, Button, Input } from '../ui';
import { useToast } from '../ui/Toast';
import { dataService } from '../../services/DataService';

interface ImportDataModalProps {
  open: boolean;
  onClose: () => void;
  studyId: string;
}

interface ImportFile {
  file: File;
  type: ImportDataType;
  data: any[];
  mappings: Record<string, string>;
  validationErrors: ValidationError[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

type ImportDataType = 'enrollment' | 'patients' | 'sites' | 'budgets' | 'payments' | 'monitoring';

const steps = ['Upload File', 'Map Fields', 'Validate Data', 'Import'];

const dataTypeOptions = [
  { value: 'enrollment', label: 'Enrollment Data', description: 'Patient enrollment and screening data' },
  { value: 'patients', label: 'Patient Data', description: 'Patient demographics and visit information' },
  { value: 'sites', label: 'Site Data', description: 'Research site information and contacts' },
  { value: 'budgets', label: 'Budget Data', description: 'Financial budgets and allocations' },
  { value: 'payments', label: 'Payment Data', description: 'Payment records and invoices' },
  { value: 'monitoring', label: 'Monitoring Data', description: 'Site monitoring visit reports' },
];

const fieldMappings = {
  enrollment: {
    required: ['date', 'site_id', 'cumulative_enrollment'],
    optional: ['new_enrollments', 'target_enrollment', 'enrollment_rate'],
    suggested: {
      'Date': 'date',
      'Site ID': 'site_id',
      'Site': 'site_id',
      'Cumulative': 'cumulative_enrollment',
      'Total': 'cumulative_enrollment',
      'New': 'new_enrollments',
      'Target': 'target_enrollment',
      'Rate': 'enrollment_rate',
    },
  },
  patients: {
    required: ['patient_id', 'site_id', 'enrollment_date'],
    optional: ['screening_number', 'randomization_date', 'status', 'arm'],
    suggested: {
      'Patient ID': 'patient_id',
      'Subject ID': 'patient_id',
      'Site ID': 'site_id',
      'Site': 'site_id',
      'Enrollment Date': 'enrollment_date',
      'Screening': 'screening_number',
      'Randomization': 'randomization_date',
      'Status': 'status',
      'Arm': 'arm',
      'Treatment': 'arm',
    },
  },
  sites: {
    required: ['site_id', 'site_name', 'country'],
    optional: ['city', 'pi_name', 'pi_email', 'status', 'activation_date'],
    suggested: {
      'Site ID': 'site_id',
      'Site Name': 'site_name',
      'Name': 'site_name',
      'Country': 'country',
      'City': 'city',
      'PI': 'pi_name',
      'Principal Investigator': 'pi_name',
      'Email': 'pi_email',
      'Status': 'status',
      'Activation': 'activation_date',
    },
  },
  budgets: {
    required: ['category', 'planned_amount', 'currency'],
    optional: ['site_id', 'actual_amount', 'fiscal_year', 'quarter'],
    suggested: {
      'Category': 'category',
      'Planned': 'planned_amount',
      'Budget': 'planned_amount',
      'Actual': 'actual_amount',
      'Spent': 'actual_amount',
      'Currency': 'currency',
      'Site': 'site_id',
      'Year': 'fiscal_year',
      'Quarter': 'quarter',
    },
  },
  payments: {
    required: ['site_id', 'amount', 'due_date'],
    optional: ['payment_type', 'status', 'paid_date', 'invoice_id'],
    suggested: {
      'Site ID': 'site_id',
      'Site': 'site_id',
      'Amount': 'amount',
      'Due Date': 'due_date',
      'Type': 'payment_type',
      'Status': 'status',
      'Paid Date': 'paid_date',
      'Invoice': 'invoice_id',
    },
  },
  monitoring: {
    required: ['site_id', 'visit_date', 'monitor_name'],
    optional: ['visit_type', 'status', 'findings', 'action_items'],
    suggested: {
      'Site ID': 'site_id',
      'Site': 'site_id',
      'Date': 'visit_date',
      'Visit Date': 'visit_date',
      'Monitor': 'monitor_name',
      'Type': 'visit_type',
      'Status': 'status',
      'Findings': 'findings',
      'Actions': 'action_items',
    },
  },
};

export const ImportDataModal: React.FC<ImportDataModalProps> = ({
  open,
  onClose,
  studyId,
}) => {
  const { success, error, warning } = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [importFile, setImportFile] = useState<ImportFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
      error('Please select a CSV or Excel file');
      return;
    }

    setIsProcessing(true);
    
    // Parse CSV/Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = { _rowIndex: index + 2 }; // +2 for header and 0-based index
            headers.forEach((header, i) => {
              row[header] = values[i] || '';
            });
            return row;
          });

        setImportFile({
          file,
          type: 'enrollment', // Default type
          data,
          mappings: {},
          validationErrors: [],
        });
        
        setActiveStep(1);
        success(`Parsed ${data.length} rows from ${file.name}`);
      } catch (err) {
        error('Failed to parse file. Please check the format.');
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  }, [error, success]);

  const handleDataTypeChange = (type: ImportDataType) => {
    if (!importFile) return;

    // Auto-suggest field mappings based on headers
    const headers = Object.keys(importFile.data[0] || {}).filter(h => h !== '_rowIndex');
    const mappings: Record<string, string> = {};
    const suggestions = fieldMappings[type].suggested;

    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      for (const [pattern, field] of Object.entries(suggestions)) {
        if (normalizedHeader.includes(pattern.toLowerCase()) || 
            pattern.toLowerCase().includes(normalizedHeader)) {
          mappings[header] = field;
          break;
        }
      }
    });

    setImportFile({
      ...importFile,
      type,
      mappings,
    });
  };

  const handleFieldMapping = (header: string, field: string) => {
    if (!importFile) return;

    setImportFile({
      ...importFile,
      mappings: {
        ...importFile.mappings,
        [header]: field,
      },
    });
  };

  const validateData = useCallback(() => {
    if (!importFile) return;

    const errors: ValidationError[] = [];
    const requiredFields = fieldMappings[importFile.type].required;
    const mappedFields = Object.values(importFile.mappings);

    // Check required fields are mapped
    requiredFields.forEach(field => {
      if (!mappedFields.includes(field)) {
        errors.push({
          row: 0,
          field,
          message: `Required field '${field}' is not mapped`,
          severity: 'error',
        });
      }
    });

    // Validate data rows
    importFile.data.forEach((row, index) => {
      Object.entries(importFile.mappings).forEach(([header, field]) => {
        const value = row[header];
        
        if (requiredFields.includes(field) && (!value || value.trim() === '')) {
          errors.push({
            row: row._rowIndex,
            field,
            message: `Missing required value for ${field}`,
            severity: 'error',
          });
        }

        // Type-specific validations
        if (field.includes('date') && value && !isValidDate(value)) {
          errors.push({
            row: row._rowIndex,
            field,
            message: `Invalid date format: ${value}`,
            severity: 'error',
          });
        }

        if (field.includes('amount') && value && isNaN(Number(value))) {
          errors.push({
            row: row._rowIndex,
            field,
            message: `Invalid number format: ${value}`,
            severity: 'error',
          });
        }

        if (field.includes('email') && value && !isValidEmail(value)) {
          errors.push({
            row: row._rowIndex,
            field,
            message: `Invalid email format: ${value}`,
            severity: 'warning',
          });
        }
      });
    });

    setImportFile({
      ...importFile,
      validationErrors: errors,
    });

    if (errors.filter(e => e.severity === 'error').length === 0) {
      setActiveStep(3);
      success('Data validation passed');
    } else {
      warning(`Found ${errors.length} validation issues`);
    }
  }, [importFile, success, warning]);

  const handleImport = async () => {
    if (!importFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Transform data according to mappings
      const transformedData = importFile.data.map(row => {
        const transformed: any = {};
        Object.entries(importFile.mappings).forEach(([header, field]) => {
          transformed[field] = row[header];
        });
        return transformed;
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Import data through data service
      const result = await dataService.importStudyData(
        studyId,
        transformedData,
        `csv-import-${importFile.type}`
      );

      clearInterval(progressInterval);
      setProgress(100);

      if (result.status === 'Success') {
        success(`Successfully imported ${result.recordsSuccessful} records`);
        onClose();
      } else {
        error(`Import failed: ${result.errors[0]?.error || 'Unknown error'}`);
      }
    } catch (err) {
      error('Import failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                startIcon={<UploadIcon />}
                sx={{ mb: 2 }}
                component="span"
              >
                Choose File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Maximum file size: 10MB
            </Typography>
          </Box>
        );

      case 1:
        return (
          <Box>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Data Type</InputLabel>
              <Select
                value={importFile?.type || ''}
                onChange={(e) => handleDataTypeChange(e.target.value as ImportDataType)}
                label="Data Type"
              >
                {dataTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {importFile && (
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>File Column</TableCell>
                      <TableCell>Map To Field</TableCell>
                      <TableCell>Sample Data</TableCell>
                      <TableCell>Required</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.keys(importFile.data[0] || {})
                      .filter(h => h !== '_rowIndex')
                      .map(header => {
                        const mapping = fieldMappings[importFile.type];
                        const isRequired = Object.values(importFile.mappings).includes(header) && 
                          mapping.required.includes(importFile.mappings[header]);
                        
                        return (
                          <TableRow key={header}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {header}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 150 }}>
                                <Select
                                  value={importFile.mappings[header] || ''}
                                  onChange={(e) => handleFieldMapping(header, e.target.value)}
                                  displayEmpty
                                >
                                  <MenuItem value="">
                                    <em>Skip field</em>
                                  </MenuItem>
                                  {[...mapping.required, ...mapping.optional].map(field => (
                                    <MenuItem key={field} value={field}>
                                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {importFile.data[0]?.[header] || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {isRequired && (
                                <Chip label="Required" size="small" color="primary" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            {importFile?.validationErrors.length === 0 ? (
              <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
                Data validation passed! Ready to import {importFile.data.length} records.
              </Alert>
            ) : (
              <Box>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Found {importFile?.validationErrors.filter(e => e.severity === 'error').length} errors and{' '}
                  {importFile?.validationErrors.filter(e => e.severity === 'warning').length} warnings
                </Alert>
                
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Field</TableCell>
                        <TableCell>Issue</TableCell>
                        <TableCell>Severity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {importFile?.validationErrors.slice(0, 50).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.field}</TableCell>
                          <TableCell>{error.message}</TableCell>
                          <TableCell>
                            <Chip
                              label={error.severity}
                              size="small"
                              color={error.severity === 'error' ? 'error' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        );

      case 3:
        return (
          <Box>
            {isProcessing ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Importing data... {progress}%
                </Typography>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            ) : (
              <Alert severity="info">
                Ready to import {importFile?.data.length} records of {importFile?.type} data.
                This action cannot be undone.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return importFile !== null;
      case 1:
        return importFile?.type && Object.keys(importFile.mappings).length > 0;
      case 2:
        return importFile?.validationErrors.filter(e => e.severity === 'error').length === 0;
      case 3:
        return !isProcessing;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      validateData();
    } else if (activeStep === 3) {
      handleImport();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setImportFile(null);
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Data"
      maxWidth="lg"
      actions={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
              Back
            </Button>
          )}
          {activeStep < 3 && (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed() || isProcessing}
            >
              {activeStep === 1 ? 'Validate' : 'Next'}
            </Button>
          )}
          {activeStep === 3 && (
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!canProceed() || isProcessing}
              loading={isProcessing}
            >
              Import Data
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ width: '100%', mb: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {renderStepContent()}
    </Modal>
  );
};

// Helper functions
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default ImportDataModal;
