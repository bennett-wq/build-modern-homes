// ============================================================================
// Configurator State Management Hook
// Persists build selections to localStorage with shareable URL support
// ============================================================================

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type BuildType,
  type BuildIntent,
  models,
  getModelBySlug,
} from '@/data/pricing-config';
import {
  type BuildSelection,
  type ExteriorSelection,
  type FloorPlanSelection,
  defaultBuildSelection,
  defaultExteriorSelection,
} from '@/hooks/usePricingEngine';

const STORAGE_KEY = 'basemod-configurator-state';

// Parse URL params into BuildSelection
function parseUrlParams(searchParams: URLSearchParams): Partial<BuildSelection> {
  const partial: Partial<BuildSelection> = {};
  
  const intent = searchParams.get('intent') as BuildIntent | null;
  if (intent) partial.intent = intent;
  
  const model = searchParams.get('model');
  if (model) partial.modelSlug = model;
  
  const buildType = searchParams.get('type') as BuildType | null;
  if (buildType) partial.buildType = buildType;
  
  const zone = searchParams.get('zone');
  if (zone) partial.zoneId = zone;
  
  const utilityFees = searchParams.get('utilityFees');
  if (utilityFees !== null) partial.includeUtilityFees = utilityFees === 'true';
  
  const permitsCosts = searchParams.get('permitsCosts');
  if (permitsCosts !== null) partial.includePermitsCosts = permitsCosts === 'true';
  
  // Parse floor plan selections
  const floorPlan = searchParams.get('floorPlan');
  if (floorPlan) {
    partial.floorPlanSelections = floorPlan.split(',').map(id => ({
      optionId: id,
      selected: true,
    }));
  }
  
  // Parse exterior selections
  const siding = searchParams.get('siding');
  const shingle = searchParams.get('shingle');
  const door = searchParams.get('door');
  const fascia = searchParams.get('fascia');
  const blackDoors = searchParams.get('blackDoors');
  const stormDoors = searchParams.get('stormDoors');
  
  if (siding || shingle || door || fascia || blackDoors || stormDoors) {
    partial.exteriorSelection = {
      sidingColorId: siding || defaultExteriorSelection.sidingColorId,
      shingleColorId: shingle || defaultExteriorSelection.shingleColorId,
      doorStyleId: door || defaultExteriorSelection.doorStyleId,
      blackFasciaPackage: fascia === 'true',
      blackExteriorDoorCount: parseInt(blackDoors || '0', 10),
      stormDoorCount: parseInt(stormDoors || '0', 10),
    };
  }
  
  return partial;
}

// Load state from localStorage
function loadFromStorage(): BuildSelection | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as BuildSelection;
    }
  } catch (e) {
    console.warn('Failed to load configurator state from localStorage:', e);
  }
  return null;
}

// Save state to localStorage
function saveToStorage(state: BuildSelection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save configurator state to localStorage:', e);
  }
}

// Generate shareable URL params
function generateShareableParams(state: BuildSelection): URLSearchParams {
  const params = new URLSearchParams();
  
  if (state.intent) params.set('intent', state.intent);
  if (state.modelSlug) params.set('model', state.modelSlug);
  if (state.buildType) params.set('type', state.buildType);
  if (state.zoneId !== 'zone-3') params.set('zone', state.zoneId);
  if (!state.includeUtilityFees) params.set('utilityFees', 'false');
  if (!state.includePermitsCosts) params.set('permitsCosts', 'false');
  
  // Floor plan selections
  const selectedFloorPlans = state.floorPlanSelections
    .filter(s => s.selected)
    .map(s => s.optionId);
  if (selectedFloorPlans.length > 0) {
    params.set('floorPlan', selectedFloorPlans.join(','));
  }
  
  // Exterior selections (only if different from defaults)
  const ext = state.exteriorSelection;
  if (ext.sidingColorId !== defaultExteriorSelection.sidingColorId) {
    params.set('siding', ext.sidingColorId);
  }
  if (ext.shingleColorId !== defaultExteriorSelection.shingleColorId) {
    params.set('shingle', ext.shingleColorId);
  }
  if (ext.doorStyleId !== defaultExteriorSelection.doorStyleId) {
    params.set('door', ext.doorStyleId);
  }
  if (ext.blackFasciaPackage) params.set('fascia', 'true');
  if (ext.blackExteriorDoorCount > 0) params.set('blackDoors', String(ext.blackExteriorDoorCount));
  if (ext.stormDoorCount > 0) params.set('stormDoors', String(ext.stormDoorCount));
  
  return params;
}

export function useConfiguratorState() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params, then localStorage, then defaults
  const [selection, setSelection] = useState<BuildSelection>(() => {
    const urlParams = parseUrlParams(searchParams);
    const stored = loadFromStorage();
    
    // URL params take priority, then stored, then defaults
    return {
      ...defaultBuildSelection,
      ...stored,
      ...urlParams,
    };
  });
  
  // Current step in wizard (1-7)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Save to localStorage whenever selection changes
  useEffect(() => {
    saveToStorage(selection);
  }, [selection]);
  
  // Update URL when generating shareable link
  const getShareableUrl = useCallback(() => {
    const params = generateShareableParams(selection);
    const base = window.location.origin + '/build';
    return `${base}?${params.toString()}`;
  }, [selection]);
  
  // Copy shareable link to clipboard
  const copyShareableLink = useCallback(async () => {
    const url = getShareableUrl();
    await navigator.clipboard.writeText(url);
    return url;
  }, [getShareableUrl]);
  
  // Reset to defaults
  const resetBuild = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSelection(defaultBuildSelection);
    setCurrentStep(1);
    setSearchParams({});
  }, [setSearchParams]);
  
  // Individual field setters
  const setIntent = useCallback((intent: BuildIntent) => {
    setSelection(prev => ({ ...prev, intent }));
  }, []);
  
  const setModelSlug = useCallback((modelSlug: string) => {
    // When changing model, reset floor plan selections and potentially build type
    const model = getModelBySlug(modelSlug);
    const newBuildType = model?.buildTypes[0] || null;
    
    setSelection(prev => ({
      ...prev,
      modelSlug,
      buildType: newBuildType,
      floorPlanSelections: [],
    }));
  }, []);
  
  const setBuildType = useCallback((buildType: BuildType) => {
    // Reset floor plan selections when changing build type
    setSelection(prev => ({
      ...prev,
      buildType,
      floorPlanSelections: [],
    }));
  }, []);
  
  const setZoneId = useCallback((zoneId: string) => {
    setSelection(prev => ({ ...prev, zoneId }));
  }, []);
  
  const setIncludeUtilityFees = useCallback((includeUtilityFees: boolean) => {
    setSelection(prev => ({ ...prev, includeUtilityFees }));
  }, []);
  
  const setIncludePermitsCosts = useCallback((includePermitsCosts: boolean) => {
    setSelection(prev => ({ ...prev, includePermitsCosts }));
  }, []);
  
  const toggleFloorPlanOption = useCallback((optionId: string) => {
    setSelection(prev => {
      const existing = prev.floorPlanSelections.find(s => s.optionId === optionId);
      let newSelections: FloorPlanSelection[];
      
      if (existing) {
        newSelections = prev.floorPlanSelections.map(s =>
          s.optionId === optionId ? { ...s, selected: !s.selected } : s
        );
      } else {
        newSelections = [...prev.floorPlanSelections, { optionId, selected: true }];
      }
      
      return { ...prev, floorPlanSelections: newSelections };
    });
  }, []);
  
  const updateExteriorSelection = useCallback((updates: Partial<ExteriorSelection>) => {
    setSelection(prev => ({
      ...prev,
      exteriorSelection: { ...prev.exteriorSelection, ...updates },
    }));
  }, []);
  
  // Get current model from selection
  const currentModel = useMemo(() => {
    return selection.modelSlug ? getModelBySlug(selection.modelSlug) : null;
  }, [selection.modelSlug]);
  
  // Check if floor plan option is selected
  const isFloorPlanOptionSelected = useCallback((optionId: string) => {
    return selection.floorPlanSelections.some(s => s.optionId === optionId && s.selected);
  }, [selection.floorPlanSelections]);
  
  // Navigation
  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(7, step)));
  }, []);
  
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(7, prev + 1));
  }, []);
  
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  }, []);
  
  return {
    // State
    selection,
    currentStep,
    currentModel,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Setters
    setIntent,
    setModelSlug,
    setBuildType,
    setZoneId,
    setIncludeUtilityFees,
    setIncludePermitsCosts,
    toggleFloorPlanOption,
    updateExteriorSelection,
    isFloorPlanOptionSelected,
    
    // Utilities
    getShareableUrl,
    copyShareableLink,
    resetBuild,
  };
}

export default useConfiguratorState;
