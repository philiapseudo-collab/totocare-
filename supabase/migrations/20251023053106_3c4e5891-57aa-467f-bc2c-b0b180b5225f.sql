-- Add classification field to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS classification text CHECK (classification IN ('government', 'ngo', 'private'));

-- Create campaign_participants table for user registration
CREATE TABLE IF NOT EXISTS campaign_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  participation_status text NOT NULL DEFAULT 'registered' CHECK (participation_status IN ('registered', 'active', 'completed', 'withdrawn')),
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

-- Enable RLS on campaign_participants
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- Users can view campaign participants
CREATE POLICY "Anyone can view campaign participants"
  ON campaign_participants
  FOR SELECT
  USING (true);

-- Users can register for campaigns
CREATE POLICY "Users can register for campaigns"
  ON campaign_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own participation
CREATE POLICY "Users can update their participation"
  ON campaign_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can withdraw from campaigns
CREATE POLICY "Users can withdraw from campaigns"
  ON campaign_participants
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_user_id ON campaign_participants(user_id);

-- Insert sample Kenyan campaigns (amounts in KES thousands)
INSERT INTO campaigns (title, description, category, condition_type, classification, target_amount, current_amount, status, image_url) VALUES
-- Government Campaigns
('Linda Mama Programme', 'Free maternity care for all expectant mothers in Kenya. Access quality delivery services at public health facilities nationwide without any charges.', 'maternal', 'pregnancy', 'government', 500000.00, 350000.00, 'published', 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800'),
('Social Health Insurance Fund (SHIF)', 'Universal health coverage initiative providing comprehensive maternal and child health services across Kenya.', 'maternal', 'pregnancy', 'government', 1000000.00, 670000.00, 'published', 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800'),
('RMNCAH Initiative', 'Reproductive, Maternal, Newborn, Child & Adolescent Health program improving healthcare access in underserved counties.', 'infant', 'general', 'government', 750000.00, 480000.00, 'published', 'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?w=800'),
('Beyond Zero Campaign', 'Government-supported initiative to eliminate preventable maternal and child deaths in Kenya through mobile health clinics.', 'maternal', 'pregnancy', 'government', 600000.00, 420000.00, 'published', 'https://images.unsplash.com/photo-1578496781985-452d4a934d50?w=800'),

-- NGO Campaigns
('Beyond Zero Initiative', '"No woman should die while giving life" - Providing mobile health services, equipment, and ambulances to save mothers and babies.', 'maternal', 'pregnancy', 'ngo', 450000.00, 320000.00, 'published', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800'),
('mothers2mothers (m2m)', 'Peer support program where mothers living with HIV mentor other mothers, ensuring healthy pregnancies and HIV-free babies.', 'maternal', 'hiv', 'ngo', 350000.00, 210000.00, 'published', 'https://images.unsplash.com/photo-1559839914-17aae19c8d2d?w=800'),
('PATH Kenya - Mother-Baby Friendly Initiative', 'Improving quality of maternal and newborn care through facility-based interventions and community engagement.', 'infant', 'general', 'ngo', 280000.00, 180000.00, 'published', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800'),
('HENNET Health Advocacy', 'Health NGO Network coordinating advocacy for maternal, newborn, child health and reproductive rights across Kenya.', 'maternal', 'pregnancy', 'ngo', 220000.00, 140000.00, 'published', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800'),
('Safe Delivery for Maasai Women', '360 Village Health initiative providing culturally sensitive maternal healthcare to 350+ Maasai women in remote areas.', 'maternal', 'pregnancy', 'ngo', 150000.00, 90000.00, 'published', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'),

-- Private Sector Campaigns
('M-PESA Foundation Maternal Health', 'Private sector initiative providing Mother and Baby packs, equipment, and support to 24 health facilities nationwide.', 'maternal', 'pregnancy', 'private', 400000.00, 280000.00, 'published', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'),
('Safaricom Maternal & Child Health', 'Corporate social responsibility program enhancing maternal healthcare infrastructure and training healthcare workers.', 'infant', 'general', 'private', 550000.00, 380000.00, 'published', 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=800'),
('Merck for Mothers Kenya', 'Global pharmaceutical initiative investing in maternal health programs, training, and research to reduce maternal mortality.', 'maternal', 'pregnancy', 'private', 650000.00, 460000.00, 'published', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800'),
('UNFPA x M-Pesa Digital Health', 'Public-private partnership scaling digital health innovations for reproductive, maternal, and newborn care access.', 'maternal', 'pregnancy', 'private', 500000.00, 340000.00, 'published', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800');