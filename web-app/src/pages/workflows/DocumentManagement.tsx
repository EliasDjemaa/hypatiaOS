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
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Upload,
  Download,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Folder,
  Description,
  CloudUpload,
  Search,
  FilterList,
  ExpandMore,
  Assignment,
  Gavel,
  LocalHospital,
  Science,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Mock data for eTMF
const mockDocuments = [
  {
    id: 1,
    name: 'Protocol v2.0',
    type: 'Protocol',
    category: 'Essential Documents',
    version: '2.0',
    uploadDate: '2024-01-15',
    uploadedBy: 'Dr. Sarah Johnson',
    status: 'Approved',
    size: '2.4 MB',
    tags: ['Protocol', 'Amendment', 'v2.0'],
    etmfSection: '8.1.1',
    required: true,
    completeness: 'Complete'
  },
  {
    id: 2,
    name: 'Informed Consent Form',
    type: 'Consent',
    category: 'Regulatory',
    version: '1.5',
    uploadDate: '2024-01-12',
    uploadedBy: 'Jane Smith',
    status: 'Under Review',
    size: '856 KB',
    tags: ['Consent', 'Patient'],
    etmfSection: '8.2.1',
    required: true,
    completeness: 'Incomplete'
  },
  {
    id: 3,
    name: 'Investigator CV - Dr. Chen',
    type: 'CV',
    category: 'Site Documents',
    version: '1.0',
    uploadDate: '2024-01-10',
    uploadedBy: 'Michael Chen',
    status: 'Approved',
    size: '1.2 MB',
    tags: ['CV', 'Investigator'],
    etmfSection: '8.3.2',
    required: true,
    completeness: 'Complete'
  },
  {
    id: 4,
    name: 'Lab Certification',
    type: 'Certification',
    category: 'Vendor Documents',
    version: '1.0',
    uploadDate: '2024-01-08',
    uploadedBy: 'Lab Manager',
    status: 'Approved',
    size: '3.1 MB',
    tags: ['Lab', 'Certification'],
    etmfSection: '8.4.1',
    required: true,
    completeness: 'Complete'
  },
  {
    id: 5,
    name: 'Monitoring Report - Visit 1',
    type: 'Monitoring Report',
    category: 'Monitoring',
    version: '1.0',
    uploadDate: '2024-01-18',
    uploadedBy: 'CRA Johnson',
    status: 'Draft',
    size: '4.2 MB',
    tags: ['Monitoring', 'Site Visit'],
    etmfSection: '8.5.1',
    required: false,
    completeness: 'In Progress'
  },
];

const mockETMFSections = [
  {
    section: '8.1 - Protocol and Protocol Amendments',
    required: 3,
    complete: 3,
    percentage: 100,
    documents: ['Protocol v2.0', 'Amendment 1', 'Amendment 2']
  },
  {
    section: '8.2 - Informed Consent',
    required: 2,
    complete: 1,
    percentage: 50,
    documents: ['Informed Consent Form']
  },
  {
    section: '8.3 - Investigator Information',
    required: 5,
    complete: 4,
    percentage: 80,
    documents: ['CV', 'Medical License', 'Training Records', 'Delegation Log']
  },
  {
    section: '8.4 - Laboratory Information',
    required: 3,
    complete: 3,
    percentage: 100,
    documents: ['Lab Certification', 'Normal Ranges', 'Lab Manual']
  },
  {
    section: '8.5 - Monitoring',
    required: 0,
    complete: 1,
    percentage: 100,
    documents: ['Monitoring Report - Visit 1']
  },
];

const mockAITags = [
  { tag: 'Protocol', confidence: 0.95, suggested: true },
  { tag: 'Amendment', confidence: 0.88, suggested: true },
  { tag: 'Regulatory', confidence: 0.92, suggested: false },
  { tag: 'Site Document', confidence: 0.85, suggested: true },
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

export const DocumentManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: '',
    category: '',
    tags: '',
    description: '',
    file: null as File | null,
  });

  const documentColumns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Document Name', 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'version', headerName: 'Version', width: 80 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={
            params.value === 'Approved' ? 'success' :
            params.value === 'Under Review' ? 'warning' :
            params.value === 'Draft' ? 'info' : 'default'
          }
        />
      )
    },
    { field: 'uploadDate', headerName: 'Upload Date', width: 120 },
    { field: 'uploadedBy', headerName: 'Uploaded By', width: 150 },
    { field: 'size', headerName: 'Size', width: 100 },
    { 
      field: 'completeness', 
      headerName: 'Completeness', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small"
          color={
            params.value === 'Complete' ? 'success' :
            params.value === 'Incomplete' ? 'error' : 'warning'
          }
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => setSelectedDocument(params.row)}>
            <Visibility />
          </IconButton>
          <IconButton size="small">
            <Download />
          </IconButton>
          <IconButton size="small">
            <Edit />
          </IconButton>
        </Box>
      ),
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadDocument = () => {
    console.log('Uploading document:', newDocument);
    setUploadDialogOpen(false);
    setNewDocument({
      name: '',
      type: '',
      category: '',
      tags: '',
      description: '',
      file: null,
    });
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Document Management (eTMF)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Search />}>
            Advanced Search
          </Button>
          <Button variant="outlined" startIcon={<Download />}>
            Export eTMF
          </Button>
          <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadDialogOpen(true)}>
            Upload Document
          </Button>
        </Box>
      </Box>

      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Protocol">Protocol</MenuItem>
                  <MenuItem value="Consent">Consent</MenuItem>
                  <MenuItem value="CV">CV</MenuItem>
                  <MenuItem value="Certification">Certification</MenuItem>
                  <MenuItem value="Monitoring Report">Monitoring Report</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                More Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredDocuments.length} of {mockDocuments.length} documents
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="document management tabs">
            <Tab label="All Documents" />
            <Tab label="eTMF Index" />
            <Tab label="AI Suggestions" />
            <Tab label="Audit Trail" />
          </Tabs>
        </Box>

        {/* All Documents Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredDocuments}
              columns={documentColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              disableSelectionOnClick
              checkboxSelection
            />
          </Box>
        </TabPanel>

        {/* eTMF Index Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              eTMF Completeness: 76% (19 of 25 required documents complete)
            </Alert>
          </Box>
          
          {mockETMFSections.map((section, index) => (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Folder color="primary" />
                  <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {section.section}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {section.complete}/{section.required}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={section.percentage}
                      sx={{ width: 100, height: 6 }}
                      color={section.percentage === 100 ? 'success' : section.percentage >= 50 ? 'warning' : 'error'}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {section.percentage}%
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {section.documents.map((doc, docIndex) => (
                    <ListItem key={docIndex}>
                      <ListItemIcon>
                        <Description fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={doc} />
                      <CheckCircle color="success" fontSize="small" />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>

        {/* AI Suggestions Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              AI has analyzed your documents and provided the following suggestions for improved organization and compliance.
            </Alert>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment />
                    Suggested Tags
                  </Typography>
                  <List>
                    {mockAITags.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={item.tag}
                          secondary={`Confidence: ${(item.confidence * 100).toFixed(0)}%`}
                        />
                        <Chip
                          label={item.suggested ? 'Apply' : 'Applied'}
                          size="small"
                          color={item.suggested ? 'primary' : 'success'}
                          clickable={item.suggested}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning />
                    Missing Documents
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Gavel color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="IRB Approval Letter"
                        secondary="Required for eTMF section 8.2.2"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocalHospital color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Site Delegation Log"
                        secondary="Required for eTMF section 8.3.5"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Science color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Investigational Product Manual"
                        secondary="Recommended for eTMF section 8.4.3"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Audit Trail Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Document</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2024-01-18 14:30</TableCell>
                  <TableCell>CRA Johnson</TableCell>
                  <TableCell>Upload</TableCell>
                  <TableCell>Monitoring Report - Visit 1</TableCell>
                  <TableCell>Initial upload</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-01-15 09:15</TableCell>
                  <TableCell>Dr. Sarah Johnson</TableCell>
                  <TableCell>Approve</TableCell>
                  <TableCell>Protocol v2.0</TableCell>
                  <TableCell>Final approval</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2024-01-12 16:45</TableCell>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>Upload</TableCell>
                  <TableCell>Informed Consent Form</TableCell>
                  <TableCell>Version 1.5 uploaded</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload New Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: 100, borderStyle: 'dashed' }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUpload sx={{ fontSize: 40, mb: 1 }} />
                  <Typography>Click to select file or drag and drop</Typography>
                </Box>
                <input
                  type="file"
                  hidden
                  onChange={(e) => setNewDocument({ ...newDocument, file: e.target.files?.[0] || null })}
                />
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Document Name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                >
                  <MenuItem value="Protocol">Protocol</MenuItem>
                  <MenuItem value="Consent">Informed Consent</MenuItem>
                  <MenuItem value="CV">Curriculum Vitae</MenuItem>
                  <MenuItem value="Certification">Certification</MenuItem>
                  <MenuItem value="Monitoring Report">Monitoring Report</MenuItem>
                  <MenuItem value="Correspondence">Correspondence</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newDocument.category}
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value })}
                >
                  <MenuItem value="Essential Documents">Essential Documents</MenuItem>
                  <MenuItem value="Regulatory">Regulatory</MenuItem>
                  <MenuItem value="Site Documents">Site Documents</MenuItem>
                  <MenuItem value="Vendor Documents">Vendor Documents</MenuItem>
                  <MenuItem value="Monitoring">Monitoring</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tags (comma separated)"
                value={newDocument.tags}
                onChange={(e) => setNewDocument({ ...newDocument, tags: e.target.value })}
                placeholder="protocol, amendment, v2.0"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                placeholder="Brief description of the document..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUploadDocument} variant="contained">
            Upload & Process
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
