# Authentication Bypass Documentation

This document explains how to bypass authentication across all pages in the application without being redirected to signin.

## Overview

The authentication bypass system allows you to access all protected routes and features without going through the signin process. This is useful for:

- Development and testing
- Demos and presentations  
- Quick access to features without authentication setup

## How to Enable

Set the following environment variable:

```bash
NEXT_PUBLIC_BYPASS_AUTH=true
```

This can be set in:
- `.env.local` (for local development)
- `.env` (for general environment)
- Your deployment environment variables

## What Gets Bypassed

When `NEXT_PUBLIC_BYPASS_AUTH=true` is set, the following authentication checks are bypassed:

### 1. Middleware Protection
- **File**: `middleware.ts`
- **Effect**: All protected routes are accessible without authentication
- **Routes**: `/home`, `/finance`, `/cards`, `/investment`, `/settings`, `/send-money`, `/receive-money`, `/savings`

### 2. Component-Level Protection
- **ProtectedRoute components**: Skip authentication checks
- **Dashboard layout**: No redirect to signin
- **Individual page components**: Skip user verification

### 3. API Routes
- **User status endpoint**: Returns mock verified user data
- **All protected endpoints**: Accept requests without valid tokens (when bypass is enabled)

### 4. Context Providers
- **AuthContext**: Provides mock user data automatically
- **Session hooks**: Return mock session data

## Mock Data Provided

When bypass is enabled, the system provides the following mock data:

### User Data
```javascript
{
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Demo User'
}
```

### Session Data
```javascript
{
  user: mockUser,
  expires: '24 hours from now'
}
```

### User Status
```javascript
{
  emailVerified: true,
  profileComplete: true,
  bypass: true
}
```

## Files Modified

The following files have been updated to support the bypass functionality:

### Core Authentication
- `middleware.ts` - Route-level protection bypass
- `contexts/AuthContext.tsx` - Mock user data injection
- `lib/auth-bypass.ts` - Utility functions for bypass logic

### Protected Components
- `components/ProtectedRoute.tsx` - Component protection bypass
- `components/protected-route.tsx` - NextAuth protection bypass
- `app/(dashboard)/layout.tsx` - Dashboard layout bypass

### Page Components
- `components/home-page.tsx` - Home page verification bypass
- `components/dashboard-page.tsx` - Dashboard verification bypass
- `components/investment-page.tsx` - Investment page bypass
- `components/stock-quote.tsx` - Stock quote authentication bypass

### Hooks and Services
- `hooks/useSavings.ts` - Savings data with mock fallback
- `hooks/useCards.ts` - Cards data with mock fallback

### API Routes
- `app/api/user/status/route.ts` - User status with bypass support

## Usage Examples

### Basic Setup
```bash
# In .env.local
NEXT_PUBLIC_BYPASS_AUTH=true
```

### Checking Bypass Status in Code
```javascript
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

if (isAuthBypassEnabled()) {
  // Bypass logic
  console.log('Auth bypass is enabled');
}
```

### Using Mock Data
```javascript
import { mockUser, mockToken } from '@/lib/auth-bypass';

// Use mock data when bypass is enabled
const user = isAuthBypassEnabled() ? mockUser : realUser;
```

## Important Notes

1. **Security**: Never enable bypass in production environments
2. **Environment Variable**: Must be `NEXT_PUBLIC_` prefixed to be available in client-side code
3. **Mock Data**: All mock data is consistent across the application
4. **API Calls**: Some API calls will still be made but will return mock data
5. **Navigation**: All navigation flows work normally, just without authentication requirements

## Troubleshooting

### Bypass Not Working
1. Check that `NEXT_PUBLIC_BYPASS_AUTH=true` is set correctly
2. Restart your development server after changing environment variables
3. Clear browser cache and localStorage
4. Check browser console for bypass confirmation logs

### Still Getting Redirected
1. Verify the environment variable is exactly `NEXT_PUBLIC_BYPASS_AUTH=true`
2. Check that all components are using the updated bypass logic
3. Look for any custom authentication logic that might not be updated

### Mock Data Issues
1. Check that mock data is being provided by AuthContext
2. Verify API endpoints are returning bypass-enabled responses
3. Clear browser storage to remove any cached authentication state

## Disabling Bypass

To disable bypass and return to normal authentication:

1. Remove or set `NEXT_PUBLIC_BYPASS_AUTH=false`
2. Restart your development server
3. Clear browser localStorage and sessionStorage
4. Navigate to `/signin` to authenticate normally

## Development Workflow

1. Enable bypass for quick development: `NEXT_PUBLIC_BYPASS_AUTH=true`
2. Test features without authentication overhead
3. Disable bypass to test authentication flows: `NEXT_PUBLIC_BYPASS_AUTH=false`
4. Ensure production deployments never have bypass enabled
