-- Add indexes for frequently queried columns to improve query performance

-- Journal entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, entry_date DESC);

-- Vaccinations indexes
CREATE INDEX IF NOT EXISTS idx_vaccinations_patient_id ON public.vaccinations(patient_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_scheduled_date ON public.vaccinations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vaccinations_status ON public.vaccinations(status);
CREATE INDEX IF NOT EXISTS idx_vaccinations_patient_status ON public.vaccinations(patient_id, status);

-- Conditions indexes
CREATE INDEX IF NOT EXISTS idx_conditions_patient_id ON public.conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_conditions_is_active ON public.conditions(is_active);
CREATE INDEX IF NOT EXISTS idx_conditions_patient_active ON public.conditions(patient_id, is_active);

-- Medications indexes
CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON public.medications(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_is_active ON public.medications(is_active);
CREATE INDEX IF NOT EXISTS idx_medications_patient_active ON public.medications(patient_id, is_active);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_date ON public.appointments(patient_id, appointment_date DESC);

-- Infants indexes
CREATE INDEX IF NOT EXISTS idx_infants_mother_id ON public.infants(mother_id);
CREATE INDEX IF NOT EXISTS idx_infants_pregnancy_id ON public.infants(pregnancy_id);

-- Pregnancies indexes
CREATE INDEX IF NOT EXISTS idx_pregnancies_mother_id ON public.pregnancies(mother_id);
CREATE INDEX IF NOT EXISTS idx_pregnancies_status ON public.pregnancies(status);

-- Medication actions indexes
CREATE INDEX IF NOT EXISTS idx_medication_actions_user_id ON public.medication_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_actions_medication_id ON public.medication_actions(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_actions_scheduled_time ON public.medication_actions(scheduled_time DESC);