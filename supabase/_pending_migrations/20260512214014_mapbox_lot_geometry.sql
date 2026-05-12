-- Mapbox lot geometry: additive, backward-compatible columns.
-- Phase 1 schema only. Safe to apply multiple times via IF NOT EXISTS.
-- NOT YET APPLIED: staged here pending PM review. Do not move into
-- supabase/migrations/ until approved (the migration tool will create
-- the official file with a fresh timestamp at apply time).

-- Default longitude (WGS84) for the development's site plan map center.
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS map_center_lng NUMERIC(11, 8);

-- Default latitude (WGS84) for the development's site plan map center.
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS map_center_lat NUMERIC(10, 8);

-- Default Mapbox zoom level for the development's site plan map.
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS map_zoom NUMERIC(4, 2) DEFAULT 16.5;

-- Model body width in feet (used alongside existing length for footprint sizing).
ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS width INTEGER;
