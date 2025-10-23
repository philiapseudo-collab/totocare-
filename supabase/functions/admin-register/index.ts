import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Whitelisted admin emails
const WHITELISTED_EMAILS = [
  "basilthembi@gmail.com",
  "novatcare@gmail.com",
  "lafenzlimwe@gmail.com"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, password, confirmPassword } = await req.json();

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'missing_fields', message: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'passwords_mismatch', message: 'Passwords do not match' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'weak_password', 
          message: 'Password must be at least 8 characters with uppercase, number, and special character' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Check if email is whitelisted
    if (!WHITELISTED_EMAILS.includes(email.toLowerCase())) {
      console.log(`Registration attempt with unauthorized email: ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'unauthorized_email', 
          message: 'Registration is restricted. This email is not authorized to create an admin account.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'email_exists', 
          message: 'An account with this email already exists. Please sign in.' 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password);

    // Create admin record
    const { data: admin, error: createError } = await supabase
      .from('admins')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating admin:', createError);
      throw createError;
    }

    console.log(`Admin account created successfully for: ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin account created successfully! Please sign in.' 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-register function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'server_error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
