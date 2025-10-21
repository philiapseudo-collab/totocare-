-- Drop the existing check constraint
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_category_check;

-- Add updated check constraint to allow femalehood
ALTER TABLE campaigns ADD CONSTRAINT campaigns_category_check 
CHECK (category IN ('maternal', 'infant', 'femalehood'));

-- Insert sample femalehood campaigns
INSERT INTO campaigns (title, description, category, condition_type, target_amount, current_amount, is_active) VALUES
('Cervical Cancer Screening Program', 'Support free cervical cancer screening and prevention for women in underserved communities', 'femalehood', 'cervical_cancer', 500000, 125000, true),
('Breast Cancer Awareness & Treatment', 'Fund breast cancer detection, treatment, and support services for affected families', 'femalehood', 'breast_cancer', 750000, 280000, true),
('Prostate Cancer Support Fund', 'Provide screening, treatment, and counseling for prostate cancer patients', 'femalehood', 'prostate_cancer', 400000, 95000, true),
('HIV/AIDS Prevention & Care', 'Comprehensive HIV/AIDS prevention, testing, treatment, and community support programs', 'femalehood', 'hiv_aids', 600000, 340000, true),
('GBV Survivor Support Program', 'Medical care, counseling, and legal support for gender-based violence survivors', 'femalehood', 'gbv', 550000, 210000, true),
('Reproductive Health Rights', 'Education and services for reproductive health, family planning, and women''s health rights', 'femalehood', 'reproductive_health', 450000, 180000, true)
ON CONFLICT DO NOTHING;