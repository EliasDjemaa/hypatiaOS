import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Import theme and components
import theme from './theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import LazyRoute from './components/common/LazyRoute';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider, useAuth } from './store/AuthProvider';
import AppLayout from './components/layout/AppLayout';

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const StudiesPage = React.lazy(() => import('./pages/studies/StudiesPage').then(m => ({ default: m.StudiesPage })));
const StudyDetailView = React.lazy(() => import('./pages/studies/StudyDetailView').then(m => ({ default: m.StudyDetailView })));

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <ToastProvider>
              <AuthProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<LazyRoute><LoginPage /></LazyRoute>} />
                    <Route path="/register" element={<LazyRoute><RegisterPage /></LazyRoute>} />
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<LazyRoute><DashboardPage /></LazyRoute>} />
                      <Route path="studies" element={<LazyRoute><StudiesPage /></LazyRoute>} />
                      <Route path="studies/:studyId" element={<LazyRoute><StudyDetailView /></LazyRoute>} />
                      <Route path="analytics" element={<div>Analytics Page - Coming Soon</div>} />
                      <Route path="reports" element={<div>Reports Page - Coming Soon</div>} />
                      <Route path="budgets" element={<div>Budgets Page - Coming Soon</div>} />
                      <Route path="contracts" element={<div>Contracts Page - Coming Soon</div>} />
                      <Route path="payments" element={<div>Payments Page - Coming Soon</div>} />
                      <Route path="forecasting" element={<div>Forecasting Page - Coming Soon</div>} />
                      <Route path="sites" element={<div>Sites Page - Coming Soon</div>} />
                      <Route path="investigators" element={<div>Investigators Page - Coming Soon</div>} />
                      <Route path="regulatory" element={<div>Regulatory Page - Coming Soon</div>} />
                      <Route path="data-management" element={<div>Data Management Page - Coming Soon</div>} />
                    </Route>
                  </Routes>
                </Router>
              </AuthProvider>
            </ToastProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
