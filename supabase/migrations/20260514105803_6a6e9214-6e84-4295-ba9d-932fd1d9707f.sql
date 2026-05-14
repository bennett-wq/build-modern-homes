ALTER TABLE public.developments ADD COLUMN IF NOT EXISTS map_center_lng NUMERIC(11, 8);
ALTER TABLE public.developments ADD COLUMN IF NOT EXISTS map_center_lat NUMERIC(10, 8);
ALTER TABLE public.developments ADD COLUMN IF NOT EXISTS map_zoom NUMERIC(4, 2) DEFAULT 16.5;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS width INTEGER;