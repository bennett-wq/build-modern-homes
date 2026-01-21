// ============================================================================
// Image Utilities - Asset verification and fallback chain
// ============================================================================

import { HERO_PLACEHOLDER } from './model-images';

/**
 * Dev-only asset verification - checks if an image URL is actually served
 * Only runs in development mode to help debug missing assets
 */
export async function verifyImageAsset(url: string, context: string): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (!import.meta.env.DEV) return true;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok || !contentType.startsWith('image/')) {
      console.warn(
        `[${context}] Asset not served: ${url} (status: ${response.status}, content-type: ${contentType})`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[${context}] Asset fetch failed: ${url}`, error);
    return false;
  }
}

/**
 * Run dev-only verification for critical model hero images
 * Call this once on component mount in dev mode
 */
export function verifyModelHeroImages(
  models: Array<{ slug: string; heroImage?: string }>,
  context: string
): void {
  if (!import.meta.env.DEV) return;
  
  models.forEach(model => {
    const heroUrl = model.heroImage || `/images/models/${model.slug}/hero.webp`;
    verifyImageAsset(heroUrl, `${context}:${model.slug}`);
  });
}

/**
 * Get fallback chain for model hero images
 * Returns array of URLs to try in order
 */
export function getHeroImageFallbackChain(slug: string, primaryUrl?: string): string[] {
  const chain: string[] = [];
  
  // Primary: explicit heroImage if provided
  if (primaryUrl) {
    chain.push(primaryUrl);
  }
  
  // Secondary: canonical webp path
  const webpPath = `/images/models/${slug}/hero.webp`;
  if (!chain.includes(webpPath)) {
    chain.push(webpPath);
  }
  
  // Tertiary: png fallback
  chain.push(`/images/models/${slug}/hero.png`);
  
  // Final: placeholder SVG
  chain.push(HERO_PLACEHOLDER);
  
  return chain;
}

/**
 * Handle image error with multi-stage fallback
 * Returns the next fallback URL to try, or null if exhausted
 */
export function getNextFallback(
  currentSrc: string,
  fallbackChain: string[]
): string | null {
  const currentIndex = fallbackChain.indexOf(currentSrc);
  
  // If not in chain or at end, return null
  if (currentIndex === -1 || currentIndex >= fallbackChain.length - 1) {
    return null;
  }
  
  return fallbackChain[currentIndex + 1];
}
