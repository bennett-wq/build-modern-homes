import { HomeModel } from "@/data/models";

/**
 * Premium placeholder fallback SVG for when no image is available
 * Used as ultimate fallback in all model card contexts
 */
export const HERO_PLACEHOLDER = "/images/models/placeholders/hero-placeholder.svg";

/** @deprecated Use HERO_PLACEHOLDER instead */
export const MODEL_PLACEHOLDER = HERO_PLACEHOLDER;

/**
 * Get the canonical hero image URL for a model.
 * Single source of truth for hero images across the app:
 * - /models grid cards
 * - /models/:slug detail page hero
 * - Build wizard preview fallback
 * 
 * Resolution order:
 * 1. model.heroImage if defined
 * 2. Convention-based path: /images/models/{slug}/hero.webp
 */
export function getModelHeroImage(model: HomeModel | null | undefined): string {
  if (!model) {
    return HERO_PLACEHOLDER;
  }

  // 1. Use explicit heroImage if defined
  if (model.heroImage) {
    return model.heroImage;
  }

  // 2. Convention-based path using canonical hero.webp naming
  const slug = normalizeModelSlug(model.slug);
  return `/images/models/${slug}/hero.webp`;
}

/**
 * Normalize model slugs for consistent path resolution
 */
function normalizeModelSlug(slug: string): string {
  return slug === "hawthorn" ? "hawthorne" : slug;
}

/**
 * Get hero image URL by slug (for cases where full model object isn't available)
 */
export function getModelHeroImageBySlug(slug: string): string {
  const normalizedSlug = normalizeModelSlug(slug);
  return `/images/models/${normalizedSlug}/hero.webp`;
}
