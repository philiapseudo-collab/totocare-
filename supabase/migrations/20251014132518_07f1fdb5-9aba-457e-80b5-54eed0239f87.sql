-- Add patient_type column to medication_alerts table
ALTER TABLE medication_alerts
ADD COLUMN patient_type text NOT NULL DEFAULT 'pregnancy';

-- Add a check constraint to ensure valid patient types
ALTER TABLE medication_alerts
ADD CONSTRAINT valid_patient_type CHECK (patient_type IN ('pregnancy', 'breastfeeding', 'infant'));