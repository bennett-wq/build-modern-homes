/**
 * PlaidLinkButton - Enterprise-grade Plaid Link integration
 * 
 * This component is designed to be completely isolated from React's render cycle
 * to prevent the Plaid modal from closing unexpectedly during user interaction.
 * 
 * Key architecture decisions:
 * 1. Uses refs for ALL callbacks to break the React dependency chain
 * 2. Memoized with React.memo to prevent parent re-renders from affecting this component
 * 3. Link token is fetched once and cached
 * 4. The Plaid config is created once and never changes after initialization
 */

import React, { useCallback, useEffect, useRef, useState, memo, forwardRef } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";

type PlaidLinkSuccessPayload = {
  publicToken: string;
  institutionName?: string;
};

interface PlaidLinkButtonProps {
  onSuccess: (payload: PlaidLinkSuccessPayload) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Internal component that holds the actual Plaid Link logic.
 * This is wrapped in memo to prevent any parent re-renders from affecting it.
 */
function PlaidLinkButtonInner({
  onSuccess,
  onError,
  disabled,
  onOpenChange,
}: PlaidLinkButtonProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedInstitution, setConnectedInstitution] = useState<string | null>(null);

  // Store callbacks in refs - these NEVER cause re-renders
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onOpenChangeRef = useRef(onOpenChange);

  // Keep refs synchronized with latest props (but don't trigger effects)
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Fetch link token exactly ONCE on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchLinkToken() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("plaid-create-link-token", {
          body: {},
        });

        if (error) throw error;

        const token = (data as { link_token?: string } | null)?.link_token;
        if (!token) throw new Error("Missing link_token from server");
        
        if (!cancelled) {
          setLinkToken(token);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize bank connection";
        console.error("PlaidLinkButton: Failed to fetch link token", err);
        if (!cancelled) {
          onErrorRef.current?.(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchLinkToken();

    return () => {
      cancelled = true;
    };
  }, []); // Empty deps - only run once

  // Stable success handler - uses ref internally
  const handleSuccess = useCallback((publicToken: string, metadata: any) => {
    const institutionName = metadata?.institution?.name as string | undefined;
    setIsConnected(true);
    setConnectedInstitution(institutionName || "Bank");
    onSuccessRef.current({ publicToken, institutionName });
  }, []);

  // Stable exit handler - uses ref internally
  const handleExit = useCallback((err: any, metadata: any) => {
    // Notify parent that Plaid is closing
    onOpenChangeRef.current?.(false);

    // Helpful diagnostics for tricky iframe/overlay lifecycle issues
    console.info("PlaidLinkButton: onExit", { err, metadata });
    
    if (err) {
      const message = err?.display_message || err?.error_message || "Bank connection was cancelled";
      console.warn("PlaidLinkButton: User exited with error", err);
      onErrorRef.current?.(message);
    }
  }, []);

  // Handle when Plaid opens
  const handleOpen = useCallback(() => {
    onOpenChangeRef.current?.(true);
  }, []);

  // Create Plaid config - this should only change when linkToken is set
  // Using a ref to ensure the config object identity is stable
  const configRef = useRef<PlaidLinkOptions | null>(null);
  
  if (linkToken && !configRef.current) {
    configRef.current = {
      token: linkToken,
      onSuccess: handleSuccess,
      onExit: handleExit,
      onEvent: (eventName) => {
        if (eventName === "OPEN") {
          handleOpen();
        }
      },
    };
  }

  // Use the stable config from ref, or a minimal config if not ready
  const config: PlaidLinkOptions = configRef.current || {
    token: "",
    onSuccess: handleSuccess,
    onExit: handleExit,
  };

  const { open, ready } = usePlaidLink(config);

  // Wrap open to notify parent
  const handleClick = useCallback(() => {
    if (ready && linkToken) {
      onOpenChangeRef.current?.(true);
      open();
    }
  }, [ready, linkToken, open]);

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>Connected{connectedInstitution ? ` to ${connectedInstitution}` : ''}</span>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading || !ready || !linkToken}
      size="sm"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Preparing…
        </>
      ) : (
        "Connect"
      )}
    </Button>
  );
}

/**
 * Memoized PlaidLinkButton export.
 * 
 * We use a custom comparison function that ALWAYS returns true after initial render,
 * effectively preventing ANY re-renders from parent components.
 * 
 * This is safe because:
 * 1. All callbacks are stored in refs and accessed via refs
 * 2. The link token is fetched once and never changes
 * 3. The Plaid config is created once and stored in a ref
 */
const PlaidLinkButtonWithRef = forwardRef<HTMLSpanElement, PlaidLinkButtonProps>((props, ref) => {
  // Framer Motion / Radix can attach refs when measuring/animating; we accept a ref
  // to avoid React warnings without coupling Plaid Link to any external ref usage.
  return (
    <span ref={ref} className="inline-flex">
      <PlaidLinkButtonInner {...props} />
    </span>
  );
});

PlaidLinkButtonWithRef.displayName = "PlaidLinkButton";

export const PlaidLinkButton = memo(
  PlaidLinkButtonWithRef,
  (prevProps, nextProps) => prevProps.disabled === nextProps.disabled
);
