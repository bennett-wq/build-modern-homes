
# Fix: Plaid Popup Closes When Typing Phone Number

## Problem Analysis

The Plaid Link modal closes unexpectedly when you type in form fields (like the phone number) because of **unstable callback references** causing React re-renders to reinitialize the Plaid SDK.

### Root Cause

In `PreQualificationFlow.tsx` (lines 512-524), the `PlaidLinkButton` receives **inline arrow functions**:

```jsx
<PlaidLinkButton
  onSuccess={({ publicToken, institutionName }) => { ... }}  // NEW function every render
  onError={(message) => toast({ ... })}                       // NEW function every render
/>
```

Every time you type in ANY input field (name, email, phone), the `PreQualificationFlow` component re-renders. This creates **new function references** for `onSuccess` and `onError`.

In `PlaidLinkButton.tsx`:
- Line 51: `useEffect` has `[onError]` as a dependency - so it re-runs on every parent render
- Lines 53-68: `useMemo` config depends on `[linkToken, onSuccess, onError]` - so the Plaid config is recreated

When the Plaid config object changes, the `usePlaidLink` hook reinitializes, which can close the modal.

## Solution

### 1. Fix PlaidLinkButton.tsx - Stabilize Callbacks with useCallback

Wrap callbacks in `useCallback` and use refs to avoid dependency array issues:

```typescript
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type PlaidLinkSuccessPayload = {
  publicToken: string;
  institutionName?: string;
};

export function PlaidLinkButton({
  onSuccess,
  onError,
  disabled,
}: {
  onSuccess: (payload: PlaidLinkSuccessPayload) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to store latest callbacks without causing re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Keep refs up to date
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Fetch link token ONCE on mount - no callback dependencies
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("plaid-create-link-token", {
          body: {},
        });

        if (error) throw error;

        const token = (data as { link_token?: string } | null)?.link_token;
        if (!token) throw new Error("Missing link_token");
        if (!cancelled) setLinkToken(token);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize bank connection";
        if (!cancelled) onErrorRef.current?.(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []); // Empty dependency array - only run once

  // Stable callbacks that use refs
  const handleSuccess = useCallback((publicToken: string, metadata: any) => {
    const institutionName = metadata?.institution?.name as string | undefined;
    onSuccessRef.current({ publicToken, institutionName });
  }, []);

  const handleExit = useCallback((err: any) => {
    if (err) {
      const message = err?.display_message || err?.error_message || "Bank connection cancelled";
      onErrorRef.current?.(message);
    }
  }, []);

  // Config only depends on linkToken now
  const config = useMemo(
    () => ({
      token: linkToken ?? "",
      onSuccess: handleSuccess,
      onExit: handleExit,
    }),
    [linkToken, handleSuccess, handleExit]
  );

  const { open, ready } = usePlaidLink(config);

  return (
    <Button
      type="button"
      onClick={() => open()}
      disabled={disabled || isLoading || !ready || !linkToken}
      size="sm"
    >
      {isLoading ? "Preparing..." : "Connect"}
    </Button>
  );
}
```

### 2. Optional Enhancement - Memoize Parent Callbacks

In `PreQualificationFlow.tsx`, wrap the callbacks with `useCallback` for additional stability:

```typescript
const handlePlaidSuccess = useCallback(
  ({ publicToken, institutionName }: { publicToken: string; institutionName?: string }) => {
    setPlaidPublicToken(publicToken);
    setPlaidInstitutionName(institutionName ?? null);
  },
  []
);

const handlePlaidError = useCallback(
  (message: string) => {
    toast({
      title: 'Bank connection failed',
      description: message,
      variant: 'destructive',
    });
  },
  [toast]
);

// Then use them:
<PlaidLinkButton
  onSuccess={handlePlaidSuccess}
  onError={handlePlaidError}
/>
```

## Technical Details

| Issue | Before | After |
|-------|--------|-------|
| useEffect dependency | `[onError]` - re-runs on every render | `[]` - runs once on mount |
| Callback stability | Inline functions = new ref each render | Refs + useCallback = stable |
| Plaid config | Recreated on parent re-render | Only changes when token changes |

## Files to Modify

1. `src/components/financing/PlaidLinkButton.tsx` - Main fix using refs pattern
2. `src/components/financing/PreQualificationFlow.tsx` - Optional: memoize callbacks

## Expected Result

After this fix:
- Typing in any form field will NOT close the Plaid modal
- The Plaid link token is fetched only once when the component mounts
- The Plaid SDK configuration remains stable throughout the session
