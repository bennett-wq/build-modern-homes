/**
 * SecureBankConnect - Dedicated, clean page for Plaid Link integration
 * 
 * This page runs in a top-level window (popup or tab) to avoid iframe/overlay
 * conflicts that cause Plaid to exit unexpectedly in embedded environments.
 * 
 * Communication:
 * - Receives sessionId via query param for secure handshake
 * - Sends results back to opener via postMessage
 * - Falls back to localStorage for same-tab navigation fallback
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shield,
  Landmark,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'loading' | 'ready' | 'connecting' | 'success' | 'error';

interface ConnectionResult {
  type: 'plaid-connect-result';
  sessionId: string;
  success: boolean;
  publicToken?: string;
  institutionName?: string;
  error?: string;
}

export default function SecureBankConnect() {
  const [status, setStatus] = useState<ConnectionStatus>('loading');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedInstitution, setConnectedInstitution] = useState<string | null>(null);
  const hasAutoOpened = useRef(false);

  // Get sessionId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId') || '';
  const returnUrl = urlParams.get('returnUrl') || '';

  // Fetch link token on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchLinkToken() {
      console.log('[SecureBankConnect] Fetching link token...');
      try {
        const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
          body: {},
        });

        if (error) throw error;

        const token = (data as { link_token?: string } | null)?.link_token;
        if (!token) throw new Error('Missing link_token from server');

        if (!cancelled) {
          console.log('[SecureBankConnect] Link token received');
          setLinkToken(token);
          setStatus('ready');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize bank connection';
        console.error('[SecureBankConnect] Failed to fetch link token:', err);
        if (!cancelled) {
          setErrorMessage(message);
          setStatus('error');
        }
      }
    }

    fetchLinkToken();

    return () => {
      cancelled = true;
    };
  }, []);

  // Send result back to opener
  const sendResult = useCallback((result: ConnectionResult) => {
    console.log('[SecureBankConnect] Sending result:', result);

    // Try postMessage first (popup scenario)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(result, window.location.origin);
        console.log('[SecureBankConnect] Result sent via postMessage');
      } catch (e) {
        console.warn('[SecureBankConnect] postMessage failed:', e);
      }
    }

    // Also store in localStorage as fallback (same-tab navigation scenario)
    try {
      localStorage.setItem(`plaid-connect-${sessionId}`, JSON.stringify(result));
    } catch (e) {
      console.warn('[SecureBankConnect] localStorage fallback failed:', e);
    }
  }, [sessionId]);

  // Plaid success handler
  const handleSuccess = useCallback((publicToken: string, metadata: any) => {
    const institutionName = metadata?.institution?.name as string | undefined;
    console.log('[SecureBankConnect] Plaid success:', { institutionName });
    
    setConnectedInstitution(institutionName || 'your bank');
    setStatus('success');

    sendResult({
      type: 'plaid-connect-result',
      sessionId,
      success: true,
      publicToken,
      institutionName,
    });

    // Close popup after short delay to show success state
    setTimeout(() => {
      if (window.opener && !window.opener.closed) {
        window.close();
      }
    }, 1500);
  }, [sessionId, sendResult]);

  // Plaid exit handler
  const handleExit = useCallback((err: any, metadata: any) => {
    console.log('[SecureBankConnect] Plaid exit:', { err, metadata });
    
    if (err) {
      const message = err?.display_message || err?.error_message || 'Bank connection was cancelled';
      setErrorMessage(message);
      setStatus('error');

      sendResult({
        type: 'plaid-connect-result',
        sessionId,
        success: false,
        error: message,
      });
    } else {
      // User cancelled without error - just go back to ready state
      setStatus('ready');
    }
  }, [sessionId, sendResult]);

  // Plaid config
  const config: PlaidLinkOptions = linkToken
    ? {
        token: linkToken,
        onSuccess: handleSuccess,
        onExit: handleExit,
      }
    : {
        token: '',
        onSuccess: handleSuccess,
        onExit: handleExit,
      };

  const { open, ready } = usePlaidLink(config);

  // Auto-open Plaid when ready (only once)
  useEffect(() => {
    if (ready && linkToken && !hasAutoOpened.current && status === 'ready') {
      hasAutoOpened.current = true;
      console.log('[SecureBankConnect] Auto-opening Plaid...');
      setStatus('connecting');
      open();
    }
  }, [ready, linkToken, status, open]);

  // Manual open handler (for retry)
  const handleManualOpen = useCallback(() => {
    if (ready && linkToken) {
      setStatus('connecting');
      setErrorMessage(null);
      open();
    }
  }, [ready, linkToken, open]);

  // Retry with fresh token
  const handleRetry = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    setLinkToken(null);
    hasAutoOpened.current = false;

    try {
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: {},
      });

      if (error) throw error;

      const token = (data as { link_token?: string } | null)?.link_token;
      if (!token) throw new Error('Missing link_token from server');

      setLinkToken(token);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize bank connection';
      setErrorMessage(message);
      setStatus('error');
    }
  }, []);

  // Handle close/cancel
  const handleClose = useCallback(() => {
    sendResult({
      type: 'plaid-connect-result',
      sessionId,
      success: false,
      error: 'User cancelled',
    });

    if (window.opener && !window.opener.closed) {
      window.close();
    } else if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.history.back();
    }
  }, [sessionId, sendResult, returnUrl]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-semibold">Secure Bank Connection</h1>
            <p className="text-xs text-muted-foreground">Powered by Plaid</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preparing secure connection</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This will only take a moment...
                </p>
              </div>
            </div>
          )}

          {/* Ready state (if auto-open fails) */}
          {status === 'ready' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Landmark className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Ready to connect</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Click below to securely link your bank account.
                </p>
              </div>

              {/* Security notice */}
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Bank-level security</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your credentials are never shared with us. Plaid uses 256-bit encryption
                      and is used by millions of people.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleManualOpen}
                size="lg"
                className="w-full"
                disabled={!ready || !linkToken}
              >
                <Landmark className="h-4 w-4 mr-2" />
                Connect Your Bank
              </Button>
            </div>
          )}

          {/* Connecting state */}
          {status === 'connecting' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Connecting...</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete the connection in the Plaid window.
                </p>
              </div>
            </div>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Successfully connected!</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {connectedInstitution 
                    ? `Connected to ${connectedInstitution}`
                    : 'Your bank account has been linked.'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                This window will close automatically...
              </p>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Connection failed</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage || 'Something went wrong. Please try again.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} size="lg" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-md mx-auto px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground">
            Your data is encrypted and secure.{' '}
            <a
              href="https://plaid.com/why-is-plaid-involved/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Learn more about Plaid
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
