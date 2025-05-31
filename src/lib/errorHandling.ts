// src/lib/errorHandling.ts
import { toast, ToastOptions, Id } from 'react-toastify';

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

// Keep track of active toasts to prevent duplicates
const activeToasts = new Set<string>();

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
    const toastKey = `${appError.type}-${appError.message}`;
    
    // Don't show duplicate toasts
    if (activeToasts.has(toastKey)) {
      return;
    }

    const toastOptions: ToastOptions = {
      position: 'bottom-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      onClose: () => activeToasts.delete(toastKey),
    };

    let toastId: Id;

    switch (appError.type) {
      case ErrorType.AUTH:
        toastId = toast.error(appError.message, toastOptions);
        break;
      case ErrorType.VALIDATION:
        toastId = toast.warn(appError.message, { ...toastOptions, autoClose: 3000 });
        break;
      case ErrorType.NETWORK:
        toastId = toast.error(appError.message, { ...toastOptions, autoClose: 8000 });
        break;
      case ErrorType.DATABASE:
        toastId = toast.error(appError.message, toastOptions);
        break;
      default:
        toastId = toast.error(appError.message, toastOptions);
    }

    activeToasts.add(toastKey);
  }

  static clearToasts(): void {
    toast.dismiss();
    activeToasts.clear();
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