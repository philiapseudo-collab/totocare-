-- Create admins table
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index for fast email lookups
CREATE INDEX idx_admins_email ON public.admins(email);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can view their own profile
CREATE POLICY "Admins can view their own profile"
ON public.admins
FOR SELECT
USING (id = (current_setting('app.current_admin_id', true))::uuid);

-- Create failed login attempts table
CREATE TABLE public.failed_login_attempts (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  attempt_count INTEGER DEFAULT 1,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_failed_logins_email ON public.failed_login_attempts(email);

-- Create password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  admin_email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reset_tokens_token ON public.password_reset_tokens(token);

-- Create admin audit log table
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_admin_id ON public.admin_audit_log(admin_id);
CREATE INDEX idx_audit_log_created_at ON public.admin_audit_log(created_at);

-- Update campaigns table to track admin creators
ALTER TABLE public.campaigns
ADD COLUMN created_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
ADD COLUMN last_edited_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN image_url TEXT,
ADD COLUMN views_count INTEGER DEFAULT 0;

-- Update campaigns RLS policies for admin access
CREATE POLICY "Admins can manage all campaigns"
ON public.campaigns
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = (current_setting('app.current_admin_id', true))::uuid
    AND is_active = true
  )
);

-- Update trigger for admins updated_at
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();