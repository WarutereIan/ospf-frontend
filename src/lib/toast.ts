/**
 * Toast Notification Utility
 * 
 * Centralized toast notification functions for consistent user feedback.
 * Uses shadcn/ui toast component for toast notifications.
 */

import { toast } from "@/hooks/use-toast";

/**
 * Show a success toast notification
 */
export function showSuccess(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: "default",
  });
}

/**
 * Show an error toast notification
 * Error toasts are larger and use a red theme for better visibility
 */
export function showError(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: "destructive",
  });
}

/**
 * Show an info toast notification
 */
export function showInfo(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: "default",
  });
}

/**
 * Show a warning toast notification
 */
export function showWarning(message: string, description?: string) {
  toast({
    title: message,
    description,
    variant: "default",
  });
}

/**
 * Show a loading toast notification
 * Returns a function to update or dismiss the toast
 */
export function showLoading(message: string) {
  const toastId = toast({
    title: message,
    variant: "default",
  });
  return {
    dismiss: () => toastId.dismiss(),
    update: (newMessage: string) => toastId.update({ id: toastId.id, title: newMessage }),
  };
}

/**
 * Show a promise toast (loading -> success/error)
 */
export function showPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) {
  const loadingToast = toast({
    title: messages.loading,
    variant: "default",
  });

  promise
    .then((data) => {
      const successMessage = typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;
      loadingToast.update({
        id: loadingToast.id,
        title: successMessage,
        variant: "default",
      });
      setTimeout(() => loadingToast.dismiss(), 3000);
    })
    .catch((error) => {
      const errorMessage = typeof messages.error === "function"
        ? messages.error(error)
        : messages.error;
      loadingToast.update({
        id: loadingToast.id,
        title: errorMessage,
        variant: "destructive",
      });
      setTimeout(() => loadingToast.dismiss(), 5000);
    });

  return promise;
}

/**
 * Format API error message for display
 */
export function formatApiError(error: any): string {
  if (typeof error === "string") {
    return error;
  }
  
  // Handle API error response structure
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  // Handle HTTP error responses
  if (error?.statusCode && error?.message) {
    return error.message;
  }
  
  return "An unexpected error occurred";
}

/**
 * Handle API response with automatic toast notifications
 * Use this in service methods to show success/error messages
 */
export async function handleApiResponse<T>(
  promise: Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
): Promise<T> {
  const {
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
  } = options || {};

  try {
    const result = await promise;

    if (showSuccessToast && successMessage) {
      showSuccess(successMessage);
    }

    return result;
  } catch (error) {
    if (showErrorToast) {
      const message = errorMessage || formatApiError(error);
      showError(message);
    }
    throw error;
  }
}
