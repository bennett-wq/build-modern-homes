// HeroPreview - Full-bleed hero image for wizard exterior previews
// Use this for consistent, premium image rendering across Step3Design and Step4Review

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroPreviewProps {
  /** Image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Fallback image if primary fails to load */
  fallbackSrc?: string;
  /** Show "Live preview" label below image */
  showLabel?: boolean;
  /** Label text (defaults to "Live preview") */
  labelText?: string;
  /** Show loading indicator during image transitions */
  isLoading?: boolean;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Additional className for the container */
  className?: string;
  /** Enable crossfade animation between image changes */
  enableCrossfade?: boolean;
  /** Optional overlay content (e.g., loading spinner) */
  overlayContent?: React.ReactNode;
}

export function HeroPreview({
  src,
  alt,
  fallbackSrc,
  showLabel = true,
  labelText = 'Live preview',
  isLoading = false,
  onLoad,
  onError,
  className,
  enableCrossfade = false,
  overlayContent,
}: HeroPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setImageLoaded(true); // Prevent infinite loading state
    onError?.();
  }, [onError]);

  const imageSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // Reset error state when src changes
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
    setImageLoaded(false);
  }

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Hero image container - fills available space */}
      <div className="relative flex-1 w-full overflow-hidden rounded-xl bg-muted shadow-lg">
        {/* Aspect ratio inner container */}
        <div className="absolute inset-0">
          {enableCrossfade ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={imageSrc}
                src={imageSrc}
                alt={alt}
                className="w-full h-full object-cover object-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onLoad={handleLoad}
                onError={handleError}
                loading="eager"
                decoding="async"
              />
            </AnimatePresence>
          ) : (
            <img
              src={imageSrc}
              alt={alt}
              className="w-full h-full object-cover object-center"
              onLoad={handleLoad}
              onError={handleError}
              loading="eager"
              decoding="async"
            />
          )}
        </div>

        {/* Loading skeleton - shown before image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/70 animate-pulse" />
        )}

        {/* Loading indicator overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-background/80 backdrop-blur-sm rounded-full"
            >
              <div className="w-3 h-3 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
              <span className="text-[10px] text-muted-foreground font-medium">Updating…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom overlay content */}
        {overlayContent}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span>{labelText}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Wrapper component that provides proper sizing for the HeroPreview
 * in the Step3Design split-panel layout
 */
interface HeroPreviewPanelProps extends HeroPreviewProps {
  /** On mobile, use a fixed height instead of flex-fill */
  isMobile?: boolean;
}

export function HeroPreviewPanel({ isMobile = false, ...props }: HeroPreviewPanelProps) {
  return (
    <div 
      className={cn(
        'bg-gradient-to-b from-muted/30 to-muted/10 flex items-center justify-center p-4',
        isMobile ? 'h-64 shrink-0' : 'flex-1 min-h-0'
      )}
    >
      <div className={cn(
        'w-full h-full',
        // Constrain max dimensions while keeping aspect ratio
        isMobile ? 'max-h-full' : 'max-w-3xl max-h-[500px]'
      )}>
        <HeroPreview {...props} />
      </div>
    </div>
  );
}
