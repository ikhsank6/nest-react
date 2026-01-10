import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'sonner'
import { AxiosError } from 'axios'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// ========================================
// Global Toast Helpers
// ========================================

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  meta?: {
    message?: string;
    error?: string;
  };
}

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  // Handle AxiosError
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    
    // Check meta object first (common pattern in this app)
    if (data?.meta?.message) {
      return data.meta.error 
        ? `${data.meta.message} (${data.meta.error})`
        : data.meta.message;
    }
    
    // Check direct message
    if (data?.message) {
      return data.error 
        ? `${data.message} (${data.error})`
        : data.message;
    }
    
    // Network error
    if (error.message === 'Network Error') {
      return 'Tidak dapat terhubung ke server';
    }
    
    // Fallback to axios message
    return error.message || 'Terjadi kesalahan pada server';
  }
  
  // Handle Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return 'Terjadi kesalahan';
}

/**
 * Show success toast notification
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, { description });
}

/**
 * Show error toast notification from unknown error
 */
export function showError(error: unknown, fallbackMessage?: string) {
  const message = getErrorMessage(error) || fallbackMessage || 'Terjadi kesalahan';
  toast.error(message);
}

/**
 * Show error toast with custom message
 */
export function showErrorMessage(message: string, description?: string) {
  toast.error(message, { description });
}

/**
 * Show warning toast notification
 */
export function showWarning(message: string, description?: string) {
  toast.warning(message, { description });
}

/**
 * Show info toast notification
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, { description });
}
