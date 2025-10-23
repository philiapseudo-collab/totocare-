-- Enable RLS on failed_login_attempts table
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- No public policies needed - managed via edge functions only

-- Enable RLS on password_reset_tokens table
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No public policies needed - managed via edge functions only

-- Enable RLS on admin_audit_log table
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view their own audit logs
CREATE POLICY "Admins can view their own audit logs"
ON public.admin_audit_log
FOR SELECT
USING (admin_id = (current_setting('app.current_admin_id', true))::uuid);