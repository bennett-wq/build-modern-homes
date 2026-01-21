// ============================================================================
// Exterior Preview Image Resolver
// Single source of truth for resolving final exterior preview images
// Used in Summary/Review steps across all build flows
// ============================================================================

import { normalizeModelSlug, isPhotoBasedModel } from '@/data/hawthorne-exteriors';
import { getHawthorneExteriorImage, getHawthorneHeroImage, getHawthornePackageById, getHawthorneGarageById } from '@/data/hawthorne-exteriors';
import { getAspenPackageImage, getAspenHeroImage, getAspenPackageById } from '@/data/aspen-exteriors';
import { getBelmontPackageImage, getBelmontHeroImage, getBelmontPackageById } from '@/data/belmont-exteriors';
import { getKeenelandExteriorImage, getKeenelandHeroImage, getKeenelandPackageById, getKeenelandGarageById } from '@/data/keeneland-exteriors';
import { getPackageById, getGarageDoorById } from '@/data/packages';
import { getModelHeroImageBySlug } from '@/lib/model-images';

export interface ExteriorPreviewInfo {
  imageSrc: string;
  packageName: string | null;
  garageName: string | null;
  packageColor: string | null;
  garageColor: string | null;
  isUpgradeGarage: boolean;
}

/**
 * Resolve the final exterior preview image and display info
 * Used in Summary/Review steps for visual confirmation
 */
export function getExteriorPreviewInfo(
  modelSlug: string | null,
  packageId: string | null,
  garageDoorId: string | null
): ExteriorPreviewInfo {
  const normalized = normalizeModelSlug(modelSlug);
  
  // Default fallback
  const defaultResult: ExteriorPreviewInfo = {
    imageSrc: modelSlug ? getModelHeroImageBySlug(modelSlug) : '/placeholder.svg',
    packageName: null,
    garageName: null,
    packageColor: null,
    garageColor: null,
    isUpgradeGarage: false,
  };

  if (!normalized) return defaultResult;

  // Hawthorne model
  if (normalized === 'hawthorne') {
    const pkg = packageId ? getHawthornePackageById(packageId) : null;
    const garage = garageDoorId ? getHawthorneGarageById(garageDoorId) : null;
    
    return {
      imageSrc: packageId && garageDoorId 
        ? getHawthorneExteriorImage(packageId, garageDoorId)
        : getHawthorneHeroImage(),
      packageName: pkg?.name || null,
      garageName: garage?.name || null,
      packageColor: pkg?.primaryColor || null,
      garageColor: garage?.color || null,
      isUpgradeGarage: garage?.isUpgrade || false,
    };
  }

  // Aspen model (package-only, no photo-based garage variants)
  if (normalized === 'aspen') {
    const pkg = packageId ? getAspenPackageById(packageId) : null;
    const garage = garageDoorId ? getGarageDoorById(garageDoorId) : null;
    
    return {
      imageSrc: packageId 
        ? getAspenPackageImage(packageId)
        : getAspenHeroImage(),
      packageName: pkg?.name || null,
      garageName: garage?.name || null,
      packageColor: pkg?.primaryColor || null,
      garageColor: garage?.color || null,
      isUpgradeGarage: false,
    };
  }

  // Belmont model (package-only)
  if (normalized === 'belmont') {
    const pkg = packageId ? getBelmontPackageById(packageId) : null;
    const garage = garageDoorId ? getGarageDoorById(garageDoorId) : null;
    
    return {
      imageSrc: packageId 
        ? getBelmontPackageImage(packageId)
        : getBelmontHeroImage(),
      packageName: pkg?.name || null,
      garageName: garage?.name || null,
      packageColor: pkg?.swatches?.[0] || null,
      garageColor: garage?.color || null,
      isUpgradeGarage: false,
    };
  }

  // Keeneland model
  if (normalized === 'keeneland') {
    const pkg = packageId ? getKeenelandPackageById(packageId) : null;
    const garage = garageDoorId ? getKeenelandGarageById(garageDoorId) : null;
    
    return {
      imageSrc: packageId && garageDoorId 
        ? getKeenelandExteriorImage(packageId, garageDoorId)
        : getKeenelandHeroImage(),
      packageName: pkg?.name || null,
      garageName: garage?.name || null,
      packageColor: pkg?.swatches?.[0] || null,
      garageColor: garage?.swatches?.[0] || null,
      isUpgradeGarage: false,
    };
  }

  // Generic models (use standard packages)
  const pkg = packageId ? getPackageById(packageId) : null;
  const garage = garageDoorId ? getGarageDoorById(garageDoorId) : null;
  
  return {
    imageSrc: getModelHeroImageBySlug(normalized),
    packageName: pkg?.name || null,
    garageName: garage?.name || null,
    packageColor: pkg?.sidingColor || null,
    garageColor: garage?.color || null,
    isUpgradeGarage: false,
  };
}
