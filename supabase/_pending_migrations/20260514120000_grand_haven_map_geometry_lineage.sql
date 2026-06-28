-- Grand Haven Mapbox source-geometry lineage and safe map-center seed.
-- Pending only. Do not apply until PM reviews the source-geometry report.
--
-- This migration intentionally does NOT populate lots.polygon_coordinates.
-- Current source PDFs are scaled Civil 3D plot sheets, not verified GeoPDFs,
-- and no matching DWG/DXF was found locally.

-- Map-center columns are repeated here so this patch can be applied safely even
-- if the earlier Mapbox geometry migration has not been run yet.
ALTER TABLE public.developments
  ADD COLUMN IF NOT EXISTS map_center_lng NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS map_center_lat NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS map_zoom NUMERIC(4, 2) DEFAULT 16.5,
  ADD COLUMN IF NOT EXISTS map_geometry_source_confidence TEXT,
  ADD COLUMN IF NOT EXISTS map_geometry_source_report_path TEXT,
  ADD COLUMN IF NOT EXISTS map_geometry_source_crs TEXT;

ALTER TABLE public.lots
  ADD COLUMN IF NOT EXISTS polygon_source_confidence TEXT,
  ADD COLUMN IF NOT EXISTS polygon_source_report_path TEXT,
  ADD COLUMN IF NOT EXISTS polygon_source_crs TEXT;

DO $$
BEGIN
  ALTER TABLE public.developments
    ADD CONSTRAINT developments_map_geometry_source_confidence_check
    CHECK (
      map_geometry_source_confidence IS NULL OR
      map_geometry_source_confidence IN ('low', 'medium', 'high', 'verified')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.lots
    ADD CONSTRAINT lots_polygon_source_confidence_check
    CHECK (
      polygon_source_confidence IS NULL OR
      polygon_source_confidence IN ('low', 'medium', 'high', 'verified')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.developments.map_geometry_source_confidence IS
  'Source confidence for development map center and control frame. Mapbox activation also requires every displayed lot polygon to have non-low confidence.';
COMMENT ON COLUMN public.developments.map_geometry_source_report_path IS
  'Repository path to source-geometry lineage report for this development.';
COMMENT ON COLUMN public.developments.map_geometry_source_crs IS
  'CRS used for development map-center/control geometry, typically EPSG:4326.';
COMMENT ON COLUMN public.lots.polygon_source_confidence IS
  'Source confidence for lot polygon_coordinates. Low or null blocks Mapbox activation.';
COMMENT ON COLUMN public.lots.polygon_source_report_path IS
  'Repository path to source-geometry lineage report or digitizing package for the lot polygon.';
COMMENT ON COLUMN public.lots.polygon_source_crs IS
  'CRS used for lot polygon_coordinates, expected to be EPSG:4326 for Mapbox.';

-- Verified parcel-control map center from Ottawa County GIS project parcel
-- bounds, not a city centroid. Confidence is medium because parcel GIS is tax
-- geometry/control only, not a survey.
UPDATE public.developments
SET
  map_center_lng = -86.07302742,
  map_center_lat = 43.03769580,
  map_zoom = 15.20,
  map_geometry_source_confidence = 'medium',
  map_geometry_source_report_path = 'docs/geo/grand-haven/source-geometry-report.md',
  map_geometry_source_crs = 'EPSG:4326'
WHERE slug = 'grand-haven';

-- Keep Grand Haven lot polygons explicitly blocked until matching CAD/QGIS
-- digitizing produces complete GeoJSON Polygon/MultiPolygon coordinates.
UPDATE public.lots AS l
SET
  polygon_source_confidence = 'low',
  polygon_source_report_path = 'docs/geo/grand-haven/source-geometry-report.md',
  polygon_source_crs = 'EPSG:4326'
FROM public.developments AS d
WHERE l.development_id = d.id
  AND d.slug = 'grand-haven'
  AND (
    l.polygon_coordinates IS NULL OR
    l.polygon_coordinates = '[]'::jsonb OR
    l.polygon_coordinates = '{}'::jsonb
  );
