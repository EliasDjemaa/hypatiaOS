import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateStudyModal } from '../../components/studies/CreateStudyModal';
import { StudyHoverTooltip } from '../../components/studies/StudyHoverTooltip';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  LinearProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Badge,
  Tooltip,
  AvatarGroup,
  Popper,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import {
  SearchOutlined as SearchIcon,
  FilterAltOutlined as FilterIcon,
  FilterListOutlined as FilterListIcon,
  MoreVertOutlined as MoreIcon,
  AddOutlined as AddIcon,
  ClearOutlined as ClearIcon,
  SortOutlined as SortIcon,
} from '@mui/icons-material';

// Enhanced sample studies data with all required fields
const studiesData = [
  {
    id: 1,
    studyId: 'ONCOLOGY-2024-001',
    protocolId: 'PROT-ONC-001',
    title: 'Phase III Oncology Trial - Advanced Lung Cancer',
    sponsor: 'BioPharma Corp',
    businessUnit: 'Oncology Division',
    therapeuticArea: 'Oncology',
    phase: 'Phase III',
    status: 'Active',
    startDate: '2024-01-15',
    endDate: '2025-08-15',
    targetEnrollment: 500,
    currentEnrollment: 342,
    enrollmentProgress: 68.4,
    finalizedBudget: 2500000,
    completedPayments: 1250000,
    budgetUtilization: 62.8,
    healthScore: 85,
    healthIndicator: 'good',
    lastUpdated: '2024-10-18T14:30:00Z',
    teamMembers: ['JD', 'SM', 'RK', 'AL'],
    currency: 'USD'
  },
  {
    id: 2,
    studyId: 'CARDIO-2024-002',
    protocolId: 'PROT-CAR-002',
    title: 'Cardiovascular Device Study - Heart Valve Replacement',
    sponsor: 'MedDevice Inc',
    businessUnit: 'Medical Devices',
    therapeuticArea: 'Cardiology',
    phase: 'Pivotal',
    status: 'Startup',
    startDate: '2024-03-01',
    endDate: '2025-12-15',
    targetEnrollment: 200,
    currentEnrollment: 0,
    enrollmentProgress: 0,
    finalizedBudget: 1800000,
    completedPayments: 0,
    budgetUtilization: 0,
    healthScore: 45,
    healthIndicator: 'warning',
    lastUpdated: '2024-10-17T09:15:00Z',
    teamMembers: ['MB', 'TL'],
    currency: 'USD'
  },
  {
    id: 3,
    studyId: 'NEURO-2024-003',
    protocolId: 'PROT-NEU-003',
    title: 'Neurology Drug Trial - Alzheimer\'s Disease',
    sponsor: 'NeuroTech Ltd',
    businessUnit: 'CNS Therapeutics',
    therapeuticArea: 'Neurology',
    phase: 'Phase II',
    status: 'Active',
    startDate: '2024-02-01',
    endDate: '2025-08-30',
    targetEnrollment: 120,
    currentEnrollment: 45,
    enrollmentProgress: 37.5,
    finalizedBudget: 950000,
    completedPayments: 285000,
    budgetUtilization: 40.0,
    healthScore: 72,
    healthIndicator: 'good',
    lastUpdated: '2024-10-18T16:45:00Z',
    teamMembers: ['DR', 'KW', 'NP'],
    currency: 'USD'
  },
  {
    id: 4,
    studyId: 'DERM-2024-004',
    protocolId: 'PROT-DER-004',
    title: 'Dermatology Topical Treatment Study',
    sponsor: 'SkinCare Pharma',
    businessUnit: 'Dermatology',
    therapeuticArea: 'Dermatology',
    phase: 'Phase I',
    status: 'Completed',
    startDate: '2024-01-01',
    endDate: '2024-12-01',
    targetEnrollment: 30,
    currentEnrollment: 30,
    enrollmentProgress: 100,
    finalizedBudget: 450000,
    completedPayments: 450000,
    budgetUtilization: 100,
    healthScore: 95,
    healthIndicator: 'good',
    lastUpdated: '2024-10-15T11:20:00Z',
    teamMembers: ['LC', 'MH'],
    currency: 'USD'
  },
  {
    id: 5,
    studyId: 'RESP-2024-005',
    protocolId: 'PROT-RES-005',
    title: 'Respiratory Inhaler Device Study - COPD',
    sponsor: 'AirWay Technologies',
    businessUnit: 'Respiratory',
    therapeuticArea: 'Respiratory',
    phase: 'Phase III',
    status: 'Suspended',
    startDate: '2024-01-10',
    endDate: '2026-03-15',
    targetEnrollment: 400,
    currentEnrollment: 156,
    enrollmentProgress: 39.0,
    finalizedBudget: 2100000,
    completedPayments: 630000,
    budgetUtilization: 30.0,
    healthScore: 25,
    healthIndicator: 'critical',
    lastUpdated: '2024-10-10T08:30:00Z',
    teamMembers: ['PQ', 'RS', 'TU', 'VW', 'XY'],
    currency: 'USD'
  }
];

export const StudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [studies, setStudies] = useState(studiesData);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    phase: 'all',
    sponsor: 'all',
    businessUnit: 'all',
    therapeuticArea: 'all',
    status: 'all'
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('all');

  // Hover tooltip state
  const [hoveredStudy, setHoveredStudy] = useState<typeof studiesData[0] | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<null | HTMLElement>(null);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
      }
    };
  }, [hoverTimeoutId]);

  const handleStudyCreated = (newStudy: any) => {
    setStudies(prev => [...prev, newStudy]);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      phase: 'all',
      sponsor: 'all', 
      businessUnit: 'all',
      therapeuticArea: 'all',
      status: 'all'
    });
    setSearchTerm('');
  };

  const getUniqueValues = (field: string) => {
    return [...new Set(studies.map(study => study[field as keyof typeof study]))];
  };

  const filteredStudies = studies.filter(study => {
    const matchesSearch = 
      study.studyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.protocolId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.sponsor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (filters.phase === 'all' || study.phase === filters.phase) &&
      (filters.sponsor === 'all' || study.sponsor === filters.sponsor) &&
      (filters.businessUnit === 'all' || study.businessUnit === filters.businessUnit) &&
      (filters.therapeuticArea === 'all' || study.therapeuticArea === filters.therapeuticArea) &&
      (filters.status === 'all' || study.status === filters.status);
    
    return matchesSearch && matchesFilters;
  });

  const getHealthColor = (indicator: string) => {
    switch (indicator) {
      case 'good': return '#22C55E';
      case 'warning': return '#F59E0B';
      case 'critical': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#22C55E';
      case 'Startup': return '#3B82F6';
      case 'Completed': return '#8B5CF6';
      case 'Suspended': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase I': return '#8B5CF6';
      case 'Phase II': return '#06B6D4';
      case 'Phase III': return '#10B981';
      case 'Pivotal': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const tabs = [
    { id: 'all', label: 'All Studies', count: studies.length },
    { id: 'active', label: 'Active', count: studies.filter(s => s.status === 'Active').length },
    { id: 'startup', label: 'Startup', count: studies.filter(s => s.status === 'Startup').length },
    { id: 'completed', label: 'Completed', count: studies.filter(s => s.status === 'Completed').length },
  ];

  // Hover tooltip handlers
  const handleStudyHover = (event: React.MouseEvent<HTMLElement>, study: typeof studiesData[0]) => {
    // Clear any existing timeout
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    
    setHoveredStudy(study);
    setTooltipAnchor(event.currentTarget);
    setTooltipOpen(true);
  };

  const handleStudyLeave = () => {
    // Set a timeout to close the tooltip, but allow it to be cancelled
    const timeoutId = setTimeout(() => {
      setTooltipOpen(false);
      setHoveredStudy(null);
      setTooltipAnchor(null);
      setHoverTimeoutId(null);
    }, 300); // Give user time to move to tooltip
    
    setHoverTimeoutId(timeoutId);
  };

  const handleTooltipEnter = () => {
    // Cancel the close timeout when entering tooltip
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
  };

  const handleTooltipLeave = () => {
    // Immediately close when leaving tooltip
    setTooltipOpen(false);
    setHoveredStudy(null);
    setTooltipAnchor(null);
  };

  const handleTooltipViewDetails = () => {
    if (hoveredStudy) {
      navigate(`/studies/${hoveredStudy.studyId}`);
      setTooltipOpen(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAFBFC',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header Section */}
      <Box sx={{ px: 6, pt: 6, pb: 0 }}>
        {/* Title */}
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 600, 
            color: '#1F2937', 
            mb: 4,
            fontSize: '2.25rem'
          }}
        >
          Studies
        </Typography>

        {/* Tabs */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 6 }}>
            {tabs.map((tab) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  cursor: 'pointer',
                  pb: 2,
                  position: 'relative',
                  opacity: activeTab === tab.id ? 1 : 0.6,
                  '&:hover': {
                    opacity: 1,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      color: '#374151',
                      fontSize: '16px',
                    }}
                  >
                    {tab.label}
                  </Typography>
                  <Chip 
                    label={tab.count} 
                    size="small" 
                    sx={{ 
                      height: 20,
                      backgroundColor: '#F3F4F6',
                      color: '#6B7280',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }} 
                  />
                </Box>
                {activeTab === tab.id && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: '#3B82F6',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
          {/* Horizontal separator line */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: '#E5E7EB',
            }}
          />
        </Box>

      </Box>

      {/* Controls Row */}
      <Box sx={{ 
        px: 6, 
        py: 3, 
        backgroundColor: 'white', 
        borderBottom: '1px solid #F3F4F6',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        {/* Left side - Search and Filters */}
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <TextField
            placeholder="Search studies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                border: 'none',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: '1px solid #E5E7EB',
                },
                '& input': {
                  py: 1.5,
                },
              },
            }}
          />

          {/* Filter Button */}
          <Button
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
            startIcon={<FilterListIcon sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: '#F9FAFB',
              border: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1.5,
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '14px',
              '&:hover': {
                backgroundColor: '#F3F4F6',
              }
            }}
          >
            Filters
            {getActiveFiltersCount() > 0 && (
              <Chip 
                label={getActiveFiltersCount()} 
                size="small" 
                sx={{ 
                  ml: 1,
                  height: 18,
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  fontSize: '0.75rem'
                }} 
              />
            )}
          </Button>
        </Box>

        {/* Right side - Add Study Button */}
        <Button
          onClick={() => setCreateDialogOpen(true)}
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            backgroundColor: '#8B5CF6',
            color: 'white',
            borderRadius: '8px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#7C3AED',
              boxShadow: 'none',
            },
          }}
        >
          Add study
        </Button>
      </Box>

      {/* Studies List */}
      <Box sx={{ px: 6, pb: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredStudies.map((study) => (
            <Box
              key={study.id}
              onClick={() => navigate(`/studies/${study.studyId}`)}
              onMouseEnter={(e) => handleStudyHover(e, study)}
              onMouseLeave={handleStudyLeave}
              sx={{
                backgroundColor: 'white',
                borderRadius: '12px',
                p: 4,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: '1px solid #F3F4F6',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  borderColor: '#E5E7EB',
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left Section */}
                <Box sx={{ flex: 1, pr: 4 }}>
                  {/* Study Name & ID */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#1F2937',
                        fontSize: '1.125rem'
                      }}
                    >
                      {study.studyId}
                    </Typography>
                    <Chip
                      label={study.phase}
                      size="small"
                      sx={{
                        backgroundColor: getPhaseColor(study.phase),
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  
                  {/* Study Title */}
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#4B5563', 
                      mb: 2,
                      fontWeight: 500
                    }}
                  >
                    {study.title}
                  </Typography>

                  {/* Meta Information */}
                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      <strong>Sponsor:</strong> {study.sponsor}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      <strong>Protocol:</strong> {study.protocolId}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      <strong>Therapeutic Area:</strong> {study.therapeuticArea}
                    </Typography>
                  </Box>
                </Box>

                {/* Center Section - Metrics */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 6, 
                  alignItems: 'center',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace'
                }}>
                  {/* Timeline */}
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                      Timeline
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                      {formatDate(study.startDate)} - {formatDate(study.endDate)}
                    </Typography>
                  </Box>

                  {/* Budget */}
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                      Budget
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                      {formatCurrency(study.finalizedBudget)}
                    </Typography>
                  </Box>

                  {/* Enrollment */}
                  <Box sx={{ textAlign: 'center', minWidth: 120 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                      Enrollment
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 600 }}>
                      {study.currentEnrollment}/{study.targetEnrollment}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={study.enrollmentProgress}
                      sx={{
                        mt: 0.5,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: '#F3F4F6',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getHealthColor(study.healthIndicator),
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Box>
                </Box>

                {/* Right Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {/* Status & Health */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip
                      label={study.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(study.status),
                        color: 'white',
                        fontWeight: 500,
                        mb: 1
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: getHealthColor(study.healthIndicator)
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>
                        Health: {study.healthScore}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Team Members */}
                  <Box sx={{ textAlign: 'center' }}>
                    <AvatarGroup 
                      max={4} 
                      sx={{ 
                        justifyContent: 'center',
                        '& .MuiAvatar-root': { 
                          width: 32, 
                          height: 32, 
                          fontSize: '0.75rem',
                          border: '2px solid white'
                        }
                      }}
                    >
                      {study.teamMembers.map((member, index) => (
                        <Avatar key={index} sx={{ backgroundColor: '#6366F1' }}>
                          {member}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                    <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', mt: 0.5 }}>
                      Updated {getRelativeTime(study.lastUpdated)}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle actions menu
                    }}
                    sx={{ color: '#6B7280' }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Empty State */}
        {filteredStudies.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #F3F4F6'
          }}>
            <Typography variant="h6" sx={{ color: '#6B7280', mb: 1 }}>
              No studies found
            </Typography>
            <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
              Try adjusting your search or filters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            border: '1px solid #F3F4F6',
            minWidth: 300,
            p: 2
          }
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, px: 1 }}>Filters</Typography>
        
        {/* Phase Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Phase</InputLabel>
          <Select
            value={filters.phase}
            onChange={(e) => handleFilterChange('phase', e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Phases</MenuItem>
            {getUniqueValues('phase').map((phase) => (
              <MenuItem key={phase} value={phase}>{phase}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            {getUniqueValues('status').map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sponsor Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Sponsor</InputLabel>
          <Select
            value={filters.sponsor}
            onChange={(e) => handleFilterChange('sponsor', e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Sponsors</MenuItem>
            {getUniqueValues('sponsor').map((sponsor) => (
              <MenuItem key={sponsor} value={sponsor}>{sponsor}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Therapeutic Area Filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Therapeutic Area</InputLabel>
          <Select
            value={filters.therapeuticArea}
            onChange={(e) => handleFilterChange('therapeuticArea', e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Areas</MenuItem>
            {getUniqueValues('therapeuticArea').map((area) => (
              <MenuItem key={area} value={area}>{area}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Business Unit Filter */}
        <FormControl fullWidth>
          <InputLabel>Business Unit</InputLabel>
          <Select
            value={filters.businessUnit}
            onChange={(e) => handleFilterChange('businessUnit', e.target.value)}
            size="small"
          >
            <MenuItem value="all">All Units</MenuItem>
            {getUniqueValues('businessUnit').map((unit) => (
              <MenuItem key={unit} value={unit}>{unit}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Menu>

      {/* Hover Tooltip */}
      <Popper
        open={tooltipOpen}
        anchorEl={tooltipAnchor}
        placement="bottom"
        transition
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              padding: 16,
            },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'right', 'left'],
            },
          },
        ]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Box
              onMouseEnter={handleTooltipEnter}
              onMouseLeave={handleTooltipLeave}
            >
              {hoveredStudy && (
                <StudyHoverTooltip
                  study={hoveredStudy}
                  onViewDetails={handleTooltipViewDetails}
                />
              )}
            </Box>
          </Fade>
        )}
      </Popper>

      {/* Create Study Modal */}
      <CreateStudyModal
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onStudyCreated={handleStudyCreated}
      />
    </Box>
  );
};
