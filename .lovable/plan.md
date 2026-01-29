

## Overview

This plan addresses two key requests:

1. **Email Notifications via Resend** - Automatically notify new team members when they're added to the platform
2. **Seamless Admin UX** - Improve navigation, consistency, and usability across Pricing, Leads, and Team dashboards

---

## Part 1: Email Notifications with Resend

### What This Does
When you add a team member at `/admin/users`, they'll automatically receive a welcome email letting them know they've been granted access and what role they have.

### Implementation Steps

**Step 1: Configure Resend API Key**
- You'll need to provide a Resend API key
- This will be stored securely and used by the backend to send emails

**Step 2: Update the `add-team-member` Edge Function**
- After successfully adding/updating a user's role, send a welcome email
- Email includes: their role (Admin or Builder), what they can access, and a link to sign in

**Sample Email Content:**
```
Subject: You've been added to [Project Name] Team

Hi there,

You've been granted [Builder/Admin] access to the pricing admin console.

What you can do:
• View and edit pricing drafts
• [Admin only] Publish pricing and manage team

Sign in here: [link to /admin/login]
```

---

## Part 2: Admin UX Improvements

### Current Issues Identified
1. **Inconsistent navigation** - Different header layouts between Pricing, Leads, and Users pages
2. **Missing breadcrumbs/context** - No clear indication of where you are
3. **Team list shows UUIDs** - User IDs instead of emails (not human-readable)
4. **No quick actions on leads table** - Can't update status without navigating away
5. **No unified sidebar** - Each page has its own nav pattern

### Proposed Solutions

**A. Unified Admin Layout**
Create a shared admin shell with:
- Consistent sidebar navigation (Pricing, Leads, Team)
- Same header across all admin pages
- Visual indicator showing current page
- User info + role badge in a consistent location

**B. Team Management Improvements** (`AdminUsers.tsx`)
- Display user **emails** instead of UUID snippets
- Fetch emails from the auth system via the edge function
- Show when they last signed in (if available)

**C. Leads Dashboard Enhancements** (`AdminLeads.tsx`)
- Add inline status update dropdown directly in table rows
- Add "quick view" drawer/modal to see full lead details
- Add ability to add notes to leads
- Make status badges clickable for quick filtering

**D. Pricing Dashboard Polish** (`AdminPricing.tsx`)
- Ensure navigation matches other admin pages
- Keep consistent styling with Leads and Team pages

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/admin/AdminShell.tsx` | Shared layout wrapper with sidebar nav |
| `src/components/admin/AdminNav.tsx` | Sidebar navigation component |

### Files to Modify
| File | Changes |
|------|---------|
| `supabase/functions/add-team-member/index.ts` | Add Resend email sending logic |
| `supabase/config.toml` | No changes needed (already configured) |
| `src/pages/admin/AdminUsers.tsx` | Use AdminShell, display user emails |
| `src/pages/admin/AdminLeads.tsx` | Use AdminShell, add inline status updates |
| `src/pages/admin/AdminPricing.tsx` | Use AdminShell, consistent layout |
| `src/pages/admin/AdminLogin.tsx` | Minor styling tweaks for consistency |

### Edge Function Changes
The `add-team-member` function will:
1. Complete existing role assignment logic
2. Call Resend API to send welcome email
3. Return success with email confirmation

```typescript
// Pseudocode for email sending
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// After successful role assignment...
await resend.emails.send({
  from: 'Team <noreply@YOUR-DOMAIN.com>',
  to: [targetUser.email],
  subject: 'You've been added to the team',
  html: welcomeEmailTemplate(role, loginUrl)
});
```

### Database Query for Displaying Emails
The edge function already returns the user's email in its response. We'll update `AdminUsers.tsx` to:
1. Request emails when loading the team list (via a new edge function or enhanced query)
2. Display emails alongside roles

---

## Prerequisites

Before implementation, you'll need to:

1. **Set up Resend account** at https://resend.com
2. **Verify your email domain** at https://resend.com/domains
3. **Create an API key** at https://resend.com/api-keys
4. **Provide the API key** when prompted

---

## Summary of Changes

| Area | Improvement |
|------|-------------|
| Email Notifications | Welcome email when team members are added |
| Admin Navigation | Unified sidebar across all admin pages |
| Team Management | Show emails instead of UUIDs |
| Leads Dashboard | Inline status updates, quick filtering |
| Overall UX | Consistent headers, badges, and styling |

