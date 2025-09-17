import React, { ReactNode } from 'react';
import { loggingService } from '../services/loggingService';

interface ErrorBoundaryProps {
  children: ReactNode;
}

// Simple error boundary component that works with the current TypeScript config
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  // For now, we'll just return the children and handle errors at the app level
  // This can be enhanced later in Phase 2 with proper error boundary logic
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

export default ErrorBoundary;
