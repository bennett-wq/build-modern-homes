## Replace homepage hero image

Swap the current farmhouse hero on `/` with the newly uploaded dark BarndoMod image, and ship it pre-optimized so LCP stays fast.

### Steps
1. Copy `user-uploads://BarndoMod_Haven_Hero_Dark.jpg` → `/tmp/hero-source.jpg`.
2. Generate 4 responsive WebP variants with ImageMagick at quality ~80, written to `src/assets/`:
   - `hero-home-480.webp` (480w)
   - `hero-home-800.webp` (800w)
   - `hero-home-1200.webp` (1200w)
   - `hero-home-1600.webp` (1600w)
3. Delete the 4 existing `hero-home-*.webp` files (replaced in place, same filenames so no import changes needed in `src/pages/Index.tsx`).
4. Keep `Index.tsx` `<img>` markup as-is: existing `srcSet`, `sizes="(min-width:1024px) 50vw, 100vw"`, `width=1200`, `height=900`, `fetchPriority="high"`, `decoding="async"`, alt="Modern BaseMod home exterior".
5. Verify with `bunx tsc --noEmit` and `bun run build`; confirm new file sizes are in the ~25–200 KB range.

### Out of scope
- No layout, copy, or animation changes.
- No other pages, components, routes, env, or migrations touched.
- No publish.
