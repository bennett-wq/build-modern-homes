// ============================================================================
// Add Team Member Edge Function
// Allows admins to grant roles to users who have already signed up
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client for checking caller's permissions
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Admin client for looking up users by email
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the caller is authenticated and is an admin
    const { data: { user: callerUser }, error: authError } = await userClient.auth.getUser()
    if (authError || !callerUser) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if caller is an admin
    const { data: callerRole, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !callerRole) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Only admins can add team members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, role } = await req.json()

    if (!email || !role) {
      return new Response(
        JSON.stringify({ error: 'Email and role are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'builder'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Role must be "admin" or "builder"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Admin ${callerUser.email} adding ${email} as ${role}`)

    // Look up the user by email using admin client
    const { data: { users }, error: lookupError } = await adminClient.auth.admin.listUsers()
    
    if (lookupError) {
      console.error('User lookup error:', lookupError)
      return new Response(
        JSON.stringify({ error: 'Failed to look up user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!targetUser) {
      return new Response(
        JSON.stringify({ 
          error: 'User not found. They must sign up at /admin/login first.',
          code: 'USER_NOT_FOUND'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has a role
    const { data: existingRole } = await adminClient
      .from('user_roles')
      .select('id, role')
      .eq('user_id', targetUser.id)
      .maybeSingle()

    if (existingRole) {
      // Update existing role
      const { error: updateError } = await adminClient
        .from('user_roles')
        .update({ role })
        .eq('user_id', targetUser.id)

      if (updateError) {
        console.error('Update error:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user role' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Updated ${email} from ${existingRole.role} to ${role}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Updated ${email} to ${role}`,
          user_id: targetUser.id,
          email: targetUser.email,
          role,
          updated: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new role
    const { error: insertError } = await adminClient
      .from('user_roles')
      .insert({ user_id: targetUser.id, role })

    if (insertError) {
      console.error('Insert error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to add user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Added ${email} as ${role}`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Added ${email} as ${role}`,
        user_id: targetUser.id,
        email: targetUser.email,
        role,
        updated: false
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})