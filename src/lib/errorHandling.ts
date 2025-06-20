import { toast } from 'react-toastify';

export interface ErrorContext {
  operation?: string;
  userId?: string;
  projectId?: string;
  title?: string;
  description?: string;
  context?: string;
  originalError?: any;
}

export class AppErrorHandler {
  private static loggedErrors = new Set<string>();
  private static lastNetworkError = 0;
  private static networkErrorCooldown = 5000; // 5 seconds

  static handle(error: any, context: ErrorContext = {}) {
    const errorKey = this.getErrorKey(error, context);
    
    // For network errors, implement cooldown to prevent spam
    if (this.isNetworkError(error)) {
      const now = Date.now();
      if (now - this.lastNetworkError < this.networkErrorCooldown) {
        console.warn('Network error suppressed due to cooldown:', error.message);
        return;
      }
      this.lastNetworkError = now;
    }

    // Prevent duplicate error logging
    if (this.loggedErrors.has(errorKey)) {
      return;
    }

    this.loggedErrors.add(errorKey);
    
    // Clear the error key after some time to allow re-logging if it persists
    setTimeout(() => {
      this.loggedErrors.delete(errorKey);
    }, 30000); // 30 seconds

    this.logError(error, context);
    this.showUserFeedback(error, context);
  }

  private static getErrorKey(error: any, context: ErrorContext): string {
    const operation = context.operation || 'unknown';
    const errorType = this.isNetworkError(error) ? 'network' : error.name || 'unknown';
    return `${operation}-${errorType}`;
  }

  private static isNetworkError(error: any): boolean {
    return (
      error instanceof TypeError && 
      (error.message.includes('Failed to fetch') || 
       error.message.includes('Network request failed') ||
       error.message.includes('fetch'))
    );
  }

  private static logError(error: any, context: ErrorContext) {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      message: error.message || 'Unknown error',
      name: error.name || 'Error',
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Only log to console for network errors, don't spam
    if (this.isNetworkError(error)) {
      console.warn('Network connectivity issue detected:', {
        operation: context.operation,
        message: error.message,
        timestamp
      });
    } else {
      console.error('AppError:', errorInfo);
    }

    // In a production app, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or Bugsnag
  }

  private static showUserFeedback(error: any, context: ErrorContext) {
    // Don't show toast for network errors - the UI already handles this
    if (this.isNetworkError(error)) {
      return;
    }

    let message = 'An unexpected error occurred';
    
    if (error.message) {
      // Sanitize error message for user display
      if (error.message.includes('duplicate key value')) {
        message = 'This item already exists';
      } else if (error.message.includes('permission denied')) {
        message = 'You don\'t have permission to perform this action';
      } else if (error.message.includes('not found')) {
        message = 'The requested item was not found';
      } else if (context.operation === 'createProject') {
        message = 'Failed to create project. Please try again.';
      } else if (context.operation === 'updateProject') {
        message = 'Failed to save changes. Please try again.';
      } else if (context.operation === 'deleteProject') {
        message = 'Failed to delete project. Please try again.';
      } else if (context.operation === 'loadProjects') {
        message = 'Failed to load projects. Please refresh the page.';
      }
    }

    toast.error(message, {
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  }
}

// Enhanced async error handler with better network error handling
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  context: ErrorContext = {}
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    // For network errors, don't call the onError callback immediately
    // Let the connection status handling in ProjectContext deal with it
    if (AppErrorHandler['isNetworkError'](error)) {
      console.warn(`Network error in ${context.operation}, connection status will be updated`);
      // Still call onError but with a flag to indicate it's a network error
      if (context.onError) {
        context.onError(error);
      }
    } else {
      AppErrorHandler.handle(error, context);
      if (context.onError) {
        context.onError(error);
      }
    }
    return null;
  }
}

// Validation error types
export type ValidationError = {
  type: 'validation';
  message: string;
  field?: string;
};

export type AuthError = {
  type: 'auth';
  message: string;
};

export type NetworkError = {
  type: 'network';
  message: string;
  originalError?: Error;
};