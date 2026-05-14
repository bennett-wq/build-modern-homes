// Centralized route helpers for the Communities preview cockpit.
//
// Phase 1 foundation: every link from /preview/communities into a community,
// site-plan, or build flow MUST go through these helpers so we can flip the
// public surface on later by changing one prefix instead of grepping the app.
//
// SHOW_COMMUNITIES is intentionally NOT consulted here — the preview routes
// stay reachable for internal review even while the public flag is false.

import type { Development } from '@/data/developments';

export const PREVIEW_PREFIX = '/preview/developments';
export const PREVIEW_COMMUNITIES_PATH = '/preview/communities';

// Slugs with both an active development AND existing static lot data driving
// the site-plan route. Mirror src/data/lots/*.ts — adding a new lots file
// requires explicitly adding the slug here.
export const SITE_PLAN_ELIGIBLE_SLUGS: ReadonlySet<string> = new Set([
  'grand-haven',
  'st-james-bay',
  'ypsilanti',
]);

export function isPreviewPath(pathname: string): boolean {
  return pathname.startsWith('/preview/');
}

export function communitiesHref(opts: { preview?: boolean } = {}): string {
  return opts.preview ? PREVIEW_COMMUNITIES_PATH : '/developments';
}

type DevSlice = Pick<Development, 'slug' | 'status'>;

/** Build (configurator) entry. Returns null for non-active communities. */
export function buildHref(
  development: DevSlice | null | undefined,
  opts: { preview?: boolean; lot?: string | null } = {},
): string | null {
  if (!development || development.status !== 'active') return null;
  const prefix = opts.preview ? PREVIEW_PREFIX : '/developments';
  const base = `${prefix}/${development.slug}/build`;
  return opts.lot ? `${base}?lot=${encodeURIComponent(opts.lot)}` : base;
}

/** Site-plan / lot-studio entry. Null when no static lots OR not active. */
export function sitePlanHref(
  development: DevSlice | null | undefined,
  opts: { preview?: boolean } = {},
): string | null {
  if (!development || development.status !== 'active') return null;
  if (!SITE_PLAN_ELIGIBLE_SLUGS.has(development.slug)) return null;
  const prefix = opts.preview ? PREVIEW_PREFIX : '/developments';
  return `${prefix}/${development.slug}/site-plan`;
}

/** Community detail page (always linkable, even for coming-soon). */
export function communityDetailHref(
  development: DevSlice,
  opts: { preview?: boolean } = {},
): string {
  const prefix = opts.preview ? PREVIEW_PREFIX : '/developments';
  return `${prefix}/${development.slug}`;
}
