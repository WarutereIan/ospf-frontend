# Toast Notifications Usage Guide

This project uses **shadcn/ui Toast** component for toast notifications, integrated into the API client for automatic error handling and easy success message display.

## Features

- ✅ **Automatic error handling**: All API errors automatically show toast notifications
- ✅ **Configurable**: Can disable toasts per request or use custom messages
- ✅ **Success messages**: Easy to add success toasts in service methods
- ✅ **Type-safe**: Full TypeScript support

## Automatic Error Handling

All API requests (POST, PUT, PATCH, DELETE) automatically show error toast notifications when they fail. GET requests don't show errors by default (to avoid noise in list views), but can be enabled per request.

### Example: Automatic Error Toast

```typescript
// Error toast is automatically shown if this fails
await apiPost('/marketplace/listings', listingData);
```

### Disable Error Toast for Specific Request

```typescript
// Don't show error toast for this request
await apiPost('/marketplace/listings', listingData, {
  showErrorToast: false
});
```

### Custom Error Message

```typescript
// Show custom error message
await apiPost('/marketplace/listings', listingData, {
  errorMessage: "Failed to create listing. Please check your input."
});
```

## Success Messages

Add success toasts in service methods using the `showSuccess` function:

```typescript
import { showSuccess } from "@/lib/toast";

export async function createListing(listing: Partial<ProduceListing>) {
  try {
    const created = await apiPost('/marketplace/listings', dto);
    showSuccess("Listing created successfully");
    return { data: created, message: "Listing created successfully" };
  } catch (error: any) {
    // Error toast is automatically shown by api-client
    return { data: null, error: error.message };
  }
}
```

## Toast Utility Functions

Available in `@/lib/toast`:

```typescript
import { 
  showSuccess, 
  showError, 
  showInfo, 
  showWarning,
  showLoading,
  showPromise 
} from "@/lib/toast";

// Success
showSuccess("Operation completed successfully");

// Error (usually handled automatically by API client)
showError("Something went wrong", "Additional details here");

// Info
showInfo("New update available");

// Warning
showWarning("Please review your input");

// Loading (returns dismiss function)
const dismiss = showLoading("Processing...");
// Later: dismiss();

// Promise-based (shows loading -> success/error)
showPromise(
  apiPost('/endpoint', data),
  {
    loading: "Creating...",
    success: "Created successfully",
    error: "Failed to create"
  }
);
```

## Best Practices

1. **Create/Update/Delete operations**: Always show success toasts
2. **GET requests**: Don't show error toasts by default (already configured)
3. **Critical errors**: Use custom error messages for better UX
4. **429 Throttling**: Automatically shows helpful message
5. **401 Authentication**: Automatically redirects and shows error

## Examples

### Service Method with Success Toast

```typescript
export async function createOrder(order: Partial<Order>) {
  try {
    const dto = toCreateOrderDto(order);
    const created = await apiPost('/orders', dto);
    showSuccess("Order created successfully");
    return { data: created, message: "Order created successfully" };
  } catch (error: any) {
    // Error toast automatically shown
    return { data: null, error: error.message };
  }
}
```

### Disable Error Toast for Silent Failures

```typescript
// Don't show error toast - handle silently
const data = await apiGet('/endpoint', params, {
  showErrorToast: false
}).catch(() => []);
```

### Custom Error Message

```typescript
try {
  await apiPost('/endpoint', data, {
    errorMessage: "Custom error message here"
  });
} catch (error) {
  // Custom message shown instead of API error
}
```
