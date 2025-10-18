import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Layout Components
import { AuthLayout } from '@components/layout/AuthLayout';
import { DashboardLayout } from '@components/layout/DashboardLayout';

// Auth Components
import { LoginPage } from '@pages/auth/LoginPage';
import { RegisterPage } from '@pages/auth/RegisterPage';

// Dashboard Components
import { SponsorDashboard } from '@pages/dashboards/SponsorDashboard';
import { CRADashboard } from '@pages/dashboards/CRADashboard';
import { SiteCoordinatorDashboard } from '@pages/dashboards/SiteCoordinatorDashboard';
import { InvestigatorDashboard } from '@pages/dashboards/InvestigatorDashboard';
import { DataManagerDashboard } from '@pages/dashboards/DataManagerDashboard';
import { PatientDashboard } from '@pages/dashboards/PatientDashboard';
import { FinanceDashboard } from '@pages/dashboards/FinanceDashboard';
import { SponsorFinanceDashboard } from '@pages/dashboards/SponsorFinanceDashboard';
import { CROFinanceDashboard } from '@pages/dashboards/CROFinanceDashboard';
import { SiteFinanceDashboard } from '@pages/dashboards/SiteFinanceDashboard';

// Workflow Components
import { StudyManagement } from '@pages/workflows/StudyManagement';
import { ParticipantEnrollment } from '@pages/workflows/ParticipantEnrollment';
import { DataCapture } from '@pages/workflows/DataCapture';
import { DocumentManagement } from '@pages/workflows/DocumentManagement';
import { Monitoring } from '@pages/workflows/Monitoring';
import { DataCleaning } from '@pages/workflows/DataCleaning';
import { Reporting } from '@pages/workflows/Reporting';

// Providers
import { AuthProvider } from '@store/AuthProvider';
import { useAuth } from '@hooks/useAuth';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Role-based Dashboard Router
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role) {
      // System Level Roles
      case 'system_admin':
      case 'compliance_officer':
      case 'auditor':
        return <SponsorDashboard />;
      
      // Sponsor Ecosystem Roles
      case 'sponsor_admin':
      case 'sponsor_clinical_lead':
      case 'sponsor_regulatory':
        return <SponsorDashboard />;
      case 'sponsor_finance_manager':
      case 'sponsor_contract_manager':
        return <SponsorFinanceDashboard />;
      
      // CRO Ecosystem Roles
      case 'cro_pm':
        return <SponsorDashboard />;
      case 'cra':
        return <CRADashboard />;
      case 'data_manager':
        return <DataManagerDashboard />;
      case 'cro_regulatory':
      case 'cro_etmf_manager':
        return <SponsorDashboard />;
      case 'cro_finance_analyst':
      case 'cro_contract_manager':
      case 'cro_legal_officer':
        return <CROFinanceDashboard />;
      
      // Site Ecosystem Roles
      case 'principal_investigator':
        return <InvestigatorDashboard />;
      case 'site_coordinator':
        return <SiteCoordinatorDashboard />;
      case 'site_pharmacist':
        return <SiteCoordinatorDashboard />;
      case 'site_finance_coordinator':
        return <SiteFinanceDashboard />;
      
      // Legacy Roles
      case 'sponsor_pm':
        return <SponsorDashboard />;
      case 'investigator':
        return <InvestigatorDashboard />;
      case 'biostat':
        return <DataManagerDashboard />;
      case 'patient':
        return <PatientDashboard />;
      
      default:
        return <SponsorDashboard />;
    }
  };

  return getDashboardComponent();
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<DashboardRouter />} />
                  
                  {/* Study Management */}
                  <Route path="studies" element={
                    <ProtectedRoute allowedRoles={['sponsor_pm', 'cra', 'data_manager', 'admin']}>
                      <StudyManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Participant Enrollment */}
                  <Route path="participants" element={
                    <ProtectedRoute allowedRoles={['site_coordinator', 'investigator', 'cra']}>
                      <ParticipantEnrollment />
                    </ProtectedRoute>
                  } />
                  
                  {/* Data Capture (EDC) */}
                  <Route path="data-capture" element={
                    <ProtectedRoute allowedRoles={['site_coordinator', 'investigator', 'cra']}>
                      <DataCapture />
                    </ProtectedRoute>
                  } />
                  
                  {/* Document Management (eTMF) */}
                  <Route path="documents" element={
                    <ProtectedRoute allowedRoles={['cra', 'site_coordinator', 'regulatory', 'admin']}>
                      <DocumentManagement />
                    </ProtectedRoute>
                  } />
                  
                  {/* Monitoring */}
                  <Route path="monitoring" element={
                    <ProtectedRoute allowedRoles={['cra', 'sponsor_pm', 'admin']}>
                      <Monitoring />
                    </ProtectedRoute>
                  } />
                  
                  {/* Data Cleaning */}
                  <Route path="data-cleaning" element={
                    <ProtectedRoute allowedRoles={['data_manager', 'biostat', 'admin']}>
                      <DataCleaning />
                    </ProtectedRoute>
                  } />
                  
                  {/* Reporting */}
                  <Route path="reports" element={
                    <ProtectedRoute allowedRoles={['sponsor_pm', 'data_manager', 'biostat', 'regulatory', 'admin']}>
                      <Reporting />
                    </ProtectedRoute>
                  } />
                  
                  {/* Financial Operations */}
                  <Route path="finance" element={
                    <ProtectedRoute allowedRoles={[
                      'sponsor_finance_manager', 'sponsor_contract_manager',
                      'cro_finance_analyst', 'cro_contract_manager', 'cro_legal_officer',
                      'site_finance_coordinator', 'system_admin', 'admin'
                    ]}>
                      <FinanceDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Sponsor Financial Operations */}
                  <Route path="finance/sponsor" element={
                    <ProtectedRoute allowedRoles={[
                      'sponsor_finance_manager', 'sponsor_contract_manager', 'system_admin', 'admin'
                    ]}>
                      <SponsorFinanceDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* CRO Financial Operations */}
                  <Route path="finance/cro" element={
                    <ProtectedRoute allowedRoles={[
                      'cro_finance_analyst', 'cro_contract_manager', 'cro_legal_officer', 'system_admin', 'admin'
                    ]}>
                      <CROFinanceDashboard />
                    </ProtectedRoute>
                  } />
                  
                  {/* Site Financial Operations */}
                  <Route path="finance/site" element={
                    <ProtectedRoute allowedRoles={[
                      'site_finance_coordinator', 'principal_investigator', 'site_coordinator', 'system_admin', 'admin'
                    ]}>
                      <SiteFinanceDashboard />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* 404 */}
                <Route path="*" element={<div>Page Not Found</div>} />
              </Routes>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
