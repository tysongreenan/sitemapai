import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Enhanced debounce with logging and error tracking
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: {
    maxWait?: number;
    leading?: boolean;
    onError?: (error: any) => void;
    onDebounce?: () => void;
    context?: string;
  } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCall = 0;
  let lastExecution = 0;
  
  return function(...args: Parameters<T>) {
    const now = Date.now();
    const isFirstCall = !lastCall;
    lastCall = now;

    // Execute immediately if leading is true and it's the first call
    if (options.leading && isFirstCall) {
      lastExecution = now;
      try {
        func.apply(this, args);
      } catch (error) {
        options.onError?.(error);
      }
      return;
    }

    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
      options.onDebounce?.();
    }

    // Force execution if maxWait is exceeded
    const timeSinceLastExecution = now - lastExecution;
    if (options.maxWait && timeSinceLastExecution >= options.maxWait) {
      lastExecution = now;
      try {
        func.apply(this, args);
      } catch (error) {
        options.onError?.(error);
      }
      return;
    }

    // Set new timeout
    timeout = setTimeout(() => {
      lastExecution = Date.now();
      timeout = null;
      try {
        func.apply(this, args);
      } catch (error) {
        options.onError?.(error);
      }
    }, wait);
  };
}

// Save operation logger
export const SaveLogger = {
  lastSave: 0,
  totalSaves: 0,
  failedSaves: 0,
  
  logSave(context: string) {
    const now = Date.now();
    const timeSinceLastSave = now - this.lastSave;
    this.lastSave = now;
    this.totalSaves++;
    
    console.debug('Save operation:', {
      context,
      timestamp: new Date(now).toISOString(),
      timeSinceLastSave: `${timeSinceLastSave}ms`,
      totalSaves: this.totalSaves,
      failedSaves: this.failedSaves
    });
  },
  
  logError(error: any, context: string) {
    this.failedSaves++;
    console.error('Save operation failed:', {
      context,
      error,
      timestamp: new Date().toISOString(),
      totalSaves: this.totalSaves,
      failedSaves: this.failedSaves
    });
  }
};