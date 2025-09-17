import React, { Component, ErrorInfo, ReactNode } from 'react';
import { loggingService } from '@/services/loggingService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    loggingService.logError(error, { componentStack: errorInfo.componentStack });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
              <p className="text-gray-600 mt-2">We're sorry for the inconvenience. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700"
              >
                Refresh
              </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
