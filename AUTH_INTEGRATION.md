# Authentication Integration

## Overview

The authentication system has been updated to use the backend API instead of mock credentials. The system now:

1. **Auth Service** (`authService.ts`) - Handles all API calls to the backend
2. **Auth Context** (`AuthContext.tsx`) - Manages state and provides authentication to components
3. **Fallback to Mock** - Falls back to mock credentials if backend is unavailable (for development)

## Architecture

```
Backend API (/api/v1/auth)
    ↓
authService.ts (Service Layer)
    ↓
AuthContext.tsx (Context Layer)
    ↓
Components (via useAuth hook)
```

## Backend Endpoints

- `POST /api/v1/auth/login` - Login user (phone/email + password)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

## Service Functions

### `login(phone: string, password: string)`
- Makes API call to backend login endpoint
- Stores access token and refresh token
- Transforms backend user to frontend format
- Falls back to mock credentials if API fails

### `register(registerData: RegisterRequest)`
- Makes API call to backend register endpoint
- Stores tokens and user data
- Returns transformed user object

### `refreshToken()`
- Refreshes access token using refresh token
- Updates stored tokens

### `logout()`
- Calls backend logout endpoint
- Clears tokens from storage

## Role Mapping

Backend roles are mapped to frontend roles:

| Backend Role | Frontend Role |
|-------------|--------------|
| FARMER | farmer |
| BUYER | buyer |
| EXTENSION_OFFICER | officer |
| STAFF | staff |
| AGGREGATION_MANAGER | aggregation_manager |
| INPUT_PROVIDER | input_provider |
| TRANSPORT_PROVIDER | transport_provider |
| ADMIN | staff |

## User Data Transformation

The backend returns user data in this format:
```typescript
{
  user: {
    id: string;
    email: string;
    phone: string;
    role: string; // UPPER_CASE
    status: string;
    profile?: {
      firstName: string;
      lastName: string;
      county?: string;
      ward?: string;
      subCounty?: string;
    };
  };
  accessToken: string;
  refreshToken: string;
}
```

This is transformed to frontend format:
```typescript
{
  id: string;
  name: string; // firstName + lastName
  phone: string;
  role: UserRole; // lowercase
  email?: string;
  location?: string; // from profile.county
  subCounty?: string;
  createdAt?: string;
  lastLogin?: string;
}
```

## Token Storage

Tokens are stored in localStorage under the key `ofsp_auth`:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { ... }
}
```

## Fallback Behavior

If the backend API is unavailable or returns an error:
1. The login function falls back to checking mock credentials
2. This allows development/testing without a running backend
3. Mock credentials are still available in `MOCK_CREDENTIALS` export

## Usage in Components

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    const result = await login("+254712345678", "password123");
    if (result.success) {
      // User is logged in
    } else {
      // Show error: result.error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.name}</div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Seeded Users

The database has been seeded with users matching the frontend mock credentials:

| Role | Phone | Password | Email |
|------|-------|----------|-------|
| Farmer | +254712345678 | farmer123 | john.mutua@example.com |
| Buyer | +254723456789 | buyer123 | sarah.mwangi@example.com |
| Extension Officer | +254734567890 | officer123 | david.kimani@example.com |
| Staff | +254745678901 | staff123 | mary.wanjiku@example.com |
| Aggregation Manager | +254756789012 | manager123 | peter.kariuki@example.com |
| Input Provider | +254767890123 | input123 | grace.njeri@example.com |
| Transport Provider | +254778901234 | transport123 | james.omondi@example.com |
| Admin | +254700000001 | admin123 | admin@jirani-ofsp.com |

Run the seed script:
```bash
cd ospf/backend/backend
npm run prisma:seed
```

## Testing

1. **With Backend Running**: Login will use the backend API
2. **Without Backend**: Login will fall back to mock credentials
3. **Seeded Users**: Use the credentials above to test with real backend data
