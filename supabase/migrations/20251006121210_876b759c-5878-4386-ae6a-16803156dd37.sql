-- Create healthcare topics and content tables for Mother-Child Health Handbook

-- Healthcare topics categorization
CREATE TABLE public.healthcare_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL, -- 'antenatal_care', 'postnatal_care', 'infant_care', 'immunization', 'nutrition', 'family_planning'
  title text NOT NULL,
  subtitle text,
  icon text, -- Icon name for display
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Healthcare content sections
CREATE TABLE public.healthcare_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id uuid REFERENCES public.healthcare_topics(id) ON DELETE CASCADE,
  section_title text NOT NULL,
  content_type text NOT NULL, -- 'text', 'list', 'table', 'warning', 'tip'
  content jsonb NOT NULL, -- Flexible content storage
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Antenatal visit schedule
CREATE TABLE public.antenatal_visit_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_number integer NOT NULL,
  gestational_week_min integer NOT NULL,
  gestational_week_max integer,
  visit_title text NOT NULL,
  key_activities jsonb NOT NULL, -- Array of activities
  tests_required jsonb, -- Array of tests
  health_education_topics jsonb, -- Array of topics
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Immunization schedule for infants
CREATE TABLE public.immunization_schedule (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vaccine_name text NOT NULL,
  patient_type text NOT NULL, -- 'infant', 'mother', 'child'
  age_weeks integer, -- For infants
  age_months integer, -- For children
  gestational_timing text, -- For mothers during pregnancy
  dose_number integer,
  vaccine_details jsonb, -- Details about the vaccine
  side_effects jsonb, -- Common side effects
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Growth monitoring milestones
CREATE TABLE public.growth_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  age_months integer NOT NULL,
  milestone_category text NOT NULL, -- 'motor', 'cognitive', 'social', 'language'
  milestone_description text NOT NULL,
  warning_signs jsonb, -- Warning signs if not achieved
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Danger signs for mothers and infants
CREATE TABLE public.danger_signs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_type text NOT NULL, -- 'pregnant_mother', 'postnatal_mother', 'newborn', 'infant'
  timing text, -- 'antenatal', 'delivery', 'postnatal', 'infant'
  danger_sign text NOT NULL,
  severity text NOT NULL, -- 'urgent', 'immediate', 'monitor'
  recommended_action text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Nutrition guidelines
CREATE TABLE public.nutrition_guidelines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_group text NOT NULL, -- 'pregnant_mother', 'lactating_mother', 'infant_0_6m', 'infant_6_12m', 'child_1_2y'
  guideline_title text NOT NULL,
  recommendations jsonb NOT NULL,
  foods_to_include jsonb,
  foods_to_avoid jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.healthcare_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthcare_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.antenatal_visit_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunization_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danger_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_guidelines ENABLE ROW LEVEL SECURITY;

-- RLS Policies - All authenticated users can read healthcare information
CREATE POLICY "Anyone can view healthcare topics"
ON public.healthcare_topics FOR SELECT
USING (is_active = true);

CREATE POLICY "Anyone can view healthcare content"
ON public.healthcare_content FOR SELECT
USING (true);

CREATE POLICY "Anyone can view antenatal visit schedule"
ON public.antenatal_visit_schedule FOR SELECT
USING (true);

CREATE POLICY "Anyone can view immunization schedule"
ON public.immunization_schedule FOR SELECT
USING (true);

CREATE POLICY "Anyone can view growth milestones"
ON public.growth_milestones FOR SELECT
USING (true);

CREATE POLICY "Anyone can view danger signs"
ON public.danger_signs FOR SELECT
USING (true);

CREATE POLICY "Anyone can view nutrition guidelines"
ON public.nutrition_guidelines FOR SELECT
USING (true);

-- Only admins can manage healthcare content
CREATE POLICY "Admins can manage healthcare topics"
ON public.healthcare_topics FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage healthcare content"
ON public.healthcare_content FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add indexes for better query performance
CREATE INDEX idx_healthcare_topics_category ON public.healthcare_topics(category);
CREATE INDEX idx_healthcare_content_topic ON public.healthcare_content(topic_id);
CREATE INDEX idx_antenatal_gestational_week ON public.antenatal_visit_schedule(gestational_week_min, gestational_week_max);
CREATE INDEX idx_immunization_patient_type ON public.immunization_schedule(patient_type);
CREATE INDEX idx_growth_milestones_age ON public.growth_milestones(age_months);
CREATE INDEX idx_danger_signs_type ON public.danger_signs(patient_type, timing);
CREATE INDEX idx_nutrition_target ON public.nutrition_guidelines(target_group);

-- Triggers for updated_at
CREATE TRIGGER update_healthcare_topics_updated_at
  BEFORE UPDATE ON public.healthcare_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_healthcare_content_updated_at
  BEFORE UPDATE ON public.healthcare_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();