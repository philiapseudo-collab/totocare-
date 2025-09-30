-- Create enum types for better data consistency
CREATE TYPE user_role AS ENUM ('mother', 'healthcare_provider', 'admin');
CREATE TYPE pregnancy_status AS ENUM ('pregnant', 'postpartum', 'not_pregnant');
CREATE TYPE trimester AS ENUM ('first', 'second', 'third');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE vaccination_status AS ENUM ('due', 'completed', 'overdue', 'not_applicable');
CREATE TYPE screening_status AS ENUM ('due', 'completed', 'abnormal', 'normal');
CREATE TYPE condition_severity AS ENUM ('mild', 'moderate', 'severe');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'mother',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pregnancies table
CREATE TABLE public.pregnancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mother_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  conception_date DATE,
  status pregnancy_status NOT NULL DEFAULT 'pregnant',
  current_week INTEGER,
  current_trimester trimester,
  multiparity_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create infants table
CREATE TABLE public.infants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mother_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pregnancy_id UUID REFERENCES public.pregnancies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_weight DECIMAL(5,2),
  birth_height DECIMAL(5,2),
  current_weight DECIMAL(5,2),
  current_height DECIMAL(5,2),
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vaccinations table
CREATE TABLE public.vaccinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL, -- Can be mother or infant
  patient_type TEXT NOT NULL CHECK (patient_type IN ('mother', 'infant')),
  vaccine_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  administered_date DATE,
  status vaccination_status NOT NULL DEFAULT 'due',
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clinic visits table
CREATE TABLE public.clinic_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  visit_date DATE NOT NULL,
  visit_type TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  weight DECIMAL(5,2),
  blood_pressure TEXT,
  notes TEXT,
  next_visit_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reproductive health table
CREATE TABLE public.reproductive_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mother_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  menstrual_cycle_day INTEGER,
  cycle_length INTEGER,
  flow_intensity TEXT CHECK (flow_intensity IN ('light', 'normal', 'heavy')),
  symptoms TEXT[],
  mood TEXT,
  temperature DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create screenings table
CREATE TABLE public.screenings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  screening_type TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  status screening_status NOT NULL DEFAULT 'due',
  results JSONB,
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conditions table
CREATE TABLE public.conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE,
  severity condition_severity,
  is_active BOOLEAN DEFAULT true,
  treatment TEXT,
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medications table
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  prescribed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  healthcare_provider_id UUID REFERENCES public.profiles(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  duration_minutes INTEGER DEFAULT 30,
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reproductive_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Healthcare providers can view their patients" ON public.profiles
  FOR SELECT USING (
    public.get_user_role(auth.uid()) = 'healthcare_provider' OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- RLS Policies for pregnancies
CREATE POLICY "Mothers can access their pregnancies" ON public.pregnancies
  FOR ALL USING (
    mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access pregnancies of their patients" ON public.pregnancies
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin') OR
    mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for infants
CREATE POLICY "Mothers can access their infants" ON public.infants
  FOR ALL USING (
    mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access infants of their patients" ON public.infants
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin') OR
    mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for vaccinations
CREATE POLICY "Users can access their own vaccinations" ON public.vaccinations
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    patient_id IN (SELECT id FROM public.infants WHERE mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  );

CREATE POLICY "Healthcare providers can access patient vaccinations" ON public.vaccinations
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for clinic visits
CREATE POLICY "Patients can access their clinic visits" ON public.clinic_visits
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access clinic visits" ON public.clinic_visits
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for reproductive health
CREATE POLICY "Mothers can access their reproductive health data" ON public.reproductive_health
  FOR ALL USING (
    mother_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access reproductive health data" ON public.reproductive_health
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for screenings
CREATE POLICY "Patients can access their screenings" ON public.screenings
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access screenings" ON public.screenings
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for conditions
CREATE POLICY "Patients can access their conditions" ON public.conditions
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access patient conditions" ON public.conditions
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for medications
CREATE POLICY "Patients can access their medications" ON public.medications
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access patient medications" ON public.medications
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- RLS Policies for appointments
CREATE POLICY "Patients can access their appointments" ON public.appointments
  FOR ALL USING (
    patient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Healthcare providers can access appointments" ON public.appointments
  FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('healthcare_provider', 'admin')
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pregnancies_updated_at BEFORE UPDATE ON public.pregnancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_infants_updated_at BEFORE UPDATE ON public.infants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vaccinations_updated_at BEFORE UPDATE ON public.vaccinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clinic_visits_updated_at BEFORE UPDATE ON public.clinic_visits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reproductive_health_updated_at BEFORE UPDATE ON public.reproductive_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_screenings_updated_at BEFORE UPDATE ON public.screenings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON public.conditions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'mother')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();