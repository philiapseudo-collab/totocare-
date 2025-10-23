import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHITELISTED_EMAILS = [
  "basilthembi@gmail.com",
  "novatcare@gmail.com",
  "lafenzlimwe@gmail.com"
];

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, rememberMe } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_fields', message: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for rate limiting
    const { data: failedAttempts } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (failedAttempts) {
      const now = new Date();
      if (failedAttempts.locked_until && new Date(failedAttempts.locked_until) > now) {
        const remainingMinutes = Math.ceil((new Date(failedAttempts.locked_until).getTime() - now.getTime()) / 60000);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'account_locked', 
            message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.` 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get admin from database
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!admin || adminError) {
      await handleFailedLogin(supabase, email);
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_credentials', message: 'Invalid email or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify email still whitelisted
    if (!WHITELISTED_EMAILS.includes(admin.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'access_revoked', message: 'Access has been revoked' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if account is active
    if (!admin.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'account_deactivated', message: 'Account has been deactivated' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      await handleFailedLogin(supabase, email);
      return new Response(
        JSON.stringify({ success: false, error: 'invalid_credentials', message: 'Invalid email or password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear failed login attempts
    await supabase
      .from('failed_login_attempts')
      .delete()
      .eq('email', email.toLowerCase());

    // Generate JWT token
    const expiresIn = rememberMe ? 7 * 24 * 60 * 60 : 2 * 60 * 60; // 7 days or 2 hours
    const exp = Math.floor(Date.now() / 1000) + expiresIn;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const token = await create(
      { alg: "HS256", typ: "JWT" },
      { adminId: admin.id, email: admin.email, name: admin.name, exp },
      key
    );

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    // Log audit
    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: admin.id,
        action: 'login',
        entity_type: 'admin',
        entity_id: admin.id
      });

    console.log(`Admin logged in successfully: ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        },
        expiresIn
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-login function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFailedLogin(supabase: any, email: string) {
  const { data: existing } = await supabase
    .from('failed_login_attempts')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    const newCount = existing.attempt_count + 1;
    const lockUntil = newCount >= 5 
      ? new Date(Date.now() + 15 * 60 * 1000).toISOString() // Lock for 15 minutes
      : null;

    await supabase
      .from('failed_login_attempts')
      .update({
        attempt_count: newCount,
        last_attempt: new Date().toISOString(),
        locked_until: lockUntil
      })
      .eq('email', email.toLowerCase());
  } else {
    await supabase
      .from('failed_login_attempts')
      .insert({
        email: email.toLowerCase(),
        attempt_count: 1,
        last_attempt: new Date().toISOString()
      });
  }
}
