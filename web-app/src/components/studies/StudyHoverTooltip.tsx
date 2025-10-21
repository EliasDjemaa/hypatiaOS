import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import {
  ArrowForwardOutlined as ArrowIcon,
  TrendingUpOutlined as TrendingUpIcon,
  AccessTimeOutlined as TimeIcon,
  GroupOutlined as GroupIcon,
  AttachMoneyOutlined as MoneyIcon,
} from '@mui/icons-material';

interface StudyData {
  id: number;
  studyId: string;
  protocolId: string;
  title: string;
  sponsor: string;
  businessUnit: string;
  therapeuticArea: string;
  phase: string;
  status: string;
  startDate: string;
  endDate: string;
  targetEnrollment: number;
  currentEnrollment: number;
  enrollmentProgress: number;
  finalizedBudget: number;
  completedPayments: number;
  budgetUtilization: number;
  healthScore: number;
  healthIndicator: string;
  lastUpdated: string;
  teamMembers: string[];
  currency: string;
}

interface StudyHoverTooltipProps {
  study: StudyData;
  onViewDetails: () => void;
}

export const StudyHoverTooltip: React.FC<StudyHoverTooltipProps> = ({
  study,
  onViewDetails,
}) => {
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

  const getDaysRemaining = () => {
    const endDate = new Date(study.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEnrollmentRate = () => {
    const startDate = new Date(study.startDate);
    const today = new Date();
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysElapsed > 0 ? (study.currentEnrollment / daysElapsed).toFixed(1) : '0.0';
  };

  const getBurnRate = () => {
    const monthlyBurn = study.completedPayments / 12; // Simplified calculation
    return monthlyBurn;
  };

  return (
    <Box
      sx={{
        width: 380,
        backgroundColor: '#1F2937',
        borderRadius: '16px',
        p: 3,
        color: 'white',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid #374151',
        position: 'relative',
        zIndex: 1000,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #374151',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #1F2937',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon sx={{ color: '#10B981', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Study Insights & Metrics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981' }} />
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#374151' }} />
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#374151' }} />
        </Box>
      </Box>

      {/* Study Overview */}
      <Typography variant="body2" sx={{ color: '#9CA3AF', mb: 2, lineHeight: 1.4 }}>
        Protocol: {study.protocolId} • Business Unit: {study.businessUnit}
      </Typography>

      <Divider sx={{ borderColor: '#374151', mb: 3 }} />

      {/* Key Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        {/* Enrollment Metrics */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GroupIcon sx={{ color: '#6366F1', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
              Enrollment Rate
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>
            {getEnrollmentRate()}
            <Typography component="span" variant="caption" sx={{ color: '#9CA3AF', ml: 0.5 }}>
              /day
            </Typography>
          </Typography>
        </Box>

        {/* Budget Burn Rate */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <MoneyIcon sx={{ color: '#F59E0B', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
              Monthly Burn
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>
            {formatCurrency(getBurnRate())}
          </Typography>
        </Box>

        {/* Days Remaining */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TimeIcon sx={{ color: '#8B5CF6', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
              Days Remaining
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>
            {getDaysRemaining()}
          </Typography>
        </Box>

        {/* Health Score */}
        <Box>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, display: 'block', mb: 1 }}>
            Health Score
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>
            {study.healthScore}
            <Typography component="span" variant="caption" sx={{ color: '#9CA3AF', ml: 0.5 }}>
              /100
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* Progress Indicators */}
      <Box sx={{ mb: 3 }}>
        {/* Budget Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#D1D5DB', fontWeight: 500 }}>
              Budget Utilization
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {study.budgetUtilization.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={study.budgetUtilization}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#374151',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#F59E0B',
                borderRadius: 3,
              }
            }}
          />
        </Box>

        {/* Enrollment Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#D1D5DB', fontWeight: 500 }}>
              Patient Enrollment
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {study.currentEnrollment}/{study.targetEnrollment}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={study.enrollmentProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#374151',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#10B981',
                borderRadius: 3,
              }
            }}
          />
        </Box>

        {/* Timeline Progress */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: '#D1D5DB', fontWeight: 500 }}>
              Study Timeline
            </Typography>
            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
              {formatDate(study.startDate)} - {formatDate(study.endDate)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: i < 6 ? '#6366F1' : '#374151',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Action Button */}
      <Button
        fullWidth
        onClick={onViewDetails}
        endIcon={<ArrowIcon />}
        sx={{
          backgroundColor: '#065F46',
          color: '#10B981',
          borderRadius: '12px',
          py: 1.5,
          textTransform: 'none',
          fontWeight: 600,
          border: '1px solid #047857',
          '&:hover': {
            backgroundColor: '#047857',
            color: 'white',
          }
        }}
      >
        View Details
      </Button>
    </Box>
  );
};
