import React, { Suspense } from 'react';
import { Loading } from './Loading';
import ErrorBoundary from './ErrorBoundary';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback = <Loading variant="page" text="Loading page..." /> 
}) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;
