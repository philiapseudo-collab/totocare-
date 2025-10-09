-- Create campaigns table for maternal and infant health causes
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maternal', 'infant')),
  condition_type TEXT NOT NULL,
  target_amount NUMERIC(10, 2),
  current_amount NUMERIC(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donor_name TEXT,
  donor_email TEXT,
  donor_phone TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'bank')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_id TEXT,
  mpesa_receipt_number TEXT,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Campaigns policies (public read, admin write)
CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage campaigns"
ON public.campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role));

-- Donations policies
CREATE POLICY "Anyone can create donations"
ON public.donations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own donations"
ON public.donations
FOR SELECT
USING (donor_email = auth.jwt()->>'email' OR anonymous = true);

CREATE POLICY "Admins can view all donations"
ON public.donations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- Trigger to update campaign amount when donation is completed
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE public.campaigns
    SET current_amount = COALESCE(current_amount, 0) + NEW.amount,
        updated_at = now()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_campaign_amount_trigger
AFTER INSERT OR UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_campaign_amount();

-- Add timestamp triggers
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default campaigns
INSERT INTO public.campaigns (title, description, category, condition_type, target_amount) VALUES
('Fight Postpartum Hemorrhage', 'Help provide life-saving interventions for mothers experiencing severe bleeding after childbirth.', 'maternal', 'postpartum_hemorrhage', 100000),
('Pre-eclampsia Prevention', 'Support early detection and treatment programs for pre-eclampsia to save mothers and babies.', 'maternal', 'pre_eclampsia', 75000),
('Eclampsia Emergency Care', 'Fund emergency care units for mothers experiencing seizures during pregnancy or labor.', 'maternal', 'eclampsia', 80000),
('Safe Labor Support', 'Provide resources to prevent and manage prolonged labor complications.', 'maternal', 'prolonged_labour', 60000),
('Safe Abortion Care', 'Support safe abortion services and complication management to protect maternal health.', 'maternal', 'unsafe_abortion', 70000),
('Maternal Comorbidities Fund', 'General fund for managing other maternal medical conditions during pregnancy.', 'maternal', 'other_maternal', 50000),
('Preterm Birth Support', 'Help provide specialized care for premature babies and their families.', 'infant', 'preterm_birth', 90000),
('Congenital Anomalies Care', 'Fund surgical and therapeutic interventions for babies born with congenital conditions.', 'infant', 'congenital_anomalies', 120000),
('Fight Infant Malnutrition', 'Provide nutrition programs and supplements for malnourished infants.', 'infant', 'malnutrition', 65000),
('Neonatal Infection Treatment', 'Support treatment and prevention of life-threatening infections in newborns.', 'infant', 'neonatal_infections', 85000),
('Infant Health General Fund', 'General fund for various infant health conditions and emergencies.', 'infant', 'other_infant', 55000);