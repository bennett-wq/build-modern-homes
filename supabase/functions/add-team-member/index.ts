// ============================================================================
// Add Team Member Edge Function
// Allows admins to grant roles to users who have already signed up
// Sends welcome emails via Resend when team members are added
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { Resend } from 'resend'

// Allowed origins for CORS - restrict to trusted domains
const allowedOrigins = [
  'https://build-modern-homes.lovable.app',
  'https://id-preview--b6311393-fa2b-46a4-a734-59db659ebfc9.lovable.app',
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

// Email validation regex (RFC 5321 compliant)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

// Generate welcome email HTML
function generateWelcomeEmail(role: string, loginUrl: string): string {
  const isAdmin = role === 'admin';
  const roleLabel = isAdmin ? 'Admin' : 'Builder';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Team</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 100%; background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 12px; background-color: ${isAdmin ? '#3b82f6' : '#6b7280'}; border-radius: 12px; margin-bottom: 16px;">
                  <span style="font-size: 24px;">🏠</span>
                </div>
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #18181b;">Welcome to the Team!</h1>
              </div>
              
              <!-- Content -->
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
                You've been granted <strong style="color: ${isAdmin ? '#3b82f6' : '#6b7280'};">${roleLabel}</strong> access to the pricing admin console.
              </p>
              
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #18181b;">What you can do:</p>
                <ul style="margin: 0; padding-left: 20px; color: #3f3f46; font-size: 14px; line-height: 22px;">
                  <li style="margin-bottom: 8px;">View and edit pricing drafts</li>
                  <li style="margin-bottom: 8px;">Access financing lead applications</li>
                  ${isAdmin ? '<li style="margin-bottom: 8px;">Publish pricing changes to production</li>' : ''}
                  ${isAdmin ? '<li>Manage team members and permissions</li>' : ''}
                </ul>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; border-radius: 8px;">
                  Sign In to Admin Console
                </a>
              </div>
              
              <p style="margin: 0; font-size: 14px; line-height: 22px; color: #71717a; text-align: center;">
                If you have any questions, reach out to your team administrator.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #e4e4e7; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                This email was sent because you were added to a team. If you believe this was a mistake, please contact your administrator.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
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

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

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

    // Validate email format and length
    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!role) {
      return new Response(
        JSON.stringify({ error: 'Role is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['admin', 'builder'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Role must be "admin" or "builder"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Admin ${callerUser.email} adding ${trimmedEmail} as ${role}`)

    // Look up the user by email using admin client
    const { data: { users }, error: lookupError } = await adminClient.auth.admin.listUsers()
    
    if (lookupError) {
      console.error('User lookup error:', lookupError)
      return new Response(
        JSON.stringify({ error: 'Failed to look up user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = users.find(u => u.email?.toLowerCase() === trimmedEmail.toLowerCase())

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

    let wasUpdated = false;
    let shouldSendEmail = true;

    if (existingRole) {
      // If same role, skip email
      if (existingRole.role === role) {
        shouldSendEmail = false;
      }
      
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

      wasUpdated = true;
      console.log(`Updated ${trimmedEmail} from ${existingRole.role} to ${role}`)
    } else {
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

      console.log(`Added ${trimmedEmail} as ${role}`)
    }

    // Send welcome email if configured and appropriate
    let emailSent = false;
    if (resendApiKey && shouldSendEmail && targetUser.email) {
      try {
        const resend = new Resend(resendApiKey);
        
        // Get the origin from the request or use a default
        const origin = req.headers.get('origin') || 'https://build-modern-homes.lovable.app';
        const loginUrl = `${origin}/admin/login`;
        
        const { error: emailError } = await resend.emails.send({
          from: 'Team <noreply@resend.dev>', // Use resend.dev for testing, replace with verified domain
          to: [targetUser.email],
          subject: `You've been added as ${role === 'admin' ? 'an Admin' : 'a Builder'}`,
          html: generateWelcomeEmail(role, loginUrl),
        });

        if (emailError) {
          console.error('Email send error:', emailError);
          // Don't fail the request if email fails, just log it
        } else {
          emailSent = true;
          console.log(`Welcome email sent to ${targetUser.email}`);
        }
      } catch (emailErr) {
        console.error('Email error:', emailErr);
        // Don't fail the request if email fails
      }
    }

    const action = wasUpdated ? 'Updated' : 'Added';
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${action} ${trimmedEmail} as ${role}`,
        user_id: targetUser.id,
        email: targetUser.email,
        role,
        updated: wasUpdated,
        emailSent,
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