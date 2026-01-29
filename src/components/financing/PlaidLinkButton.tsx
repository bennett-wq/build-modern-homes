import React, { useEffect, useMemo, useState } from "react";
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
        onError?.(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  const config = useMemo(
    () => ({
      token: linkToken ?? "",
      onSuccess: (publicToken: string, metadata: any) => {
        const institutionName = metadata?.institution?.name as string | undefined;
        onSuccess({ publicToken, institutionName });
      },
      onExit: (err: any) => {
        if (err) {
          const message = err?.display_message || err?.error_message || "Bank connection cancelled";
          onError?.(message);
        }
      },
    }),
    [linkToken, onSuccess, onError]
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
