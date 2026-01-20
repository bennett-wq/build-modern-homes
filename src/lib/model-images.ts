import { HomeModel } from "@/data/models";

/**
 * Get the canonical hero image URL for a model.
 * Single source of truth for hero images across the app:
 * - /models grid cards
 * - /models/:slug detail page hero
 * - Build wizard preview fallback
 * 
 * Resolution order:
 * 1. model.heroImage if defined
 * 2. Convention-based path: /images/models/{slug}/{slug}-hero.jpg
 * 3. Placeholder fallback
 */
export function getModelHeroImage(model: HomeModel | null | undefined): string {
  if (!model) {
    return "/placeholder.svg";
  }

  // 1. Use explicit heroImage if defined
  if (model.heroImage) {
    return model.heroImage;
  }

  // 2. Convention-based path
  const slug = model.slug;
  return `/images/models/${slug}/${slug}-hero.jpg`;
}

/**
 * Get hero image URL by slug (for cases where full model object isn't available)
 */
export function getModelHeroImageBySlug(slug: string): string {
  // Normalize slug (handle "hawthorn" -> "hawthorne")
  const normalizedSlug = slug === "hawthorn" ? "hawthorne" : slug;
  return `/images/models/${normalizedSlug}/${normalizedSlug}-hero.jpg`;
}

/**
 * Placeholder fallback for when no image is available
 */
export const MODEL_PLACEHOLDER = "/placeholder.svg";
