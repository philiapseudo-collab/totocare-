-- First, let's check the immunization_schedule structure and populate it with Kenya data
-- Insert Kenya vaccination schedule data
INSERT INTO public.immunization_schedule (vaccine_name, patient_type, age_weeks, age_months, dose_number, vaccine_details, side_effects) VALUES
-- BCG
('BCG', 'infant', 0, 0, 1, '{"dosage": "0.05 ml", "route": "Intradermal", "diseases": ["Tuberculosis"]}', '["Minor swelling at injection site", "Small scar formation"]'),

-- OPV (4 doses)
('OPV', 'infant', 0, 0, 0, '{"dosage": "2 drops", "route": "Oral", "diseases": ["Poliomyelitis"], "timing": "At birth or within 2 weeks"}', '["Rare: Vaccine-associated paralytic polio"]'),
('OPV', 'infant', 6, 0, 1, '{"dosage": "2 drops", "route": "Oral", "diseases": ["Poliomyelitis"]}', '["Rare: Vaccine-associated paralytic polio"]'),
('OPV', 'infant', 10, 0, 2, '{"dosage": "2 drops", "route": "Oral", "diseases": ["Poliomyelitis"]}', '["Rare: Vaccine-associated paralytic polio"]'),
('OPV', 'infant', 14, 0, 3, '{"dosage": "2 drops", "route": "Oral", "diseases": ["Poliomyelitis"]}', '["Rare: Vaccine-associated paralytic polio"]'),

-- Pentavalent (3 doses)
('Dpt-HepB-Hib (Pentavalent)', 'infant', 6, 0, 1, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the left thigh", "diseases": ["Diphtheria", "Tetanus", "Whooping cough (pertussis)", "Hepatitis B", "Haemophilus influenzae type b pneumonia and meningitis"]}', '["Fever", "Irritability", "Swelling at injection site"]'),
('Dpt-HepB-Hib (Pentavalent)', 'infant', 10, 0, 2, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the left thigh", "diseases": ["Diphtheria", "Tetanus", "Whooping cough (pertussis)", "Hepatitis B", "Haemophilus influenzae type b pneumonia and meningitis"]}', '["Fever", "Irritability", "Swelling at injection site"]'),
('Dpt-HepB-Hib (Pentavalent)', 'infant', 14, 0, 3, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the left thigh", "diseases": ["Diphtheria", "Tetanus", "Whooping cough (pertussis)", "Hepatitis B", "Haemophilus influenzae type b pneumonia and meningitis"]}', '["Fever", "Irritability", "Swelling at injection site"]'),

-- PCV10 (3 doses)
('Pneumococcal Conjugate Vaccine-10 (PCV10)', 'infant', 6, 0, 1, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the right thigh", "diseases": ["Pneumococcal", "Severe form of pneumonia", "Meningitis", "Invasive disease", "Acute Otitis Media"]}', '["Fever", "Redness at injection site", "Irritability"]'),
('Pneumococcal Conjugate Vaccine-10 (PCV10)', 'infant', 10, 0, 2, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the right thigh", "diseases": ["Pneumococcal", "Severe form of pneumonia", "Meningitis", "Invasive disease", "Acute Otitis Media"]}', '["Fever", "Redness at injection site", "Irritability"]'),
('Pneumococcal Conjugate Vaccine-10 (PCV10)', 'infant', 14, 0, 3, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the upper outer aspect of the right thigh", "diseases": ["Pneumococcal", "Severe form of pneumonia", "Meningitis", "Invasive disease", "Acute Otitis Media"]}', '["Fever", "Redness at injection site", "Irritability"]'),

-- Rotavirus (2 doses)
('Rotavirus', 'infant', 6, 0, 1, '{"dosage": "1.0 ml", "route": "Oral", "diseases": ["Rotavirus Diarrhea"]}', '["Mild diarrhea", "Irritability"]'),
('Rotavirus', 'infant', 10, 0, 2, '{"dosage": "1.0 ml", "route": "Oral", "diseases": ["Rotavirus Diarrhea"]}', '["Mild diarrhea", "Irritability"]'),

-- IPV (1 dose)
('IPV', 'infant', 14, 0, 1, '{"dosage": "0.5 ml", "route": "Intramuscular (IM) into the upper outer aspect of the right thigh", "diseases": ["Poliomyelitis"]}', '["Pain at injection site", "Fever"]'),

-- Measles Rubella (2 doses)
('Measles Rubella (MR)', 'infant', NULL, 9, 1, '{"dosage": "0.5 ml", "route": "Intramuscular (IM) into the right upper arm (deltoid muscle)", "diseases": ["Measles", "Rubella"]}', '["Fever", "Mild rash", "Joint pain"]'),
('Measles Rubella (MR)', 'infant', NULL, 18, 2, '{"dosage": "0.5 ml", "route": "Intramuscular (IM) into the right upper arm (deltoid muscle)", "diseases": ["Measles", "Rubella"]}', '["Fever", "Mild rash", "Joint pain"]'),

-- Yellow Fever (1 dose - for high-risk counties)
('Yellow-Fever', 'infant', NULL, 9, 1, '{"dosage": "0.5 ml", "route": "Intramuscular into the left upper arm", "diseases": ["Yellow-fever"], "note": "For high risk counties (Baringo, Elgeyo Marakwet, west Pokot and Turkana)"}', '["Fever", "Headache", "Muscle pain"]'),

-- Tetanus Toxoid (TT) / Tetanus Diphtheria (Td)
('Tetanus Toxoid (TT) Tetanus Diphtheria (Td)', 'infant', NULL, 120, 1, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the left upper arm", "diseases": ["Tetanus", "Diphtheria"], "note": "Refer to Schedule for different age groups"}', '["Pain at injection site", "Fever"]'),

-- HPV (2 doses)
('HPV', 'infant', NULL, 120, 1, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the right upper arm", "diseases": ["Human Papilloma Virus"], "timing": "At 10 years"}', '["Pain at injection site", "Fever", "Headache"]'),
('HPV', 'infant', NULL, 126, 2, '{"dosage": "0.5ml", "route": "Intramuscular (IM) into the right upper arm", "diseases": ["Human Papilloma Virus"], "timing": "6 months after 1st dose"}', '["Pain at injection site", "Fever", "Headache"]')
ON CONFLICT DO NOTHING;

-- Enable realtime for vaccinations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.vaccinations;