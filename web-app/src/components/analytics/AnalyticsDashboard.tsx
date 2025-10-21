/**
 * Analytics Dashboard Component
 * 
 * Real-time analytics dashboard showing enrollment trends, financial metrics,
 * and study performance indicators. Uses data from integrated connectors.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUpOutlined as TrendingUpIcon,
  PeopleOutlined as PeopleIcon,
  AttachMoneyOutlined as MoneyIcon,
  AssignmentOutlined as StudyIcon,
  WarningOutlined as WarningIcon,
  CheckCircleOutlined as CheckIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dataService, DashboardData } from '../../services/DataService';
import { Study, EnrollmentData } from '../../types/schemas';
import { Loading } from '../common/Loading';
import { useToast } from '../ui/Toast';

interface AnalyticsDashboardProps {
  studyId?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  loading?: boolean;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <Box sx={{ width: 100, mt: 1 }}>
              <LinearProgress />
            </Box>
          ) : (
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          )}
          {change !== undefined && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <TrendingUpIcon
                sx={{
                  fontSize: 16,
                  color: change >= 0 ? 'success.main' : 'error.main',
                  transform: change < 0 ? 'rotate(180deg)' : 'none',
                  mr: 0.5,
                }}
              />
              <Typography
                variant="caption"
                color={change >= 0 ? 'success.main' : 'error.main'}
              >
                {Math.abs(change)}% vs last period
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ studyId }) => {
  const { error } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<string>(studyId || 'all');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedStudy, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard metrics
      const dashboard = await dataService.getDashboardData(
        selectedStudy === 'all' ? undefined : selectedStudy
      );
      setDashboardData(dashboard);

      // Load enrollment trend data
      if (selectedStudy !== 'all') {
        const enrollment = await dataService.getEnrollmentData(selectedStudy, {
          limit: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365,
        });
        setEnrollmentData(enrollment);
      }

      // Load studies for dropdown
      const allStudies = await dataService.getAllStudies({ limit: 50 });
      setStudies(allStudies);
    } catch (err) {
      error('Failed to load dashboard data');
      console.error('Dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatEnrollmentData = (data: EnrollmentData[]) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cumulative: item.cumulativeEnrollment,
      target: item.targetEnrollment,
      new: item.newEnrollments,
      rate: item.enrollmentRate,
    }));
  };

  const formatPhaseData = (phaseData: Record<string, number>) => {
    return Object.entries(phaseData).map(([phase, count]) => ({
      name: phase,
      value: count,
    }));
  };

  const formatStatusData = (statusData: Record<string, number>) => {
    return Object.entries(statusData).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const calculateEnrollmentVelocity = () => {
    if (enrollmentData.length < 2) return 0;
    const recent = enrollmentData.slice(-7);
    const totalNew = recent.reduce((sum, item) => sum + item.newEnrollments, 0);
    return Math.round((totalNew / 7) * 10) / 10; // Daily average
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'primary';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading && !dashboardData) {
    return <Loading variant="page" text="Loading analytics dashboard..." />;
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Study</InputLabel>
            <Select
              value={selectedStudy}
              onChange={(e) => setSelectedStudy(e.target.value)}
              label="Study"
            >
              <MenuItem value="all">All Studies</MenuItem>
              {studies.map(study => (
                <MenuItem key={study.studyId} value={study.studyId}>
                  {study.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              label="Time Range"
            >
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Studies"
            value={dashboardData?.totalStudies || 0}
            icon={<StudyIcon />}
            color="primary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Studies"
            value={dashboardData?.activeStudies || 0}
            change={12}
            icon={<CheckIcon />}
            color="success"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Enrollment"
            value={dashboardData?.totalEnrollment || 0}
            change={8}
            icon={<PeopleIcon />}
            color="secondary"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Budget Utilized"
            value={`$${((dashboardData?.budgetUtilized || 0) / 1000000).toFixed(1)}M`}
            change={-3}
            icon={<MoneyIcon />}
            color="warning"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Health Score Alert */}
      {dashboardData && (
        <Alert
          severity={
            dashboardData.averageHealthScore >= 80 ? 'success' :
            dashboardData.averageHealthScore >= 60 ? 'warning' : 'error'
          }
          sx={{ mb: 3 }}
          icon={
            dashboardData.averageHealthScore >= 80 ? <CheckIcon /> : <WarningIcon />
          }
        >
          Average study health score: {Math.round(dashboardData.averageHealthScore)}%
          {dashboardData.averageHealthScore < 80 && ' - Some studies may need attention'}
        </Alert>
      )}

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* Enrollment Trend */}
        {selectedStudy !== 'all' && enrollmentData.length > 0 && (
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Enrollment Trend</Typography>
                  <Chip
                    label={`${calculateEnrollmentVelocity()} patients/day`}
                    color="primary"
                    size="small"
                  />
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={formatEnrollmentData(enrollmentData)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Cumulative Enrollment"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      name="Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Study Phase Distribution */}
        <Grid item xs={12} lg={selectedStudy !== 'all' ? 4 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Studies by Phase
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={formatPhaseData(dashboardData?.studiesByPhase || {})}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatPhaseData(dashboardData?.studiesByPhase || {}).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Study Status Distribution */}
        <Grid item xs={12} lg={selectedStudy !== 'all' ? 12 : 6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Studies by Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatStatusData(dashboardData?.studiesByStatus || {})}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {dashboardData?.recentActivity.length === 0 ? (
                <Typography color="text.secondary">No recent activity</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dashboardData?.recentActivity.slice(0, 5).map((activity) => (
                    <Box
                      key={activity.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                      }}
                    >
                      <Chip
                        label={activity.type}
                        size="small"
                        color={
                          activity.type === 'enrollment' ? 'primary' :
                          activity.type === 'payment' ? 'success' : 'default'
                        }
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {activity.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
