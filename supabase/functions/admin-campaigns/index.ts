import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { verify } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JWT_SECRET = Deno.env.get('JWT_SECRET') || 'your-super-secret-jwt-key-change-in-production';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'No token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let payload: any;
    try {
      payload = await verify(token, key);
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const path = url.pathname;

    // GET /admin-campaigns - List all campaigns
    if (req.method === 'GET' && path === '/admin-campaigns') {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          created_by_admin:admins!campaigns_created_by_fkey(name, email),
          last_edited_by_admin:admins!campaigns_last_edited_by_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ campaigns: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /admin-campaigns - Create campaign
    if (req.method === 'POST' && path === '/admin-campaigns') {
      const campaignData = await req.json();
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          created_by: payload.adminId,
          last_edited_by: payload.adminId
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: payload.adminId,
          action: 'created_campaign',
          entity_type: 'campaign',
          entity_id: data.id,
          changes: { created: campaignData }
        });

      return new Response(
        JSON.stringify({ campaign: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /admin-campaigns/:id - Update campaign
    const updateMatch = path.match(/^\/admin-campaigns\/([a-f0-9-]+)$/);
    if (req.method === 'PUT' && updateMatch) {
      const campaignId = updateMatch[1];
      const updates = await req.json();

      const { data, error } = await supabase
        .from('campaigns')
        .update({
          ...updates,
          last_edited_by: payload.adminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select()
        .single();

      if (error) throw error;

      // Log audit
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: payload.adminId,
          action: 'updated_campaign',
          entity_type: 'campaign',
          entity_id: campaignId,
          changes: { updated: updates }
        });

      return new Response(
        JSON.stringify({ campaign: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /admin-campaigns/:id - Delete campaign
    const deleteMatch = path.match(/^\/admin-campaigns\/([a-f0-9-]+)$/);
    if (req.method === 'DELETE' && deleteMatch) {
      const campaignId = deleteMatch[1];

      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;

      // Log audit
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: payload.adminId,
          action: 'deleted_campaign',
          entity_type: 'campaign',
          entity_id: campaignId
        });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in admin-campaigns function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
