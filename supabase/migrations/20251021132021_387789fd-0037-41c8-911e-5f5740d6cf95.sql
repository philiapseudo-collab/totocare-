-- Remove duplicate campaigns (keep the most recent one for each title)
DELETE FROM campaigns a
USING campaigns b
WHERE a.id < b.id 
AND a.title = b.title 
AND a.category = b.category;

-- Update all femalehood campaigns to have 0 current_amount
UPDATE campaigns 
SET current_amount = 0 
WHERE category = 'femalehood';

-- Also reset other campaigns to 0 if needed for consistency
UPDATE campaigns 
SET current_amount = 0 
WHERE current_amount > 0;