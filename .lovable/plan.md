
# BaseMod Messaging Overhaul - Implementation Plan

## Overview
This plan transforms the BaseMod website from a "builder brochure" into a "movement site" that speaks to both homebuyers seeking ownership and investors seeing inevitability. The changes are content-focused with no routing changes except adding `/mission`.

---

## Files to Modify

### 1. Homepage (`src/pages/Index.tsx`)
**Current state:** Standard builder homepage with "Design your home. See your installed price. Move faster." hero
**New state:** Movement-style manifesto site

**Sections to implement:**

**Hero Section**
- Headline: "The path to ownership is broken. We're rebuilding it."
- Subhead: "Millions of families are ready to buy. The system wasn't ready for them. Until now."
- Trust line: "150+ families. 3 communities. And we're just getting started."
- Design: Large typography, breathing room, statement feel

**"Why This Matters" Section (NEW)**
- Full emotional core copy about broken housing system
- Multi-paragraph prose layout
- Strong typography with whitespace between paragraphs

**"What We're Building" Section (NEW)**
- Focus on homes: "Beautiful homes that belong in real neighborhoods..."
- Copy about modern modular meaning precision, not temporary

**"How It Works" Section (REWORK)**
- New subhead: "We rebuilt the homebuilding process from first click to front door..."
- 4 new steps:
  1. "Clarity from day one"
  2. "Designed for repeatability"
  3. "Built with scale partners"
  4. "Accountable site execution"

**"What Makes BaseMod Different" Section (NEW - 3 cards)**
- Card 1: "Truth in pricing"
- Card 2: "Speed through systems"
- Card 3: "Pride at every price point"

**Keep existing sections:**
- Featured Homes grid (unchanged)
- Choose Your Path cards (unchanged)

**Closing Manifesto (NEW - before footer)**
- Headline: "This is bigger than houses"
- Full manifesto copy with pull-quote potential
- Consider different background treatment (full-bleed)

---

### 2. New Mission Page (`src/pages/Mission.tsx`)
**Create new file** with the following sections:

**Hero/Opening Section**
- Headline: "The housing market failed a generation. We're building the fix."
- Opening body copy about the math of excluded families

**"What We're Here To Do" Section**
- Copy about systematically attainable ownership
- Infrastructure-level correction messaging

**"What We Believe" Section**
- "Ownership is infrastructure" theme
- Copy about rootedness, investment, and community compounding

**"How We're Built" Section**
- Intro: "We're not a tech company cosplaying as a builder..."
- 3 bullet points about platform, manufacturing, site execution
- Closing line about homes at ten thousand scale

**Closing Section**
- Headline: "This is the decade housing gets rebuilt."
- Final manifesto-style closing copy

---

### 3. App Router (`src/App.tsx`)
- Add route: `<Route path="/mission" element={<Mission />} />`
- Add import for Mission page

---

### 4. Header Navigation (`src/components/layout/Header.tsx`)
Update `navItems` array to add "Our Mission":
```typescript
const navItems = [
  { label: "Homes", href: "/models" },
  { label: "Communities", href: "/communities" },
  { label: "Our Mission", href: "/mission" },
  { label: "How It Works", href: "/how-it-works" },
];
```

---

### 5. Footer (`src/components/layout/Footer.tsx`)
**Changes:**
- Brand description: "Rebuilding the path to ownership."
- Newsletter line: "New communities, new models, and the work of making ownership possible again."
- Keep copyright and contact info unchanged
- Update Company links to include "Our Mission" instead of "About BaseMod" or add it

---

### 6. Pricing Page (`src/pages/Pricing.tsx`)
**Hero section updates:**
- Remove "Transparent Pricing" label
- Headline: "Know your number before you commit."
- Subhead: "Homebuilding has been a guessing game for too long. We're changing that with upfront, all-in pricing designed to help you actually plan your life."

---

### 7. Configurator Header (`src/pages/Configurator.tsx`)
**Update header subline (around line 348-349):**
- Current: "Design your home and see a real estimate in minutes."
- New: "Configure your home. See your real price. Take the first step toward something that's actually yours."

---

### 8. Site Metadata (`index.html`)
**Update meta tags:**
- Title: "BaseMod Homes | Rebuilding the Path to Ownership"
- Description: "Modern modular homes with transparent pricing. We're building the infrastructure to make homeownership accessible again—at scale."
- Update og:title and og:description to match

---

## Technical Details

### Design Approach for New Sections

**Typography hierarchy:**
- Hero headlines: `text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]`
- Section headlines: `text-3xl lg:text-4xl font-semibold`
- Body prose: `text-lg text-muted-foreground leading-relaxed`
- Pull quotes: Larger text, possibly accent background

**Section spacing:**
- Use `py-24 lg:py-32` for breathing room
- Max prose width: `max-w-2xl` or `max-w-3xl` for readability

**Manifesto section styling:**
- Consider `bg-primary` or `bg-secondary` full-bleed treatment
- Pull quote could use border-left accent styling

**Animation:**
- Continue using existing framer-motion patterns
- `fadeInUp` variants for content blocks

### CTAs Consistency
Per spec, standardize buttons across site:
- Primary: "Design Your Home"
- Quote flow: "See Your Price"
- Secondary: "Explore Models" / "Find a Community" / "Talk to Us"

---

## Implementation Order

1. Create `Mission.tsx` page with all new content
2. Add route in `App.tsx`
3. Update `Header.tsx` navigation
4. Overhaul `Index.tsx` homepage with all new sections
5. Update `Footer.tsx` messaging
6. Update `Pricing.tsx` hero
7. Update `Configurator.tsx` header subline
8. Update `index.html` metadata

---

## What Will NOT Change
- Routing structure (except adding /mission)
- Pricing logic or configurator functionality
- Component architecture
- Styling system (Tailwind, shadcn)
- Database or backend
- Any admin pages

---

## Content Validation Checklist
- No misleading financing claims
- No "appraises like site-built" claims
- No startup cliches
- Voice: confident not arrogant, urgent not desperate, systematic not corporate, human not soft
