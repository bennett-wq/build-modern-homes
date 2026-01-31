
# Premium UI Redesign Plan for BaseMod Marketing Pages

## Overview
This plan transforms BaseMod's marketing UI into a tier-1 proptech experience with premium spacing, elegant typography, and refined visual hierarchy—while preserving all existing functionality, routing, and copy.

---

## Phase 1: Design System Foundation

### 1.1 Create Reusable Marketing Components

**New Directory:** `src/components/marketing/`

| Component | Purpose |
|-----------|---------|
| `Container.tsx` | Consistent max-width wrapper (max-w-7xl) with responsive padding |
| `Section.tsx` | Section wrapper with py-16/20/24 options, optional bg variants |
| `SectionHeader.tsx` | Centered or left-aligned headline + subtext with proper prose widths |
| `FeatureCard.tsx` | Premium card with icon, title, body—hover elevation |
| `CTASection.tsx` | Bottom CTA band with soft background, headline, buttons |
| `CalloutCard.tsx` | Subtle quote/callout styling for emphasis blocks |

### 1.2 CSS Enhancements (in `index.css`)

Add utility classes:
- `.bg-subtle-grid` - Faint CSS grid pattern for hero backgrounds
- `.bg-gradient-radial` - Soft radial gradient overlay
- `.prose-constrain` - Max-width for readable text (max-w-2xl/3xl)

---

## Phase 2: Homepage Redesign (`/`)

### 2.1 Hero Section (Above Fold)

**Layout:** Two-column on desktop (text left, product preview right)

**Left Column:**
- Add Badge component above headline: "Built for real life"
- H1 with `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]`
- Subhead with `text-lg lg:text-xl text-muted-foreground max-w-md`
- Trust line in smaller muted text
- CTA row: Primary button (h-12, icon) + text link secondary

**Right Column:**
- Replace simple image with elevated Card containing:
  - Gradient header band
  - 3 mini value rows: "Installed Estimate", "Timeline Clarity", "Curb Appeal"
  - Hero image inset with shadow

**Background:** Subtle radial gradient + faint CSS grid pattern

### 2.2 "Why We Exist" Section

- Centered text block with `max-w-3xl mx-auto`
- Left border accent (4px accent color) or large quotation marks
- Callout Card below with "Ownership creates stewardship." (from closing body)

### 2.3 "What We Build" Section

- Split layout: Text left, model grid right
- Model cards with improved spacing and hover states
- Subtle shadow elevation on hover

### 2.4 "How It Works" Section

- Convert bullets to 4-step horizontal grid (desktop) / vertical stack (mobile)
- Each step: Card with number badge (01–04), title extracted from bullet start, remaining text as body
- Consistent card heights, subtle borders

### 2.5 "Differentiators" Section

- 3-card grid with lucide icons (CheckCircle, Clock, Star)
- Cards: `p-8 lg:p-10`, hover elevation, aligned heights
- Section background: `bg-secondary/30`

### 2.6 Closing CTA Band

- Create using new CTASection component
- Soft gradient background + border-top
- Headline + closing line + single strong CTA button

---

## Phase 3: Pricing Page Redesign (`/pricing`)

### 3.1 Hero Area
- Clean centered hero with headline + subhead from brandMessaging
- Badge above headline: "Honest Pricing"

### 3.2 Pricing Bullets
- Convert bullets to 3 horizontal cards (icons: FileCheck, Scale, ClipboardCheck)
- Each card: Icon + bullet text + subtle background

### 3.3 Pricing Components Section
- Keep existing 4-card grid but improve spacing and typography
- Consistent icon containers, improved hover states

### 3.4 Package Examples
- Improve card styling with better borders, shadows
- Add subtle accent on "Starting from" price

### 3.5 Disclaimer Notice Card
- Style in muted bordered Card with info icon
- Softer background, clear but unobtrusive

### 3.6 FAQ Section
- Keep existing accordion
- Polish spacing and typography

### 3.7 Bottom CTA
- Use new CTASection component for consistency

---

## Phase 4: Mission Page Redesign (`/mission`)

### 4.1 Hero
- Large title with premium spacing
- Subtle badge: "Our Mission"

### 4.2 Opening Section
- Prose block with `max-w-2xl mx-auto`
- Improved line-height and letter-spacing

### 4.3 Promise Block
- Convert to CalloutCard with accent border-left
- Larger text, centered alignment

### 4.4 Belief Section
- Prose with section heading
- Improved typography hierarchy

### 4.5 Method Section
- Convert to CalloutCard or subtle background Card
- Clean presentation of the process

### 4.6 Closing Section
- Large centered quote styling
- Premium dark band with proper contrast

---

## Phase 5: Build Flow Header (`/build`)

**Changes are styling only—no logic modifications:**

### 5.1 Header Improvements
- Increase header height padding (py-4 → py-5)
- Improve title typography: `text-xl font-semibold`
- Subline: `text-sm text-muted-foreground max-w-md`
- Better spacing between logo area and title

### 5.2 Step Indicator
- Improve step indicator spacing and visual hierarchy
- Clearer active/completed states

### 5.3 Pricing Rail (Steps 4+)
- Match card styling to new system (borders, shadows)
- Typography consistency
- **No changes to pricing logic or calculations**

---

## Phase 6: Sitewide Polish

### 6.1 Header (`Header.tsx`)
- Increase height: `h-16 lg:h-20` → `h-18 lg:h-22`
- Add subtle `border-b` styling
- Improve nav link spacing: `gap-8` → `gap-10`
- Better alignment of logo + links
- CTA button: ensure `h-11` with proper padding

### 6.2 Footer (`Footer.tsx`)
- Improve column spacing and alignment
- Add mission tagline from `brandMessaging.tagline`
- Better visual hierarchy in link sections
- Increase bottom bar padding

---

## Files to Create

```text
src/components/marketing/
├── Container.tsx
├── Section.tsx
├── SectionHeader.tsx
├── FeatureCard.tsx
├── CTASection.tsx
├── CalloutCard.tsx
└── index.ts
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/index.css` | Add utility classes for backgrounds/grids |
| `src/pages/Index.tsx` | Restructure with new components |
| `src/pages/Pricing.tsx` | Apply premium styling |
| `src/pages/Mission.tsx` | Manifesto-style layout |
| `src/pages/Configurator.tsx` | Header styling only (lines ~330-365) |
| `src/components/layout/Header.tsx` | Height, spacing, alignment polish |
| `src/components/layout/Footer.tsx` | Add tagline, improve spacing |

---

## Technical Notes

### Typography Scale (applied consistently)
- **H1 (Heroes):** `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]`
- **H2 (Sections):** `text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight`
- **H3 (Cards):** `text-xl font-semibold`
- **Body:** `text-base sm:text-lg text-muted-foreground leading-relaxed`
- **Small/Meta:** `text-sm text-muted-foreground`

### Spacing Rhythm
- Section padding: `py-16 sm:py-20` (standard) or `py-20 sm:py-24` (hero)
- Section margin: `mb-12 lg:mb-16` for headers
- Card padding: `p-6 lg:p-8` or `p-8 lg:p-10` (feature cards)
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### No Changes To
- `brandMessaging.ts` content
- Any pricing calculations or logic
- Configurator step logic or state
- Route definitions
- Any Supabase/backend code

---

## Acceptance Checklist

- [ ] All pages load without errors
- [ ] Typography hierarchy is clear and consistent
- [ ] Spacing feels premium and breathable
- [ ] Mobile layouts stack cleanly without cramping
- [ ] No new factual claims added
- [ ] Pricing/configurator logic unchanged
- [ ] All existing functionality preserved
