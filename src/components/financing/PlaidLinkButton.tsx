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
      {isLoading ? "Preparing…" : "Connect"}
    </Button>
  );
}
