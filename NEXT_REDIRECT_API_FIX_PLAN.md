# NEXT_REDIRECT API Route Fix Plan

**Date:** 2025-01-XX  
**Status:** 🔴 Critical Issue Identified  
**Error:** `NEXT_REDIRECT` error in API routes (status 500)

---

## Problem Analysis

### Error Details

**Error Message:**
```
[CREATE_AGENT] API error: Object
error: "NEXT_REDIRECT"
status: 500
```

**Location:** `/api/creator/agents` POST endpoint

**Root Cause:**
- `requireCreator()` calls `redirect("/creator/onboarding")` when user is not a creator
- `redirect()` throws `NEXT_REDIRECT` error (Next.js internal mechanism)
- In API routes, `redirect()` cannot be used - it throws an error instead of redirecting
- The error bubbles up to the catch block
- API route returns 500 with error message "NEXT_REDIRECT"

### Code Flow

```
POST /api/creator/agents
  ↓
requireCreator() (line 25)
  ↓
requireAuth() (lib/auth.ts:89)
  ↓
requireCreator() checks isCreator (lib/auth.ts:90-92)
  ↓
if (!user.isCreator) redirect("/creator/onboarding") (lib/auth.ts:91)
  ↓
redirect() throws NEXT_REDIRECT error ❌
  ↓
Error caught in catch block (route.ts:83)
  ↓
Returns 500 with "NEXT_REDIRECT" error message ❌
```

---

## Solution

### Fix Strategy

**Option 1: Create API-safe versions of auth functions (Recommended)**

Create separate functions for API routes that return errors instead of redirecting:
- `requireCreatorApi()` - Returns JSON error instead of redirecting
- `requireAuthApi()` - Returns JSON error instead of redirecting

**Option 2: Catch NEXT_REDIRECT in API routes**

Catch NEXT_REDIRECT errors and convert to proper JSON responses.

**Recommendation:** Option 1 is cleaner and more explicit.

---

## Implementation Plan

### Step 1: Create API-Safe Auth Functions

**File:** `lib/auth.ts`

**Add new functions:**
```typescript
/**
 * Require authentication for API routes - returns JSON error instead of redirecting
 * Use this in API routes instead of requireAuth()
 */
export async function requireAuthApi(): Promise<{ user: User; error?: never } | { user?: never; error: NextResponse }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        error: NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        ) as any,
      };
    }

    const user = await getCurrentUser();
    if (!user) {
      console.error("getCurrentUser() returned null despite userId existing");
      return {
        error: NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        ) as any,
      };
    }
    return { user };
  } catch (error) {
    console.error("requireAuthApi() error:", error);
    return {
      error: NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      ) as any,
    };
  }
}

/**
 * Require creator status for API routes - returns JSON error instead of redirecting
 * Use this in API routes instead of requireCreator()
 */
export async function requireCreatorApi(): Promise<{ user: User; error?: never } | { user?: never; error: NextResponse }> {
  const authResult = await requireAuthApi();
  if (authResult.error) {
    return authResult;
  }

  const user = authResult.user;
  if (!user.isCreator) {
    return {
      error: NextResponse.json(
        { error: "Creator access required. Please complete onboarding." },
        { status: 403 }
      ) as any,
    };
  }
  return { user };
}
```

**Note:** The return type is a discriminated union to ensure type safety.

### Step 2: Update API Routes to Use API-Safe Functions

**File:** `app/api/creator/agents/route.ts`

**Change:**
```typescript
import { requireCreatorApi } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireCreatorApi();
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user;

    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

**File:** `app/api/creator/agents/[id]/route.ts`

**Update GET handler:**
```typescript
import { requireCreatorApi } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCreatorApi();
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user;

    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

**File:** `app/api/creator/agents/[id]/route.ts`

**Update PUT handler:**
```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireCreatorApi();
    if (authResult.error) {
      return authResult.error;
    }
    const user = authResult.user;

    // ... rest of handler
  } catch (error) {
    // ... error handling
  }
}
```

### Step 3: Find All API Routes Using requireCreator/requireAuth

**Action:** Search for all API routes that use these functions and update them.

**Files to check:**
- `app/api/creator/**/*.ts`
- `app/api/admin/**/*.ts`
- Any other API routes using `requireCreator()` or `requireAuth()`

---

## Alternative: Simpler Approach (If TypeScript unions are complex)

### Simpler Version

**File:** `lib/auth.ts`

```typescript
/**
 * Require authentication for API routes - throws error that can be caught
 * Use this in API routes instead of requireAuth()
 */
export async function requireAuthApi() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await getCurrentUser();
  if (!user) {
    console.error("getCurrentUser() returned null despite userId existing");
    throw new Error("AUTH_FAILED");
  }
  return user;
}

/**
 * Require creator status for API routes - throws error that can be caught
 * Use this in API routes instead of requireCreator()
 */
export async function requireCreatorApi() {
  const user = await requireAuthApi();
  if (!user.isCreator) {
    throw new Error("CREATOR_REQUIRED");
  }
  return user;
}
```

**File:** `app/api/creator/agents/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const user = await requireCreatorApi();
    
    // ... rest of handler
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED" || error.message === "AUTH_FAILED") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message === "CREATOR_REQUIRED") {
        return NextResponse.json(
          { error: "Creator access required. Please complete onboarding." },
          { status: 403 }
        );
      }
    }
    
    // ... other error handling
  }
}
```

**Recommendation:** Use the simpler approach - it's easier to understand and maintain.

---

## Testing Plan

### Test 1: Unauthenticated Request

**Action:** POST to `/api/creator/agents` without auth

**Expected:**
- Status: 401
- Body: `{ "error": "Unauthorized" }`
- No NEXT_REDIRECT error

### Test 2: Authenticated but Not Creator

**Action:** POST to `/api/creator/agents` as authenticated user (not creator)

**Expected:**
- Status: 403
- Body: `{ "error": "Creator access required. Please complete onboarding." }`
- No NEXT_REDIRECT error

### Test 3: Authenticated Creator

**Action:** POST to `/api/creator/agents` as authenticated creator

**Expected:**
- Status: 201
- Body: `{ "id": "...", "slug": "..." }`
- Agent created successfully

---

## Files to Update

1. **`lib/auth.ts`**
   - Add `requireAuthApi()` function
   - Add `requireCreatorApi()` function

2. **`app/api/creator/agents/route.ts`**
   - Replace `requireCreator()` with `requireCreatorApi()`
   - Handle auth errors properly

3. **`app/api/creator/agents/[id]/route.ts`**
   - Replace `requireCreator()` with `requireCreatorApi()` in GET handler
   - Replace `requireCreator()` with `requireCreatorApi()` in PUT handler
   - Handle auth errors properly

4. **All other API routes using `requireCreator()` or `requireAuth()`**
   - Update to use API-safe versions
   - Handle auth errors properly

---

## Implementation Priority

**Priority:** 🔴 Critical - Blocks agent creation

**Estimated Time:** 30-60 minutes

**Steps:**
1. Add API-safe auth functions to `lib/auth.ts`
2. Update `/api/creator/agents` route
3. Update `/api/creator/agents/[id]` route
4. Find and update all other API routes
5. Test all scenarios
6. Deploy fix

---

**Status:** Ready for Implementation

