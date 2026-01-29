-- Add new category enum values to support expanded upgrade catalog
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'heating';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'appliance';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'electrical';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'plumbing';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'bath';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'countertop';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'cabinet';
ALTER TYPE upgrade_category ADD VALUE IF NOT EXISTS 'interior';