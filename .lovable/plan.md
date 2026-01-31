
# Wizard Flow Optimization Plan: Making BaseMod the Best Digital Homebuilder Platform

## Executive Summary
This plan addresses visual inconsistencies and UX friction discovered during mobile testing of both the 8-step `/build` flow and 5-step Communities flow (`/developments/:slug/build`). The goal is to create a seamless, premium experience across all wizard flows.

---

## Issues Identified During Testing

### 1. Duplicate "Step X of Y" Text (High Priority)
In `/build`, the step progress text appears twice:
- Once in the mobile StepIndicator component
- Again below the indicator (`Step {currentStep} of {STEPS.length}`)

**Location**: `src/pages/Configurator.tsx` lines 361-362

### 2. Inconsistent Step Indicators Between Flows
- **8-Step Flow** (`Configurator.tsx`): Uses `StepIndicator` component with progress bars on mobile
- **5-Step Flow** (`BuildWizard.tsx`): Uses inline icon-based step buttons with connector lines

### 3. StepIntent Has Its Own Footer
`StepIntent.tsx` renders its own fixed footer (lines 149-181) instead of using the shared `WizardStickyFooter` component, causing inconsistent styling.

### 4. Header Spacing Differences
- 8-Step: `py-5` padding with `mb-5` margin before indicator
- 5-Step: `py-3` padding with `mb-4` margin

### 5. Mobile Typography Inconsistencies
Different title sizes and subline visibility across flows.

---

## Phase 1: Unify Step Indicator Design

### 1.1 Update StepIndicator Component
Enhance `src/components/configurator/StepIndicator.tsx` to:
- Remove redundant mobile progress text (already shown in parent)
- Add icon support for visual hierarchy
- Improve mobile tap targets
- Use consistent animation patterns

```text
Changes:
- Add optional `icon` prop to Step interface
- Improve mobile progress bar visual weight
- Remove "Step X of Y" text (parent handles this)
- Add subtle gradient to active state
```

### 1.2 Standardize BuildWizard Step Navigation
Update `src/pages/BuildWizard.tsx` to use the shared `StepIndicator` component instead of custom inline step buttons, ensuring visual consistency between flows.

---

## Phase 2: Fix Configurator Header Issues

### 2.1 Remove Duplicate Step Text
In `src/pages/Configurator.tsx`, remove the redundant "Step X of Y" text below the indicator:

```text
Lines 360-363:
Delete the p element showing "Step {currentStep} of {STEPS.length}"
```

### 2.2 Optimize Header Spacing for Mobile
- Reduce `mb-5` to `mb-3` for tighter mobile layout
- Add responsive title sizing: `text-base sm:text-lg md:text-xl`

---

## Phase 3: Standardize Sticky Footer Usage

### 3.1 Migrate StepIntent to WizardStickyFooter
Replace the custom fixed footer in `StepIntent.tsx` with `WizardStickyFooter` for consistency:

```text
Changes to src/components/configurator/steps/StepIntent.tsx:
- Import WizardStickyFooter, WizardFooterSpacer
- Remove lines 149-181 (custom footer)
- Add WizardFooterSpacer to content area
- Add WizardStickyFooter with proper props
```

### 3.2 Audit All Steps for Footer Consistency
Verify all step components use the shared footer pattern:
- StepLocation.tsx - needs audit
- StepModel.tsx - needs audit  
- StepBuildType.tsx - needs audit
- StepServicePackage.tsx - needs audit
- StepFloorPlan.tsx - needs audit

---

## Phase 4: Premium Mobile Polish

### 4.1 Header Styling Harmonization
Create consistent header styling across both flows:

```text
Unified Header Styles:
- Height: h-auto with py-3 sm:py-4
- Background: bg-background/95 backdrop-blur-sm
- Border: border-b border-border
- Title: text-base sm:text-xl font-semibold tracking-tight
- Subline: text-xs sm:text-sm text-muted-foreground (hidden on mobile)
```

### 4.2 Step Indicator Mobile Improvements
- Increase progress bar height from `h-1` to `h-1.5` for better visibility
- Add subtle shadow to active step
- Ensure minimum tap target of 44px

### 4.3 Safe Area Handling
Ensure all footers account for device safe areas:
```text
Add to WizardStickyFooter:
- pb-safe or env(safe-area-inset-bottom)
```

---

## Phase 5: Flow-Specific Optimizations

### 5.1 Communities Flow (BuildWizard.tsx)
- Use shared StepIndicator component
- Match header styling to 8-step flow
- Ensure lot selection celebration animation is smooth

### 5.2 Direct Build Flow (Configurator.tsx)
- Remove duplicate step text
- Tighten header spacing
- Ensure footer visibility on all devices

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/configurator/StepIndicator.tsx` | Remove mobile step text, add icon support, improve styling |
| `src/pages/Configurator.tsx` | Remove duplicate step text, optimize header spacing |
| `src/pages/BuildWizard.tsx` | Use shared StepIndicator, harmonize header styling |
| `src/components/configurator/steps/StepIntent.tsx` | Migrate to WizardStickyFooter |
| `src/components/wizard/WizardStickyFooter.tsx` | Add safe area bottom padding |

---

## Technical Implementation Details

### StepIndicator Enhancement
```typescript
// Add to Step interface
interface Step {
  id: number;
  name: string;
  shortName: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Mobile view changes
// Remove: "Step {currentStep} of {steps.length}" text
// Keep: Progress bars only
```

### Configurator Header Cleanup
```typescript
// Remove this block (lines 360-363):
{/* Step progress text */}
<p className="text-center text-xs text-muted-foreground/60">
  Step {currentStep} of {STEPS.length}
</p>
```

### StepIntent Footer Migration
```typescript
// Replace custom footer with:
<WizardFooterSpacer />
<WizardStickyFooter
  onContinue={onNext}
  canContinue={!!selectedIntent}
  continueLabel="Continue"
  hideBack={true}
  pulseOnReady={selectedIntent}
>
  {selectedIntent && (
    <span className="flex items-center gap-2 text-sm text-muted-foreground">
      <Check className="w-4 h-4 text-accent" />
      {intentOptions.find(o => o.id === selectedIntent)?.name}
    </span>
  )}
</WizardStickyFooter>
```

---

## Acceptance Criteria

- [ ] No duplicate "Step X of Y" text on mobile
- [ ] Consistent header styling between both flows
- [ ] All step components use WizardStickyFooter
- [ ] Mobile tap targets are at least 44px
- [ ] Safe area padding on all devices
- [ ] Smooth animations without layout shifts
- [ ] No functional changes to pricing or state logic
- [ ] Both flows feel premium and "seamless"

---

## Testing Checklist

After implementation:
1. Test 8-step flow (`/build`) on mobile (390x844)
2. Test 5-step flow (`/developments/grand-haven/build`) on mobile
3. Verify footer visibility on all steps
4. Check step navigation works correctly
5. Verify no visual regressions on desktop
6. Test on iPhone SE (320px width) for minimum width compatibility

---

## Notes

- No changes to pricing logic, calculations, or state management
- No changes to brandMessaging content
- All changes are visual/UX polish only
- Portal-based footer architecture is preserved
