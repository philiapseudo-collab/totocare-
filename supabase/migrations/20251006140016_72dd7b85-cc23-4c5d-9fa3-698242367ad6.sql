-- Enable realtime for infants table to support real-time vaccination tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.infants;