/**
 * SecureBankConnect - Premium Fintech-Grade Bank Connection Experience
 * 
 * Designed to feel like a VC-backed billion-dollar fintech company:
 * - Beautiful onboarding with trust signals
 * - Step-by-step progress visualization
 * - Premium animations and micro-interactions
 * - Celebration on success
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlaidLink, PlaidLinkOptions } from 'react-plaid-link';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Shield,
  Landmark,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  BadgeCheck,
  Building2,
  FileText,
  Wallet,
  ArrowRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ConnectionStatus = 'intro' | 'loading' | 'ready' | 'connecting' | 'success' | 'error';

interface ConnectionResult {
  type: 'plaid-connect-result';
  sessionId: string;
  success: boolean;
  publicToken?: string;
  institutionName?: string;
  error?: string;
}

// Trust badges data
const TRUST_SIGNALS = [
  { icon: Lock, label: '256-bit encryption' },
  { icon: EyeOff, label: 'Read-only access' },
  { icon: BadgeCheck, label: 'Bank verified' },
];

const DATA_ACCESS_ITEMS = [
  { icon: Building2, label: 'Account info', description: 'Bank name & account type' },
  { icon: FileText, label: 'Income verification', description: 'Recent deposits & paystubs' },
  { icon: Wallet, label: 'Balance check', description: 'Current available funds' },
];

// Confetti animation component
function SuccessConfetti() {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1 + Math.random() * 1,
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ left: `${p.x}%`, backgroundColor: p.color }}
          initial={{ y: -20, opacity: 1, scale: 1 }}
          animate={{ 
            y: '100vh', 
            opacity: 0,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ 
            duration: p.duration, 
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default function SecureBankConnect() {
  const [status, setStatus] = useState<ConnectionStatus>('intro');
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectedInstitution, setConnectedInstitution] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasAutoOpened = useRef(false);

  // Get sessionId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('sessionId') || '';
  const returnUrl = urlParams.get('returnUrl') || '';

  // Fetch link token
  const fetchLinkToken = useCallback(async () => {
    setStatus('loading');
    console.log('[SecureBankConnect] Fetching link token...');
    try {
      const { data, error } = await supabase.functions.invoke('plaid-create-link-token', {
        body: {},
      });

      if (error) throw error;

      const token = (data as { link_token?: string } | null)?.link_token;
      if (!token) throw new Error('Missing link_token from server');

      console.log('[SecureBankConnect] Link token received');
      setLinkToken(token);
      setStatus('ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize bank connection';
      console.error('[SecureBankConnect] Failed to fetch link token:', err);
      setErrorMessage(message);
      setStatus('error');
    }
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

    // Also store in localStorage as fallback
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
    setShowConfetti(true);

    sendResult({
      type: 'plaid-connect-result',
      sessionId,
      success: true,
      publicToken,
      institutionName,
    });

    // Close popup after showing success
    setTimeout(() => {
      if (window.opener && !window.opener.closed) {
        window.close();
      }
    }, 2500);
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
      // User cancelled - go back to intro
      setStatus('intro');
      hasAutoOpened.current = false;
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

  // Auto-open Plaid when ready (only once, and only if not on intro)
  useEffect(() => {
    if (ready && linkToken && !hasAutoOpened.current && status === 'ready') {
      hasAutoOpened.current = true;
      console.log('[SecureBankConnect] Auto-opening Plaid...');
      setStatus('connecting');
      open();
    }
  }, [ready, linkToken, status, open]);

  // Start connection (from intro screen)
  const handleStartConnection = useCallback(() => {
    if (linkToken && ready) {
      setStatus('connecting');
      open();
    } else {
      fetchLinkToken();
    }
  }, [linkToken, ready, open, fetchLinkToken]);

  // Retry with fresh token
  const handleRetry = useCallback(async () => {
    hasAutoOpened.current = false;
    setErrorMessage(null);
    await fetchLinkToken();
  }, [fetchLinkToken]);

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

  const slideVariants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Confetti on success */}
      {showConfetti && <SuccessConfetti />}

      {/* Header */}
      <header className="relative border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold">Secure Bank Connection</h1>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>Powered by Plaid</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Intro/Onboarding Screen */}
            {status === 'intro' && (
              <motion.div
                key="intro"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Hero section */}
                <div className="text-center space-y-4">
                  <motion.div 
                    className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-2xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="relative">
                      <Landmark className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      <motion.div 
                        className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring' }}
                      >
                        <Lock className="h-3 w-3 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Verify your finances instantly
                    </h2>
                    <p className="text-muted-foreground mt-2">
                      Securely connect your bank to get pre-qualified in under 2 minutes
                    </p>
                  </div>
                </div>

                {/* Trust signals */}
                <div className="flex justify-center gap-6">
                  {TRUST_SIGNALS.map((signal, i) => (
                    <motion.div
                      key={signal.label}
                      className="flex flex-col items-center gap-1.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <signal.icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {signal.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* What we access */}
                <motion.div 
                  className="rounded-2xl border border-border bg-card p-5 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">What we'll verify</span>
                  </div>
                  
                  <div className="space-y-3">
                    {DATA_ACCESS_ITEMS.map((item, i) => (
                      <motion.div
                        key={item.label}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <div className="p-1.5 rounded-lg bg-muted">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    onClick={handleStartConnection}
                    size="lg"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
                  >
                    Connect Your Bank
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  <p className="text-center text-xs text-muted-foreground">
                    By continuing, you agree to Plaid's{' '}
                    <a 
                      href="https://plaid.com/legal/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      Terms of Service
                    </a>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Loading state */}
            {status === 'loading' && (
              <motion.div
                key="loading"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Preparing secure connection</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Setting up encrypted channel...
                  </p>
                </div>
                
                {/* Loading steps animation */}
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  {['Initializing encryption', 'Connecting to banks', 'Ready to authenticate'].map((step, i) => (
                    <motion.div
                      key={step}
                      className="flex items-center gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.5 + 0.3 }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                      <span className="text-muted-foreground">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ready state (fallback if auto-open fails) */}
            {status === 'ready' && (
              <motion.div
                key="ready"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="inline-flex items-center justify-center p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Landmark className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Ready to connect</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click below to securely link your bank account.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setStatus('connecting');
                    open();
                  }}
                  size="lg"
                  className="w-full"
                  disabled={!ready || !linkToken}
                >
                  <Landmark className="h-4 w-4 mr-2" />
                  Connect Your Bank
                </Button>
              </motion.div>
            )}

            {/* Connecting state */}
            {status === 'connecting' && (
              <motion.div
                key="connecting"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="relative inline-flex items-center justify-center">
                  <motion.div 
                    className="absolute inset-0 bg-blue-500/30 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Connecting...</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete the connection in the Plaid window
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> Look for a pop-up window to select your bank and sign in.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Success state */}
            {status === 'success' && (
              <motion.div
                key="success"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center space-y-6"
              >
                <motion.div 
                  className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <h2 className="text-xl font-bold">Successfully Connected!</h2>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="text-muted-foreground">
                    {connectedInstitution 
                      ? `Connected to ${connectedInstitution}`
                      : 'Your bank account has been linked.'}
                  </p>
                </motion.div>

                <motion.div
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Returning to your application...</span>
                </motion.div>
              </motion.div>
            )}

            {/* Error state */}
            {status === 'error' && (
              <motion.div
                key="error"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>Bank-level security</span>
            </div>
            <span>•</span>
            <a
              href="https://plaid.com/why-is-plaid-involved/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              About Plaid
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
