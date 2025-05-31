// src/lib/errorHandling.ts
import { toast } from 'react-toastify';

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION', 
  AUTH = 'AUTH',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
}

export class AppErrorHandler {
  static handle(error: any, context?: Record<string, any>): AppError {
    const appError = this.categorizeError(error, context);
    this.logError(appError);
    this.showUserError(appError);
    return appError;
  }

  private static categorizeError(error: any, context?: Record<string, any>): AppError {
    // Supabase auth errors
    if (error?.message?.includes('Invalid login credentials')) {
      return {
        type: ErrorType.AUTH,
        message: 'Invalid email or password. Please try again.',
        originalError: error,
        context
      };
    }

    if (error?.message?.includes('Email not confirmed')) {
      return {
        type: ErrorType.AUTH,
        message: 'Please check your email and click the confirmation link.',
        originalError: error,
        context
      };
    }

    // Network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Connection failed. Please check your internet connection.',
        originalError: error,
        context
      };
    }

    // Database errors
    if (error?.code === 'PGRST301' || error?.message?.includes('permission denied')) {
      return {
        type: ErrorType.DATABASE,
        message: 'You do not have permission to perform this action.',
        originalError: error,
        context
      };
    }

    // Validation errors
    if (error?.type === 'validation') {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || 'Please check your input and try again.',
        originalError: error,
        context
      };
    }

    // Generic fallback
    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'An unexpected error occurred. Please try again.',
      originalError: error,
      context
    };
  }

  private static logError(appError: AppError): void {
    console.error('AppError:', {
      type: appError.type,
      message: appError.message,
      context: appError.context,
      originalError: appError.originalError,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // In production, send to error tracking service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(appError.originalError, {
      //   extra: appError.context,
      //   tags: { errorType: appError.type }
      // });
    }
  }

  private static showUserError(appError: AppError): void {
    const toastOptions = {
      position: 'bottom-right' as const,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };

    switch (appError.type) {
      case ErrorType.AUTH:
        toast.error(appError.message, toastOptions);
        break;
      case ErrorType.VALIDATION:
        toast.warn(appError.message, toastOptions);
        break;
      case ErrorType.NETWORK:
        toast.error(appError.message, { ...toastOptions, autoClose: 8000 });
        break;
      case ErrorType.DATABASE:
        toast.error(appError.message, toastOptions);
        break;
      default:
        toast.error(appError.message, toastOptions);
    }
  }
}

// React Error Boundary Component
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const appError = AppErrorHandler.handle(error, { boundary: 'React' });
    return {
      hasError: true,
      error: appError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    AppErrorHandler.handle(error, { 
      boundary: 'React',
      componentStack: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="ml-3 text-lg font-semibold text-gray-900">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred. Please refresh the page and try again.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async error handler for promises
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    AppErrorHandler.handle(error, context);
    return null;
  }
};