
# Fix Pre-Qualification Submission Error

## Problem Identified

The pre-qualification form fails to submit due to a **Row-Level Security (RLS) policy gap**. The issue is in the combination of INSERT + SELECT operations:

1. **INSERT works**: The `public_insert_financing_applications` policy correctly allows `anon` and `authenticated` users to insert when `user_id IS NULL`.

2. **SELECT fails**: When the code calls `.insert(...).select('id').single()`, the database needs to return the newly created row. However, there is **no SELECT policy for the `anon` role**, causing the RLS violation.

3. **Anonymous records are orphaned**: Even for authenticated users, the SELECT policies require `user_id = auth.uid()`. But anonymous submissions have `user_id = NULL`, so nobody (except admins/builders) can read them back.

## Solution

Add a SELECT policy that allows users to read back rows they just inserted. Since anonymous submissions set `user_id = null` and we need to return the ID immediately after insert, we have two options:

**Option A (Recommended)**: Remove `.select()` from the insert and use the returned data differently
- The INSERT operation alone will succeed
- We don't need to read back the ID for the success flow

**Option B**: Add a SELECT policy for `anon` role that allows reading rows where `user_id IS NULL`
- This would expose all anonymous financing applications to anonymous users (security risk)

**We'll go with Option A** - modify the insert to not require a SELECT, which is more secure.

---

## Implementation Steps

### Step 1: Update PreQualificationFlow.tsx

Modify the `handleSubmit` function to:
1. Remove `.select('id').single()` from the insert call
2. Handle the response without needing the returned ID
3. Generate a local ID or skip the ID entirely for the success state

**Current code (lines 162-186):**
```typescript
const { data, error } = await supabase
  .from('financing_applications')
  .insert({...})
  .select('id')
  .single();

if (error) throw error;
setApplicationId(data.id);
```

**New code:**
```typescript
const { error } = await supabase
  .from('financing_applications')
  .insert({...});

if (error) throw error;

// Generate a placeholder ID for UI purposes
const tempId = crypto.randomUUID();
setApplicationId(tempId);
```

### Step 2: Add SELECT Policy for Newly Inserted Anonymous Rows (Optional Enhancement)

For better UX if we later need to show application status, we could add a policy:

```sql
-- Allow reading back newly inserted anonymous rows (within session)
CREATE POLICY "anon_read_own_insert_financing_applications"
ON public.financing_applications
FOR SELECT
TO anon
USING (user_id IS NULL AND created_at > now() - interval '5 minutes');
```

However, this is a security tradeoff - for now, simply removing the `.select()` is cleaner.

---

## Technical Details

### Why the Error Says "INSERT violation"

The error message `new row violates row-level security policy for table "financing_applications"` is misleading. In PostgreSQL, when using `INSERT ... RETURNING` (which is what `.select()` does under the hood), the RLS check for SELECT is applied to the RETURNING clause. If SELECT fails, the entire operation is rolled back and reported as an INSERT violation.

### Files to Modify

1. **`src/components/financing/PreQualificationFlow.tsx`** (lines 162-190)
   - Remove `.select('id').single()` from the insert
   - Update success handling to not rely on returned data
   - Keep all form validation and UI flow intact

---

## Expected Outcome

After this fix:
- Anonymous users can submit pre-qualification forms successfully
- The success toast and Step 3 confirmation will display correctly  
- Lead data will be saved to the `financing_applications` table
- Admin/builder team members can still view all applications via their SELECT policies
