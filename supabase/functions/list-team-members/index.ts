// ============================================================================
// List Team Members Edge Function
// Returns team members with their emails (requires admin auth)
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

// Allowed origins for CORS - restrict to trusted domains
const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
  'https://b6311393-fa2b-46a4-a734-59db659ebfc9.lovableproject.com',
  'https://basemodhomes.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Client for checking caller's permissions
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Admin client for looking up user emails
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the caller is authenticated
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
        JSON.stringify({ error: 'Only admins can view team members' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all user roles
    const { data: roles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .order('created_at', { ascending: false })

    if (rolesError) {
      console.error('Roles fetch error:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch team members' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user emails from auth
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers()

    if (usersError) {
      console.error('Users fetch error:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a map of user_id -> email
    const userEmailMap = new Map(users.map(u => [u.id, u.email]))

    // Combine roles with emails
    const teamMembers = (roles || []).map(role => ({
      id: role.id,
      user_id: role.user_id,
      role: role.role,
      created_at: role.created_at,
      email: userEmailMap.get(role.user_id) || null,
    }))

    console.log(`Returning ${teamMembers.length} team members`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        members: teamMembers,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    const corsHeaders = getCorsHeaders(req);
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})