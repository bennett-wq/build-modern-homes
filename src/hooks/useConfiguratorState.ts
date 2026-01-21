// ============================================================================
// Configurator State Management Hook
// Persists build selections to localStorage with shareable URL support
// Enhanced with intelligent preselection and resume logic
// ============================================================================

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { derivePricingMode, type PricingModeContext } from '@/lib/pricing-mode-utils';
import { getQuoteRequests } from '@/types/quote-request';

const STORAGE_KEY = 'basemod-configurator-state';
const LAST_STEP_KEY = 'basemod-configurator-step';

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

// Load last step from localStorage
function loadLastStep(): number {
  try {
    const stored = localStorage.getItem(LAST_STEP_KEY);
    if (stored) {
      return parseInt(stored, 10) || 1;
    }
  } catch (e) {
    console.warn('Failed to load last step from localStorage:', e);
  }
  return 1;
}

// Save state to localStorage
function saveToStorage(state: BuildSelection): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save configurator state to localStorage:', e);
  }
}

// Save step to localStorage
function saveLastStep(step: number): void {
  try {
    localStorage.setItem(LAST_STEP_KEY, String(step));
  } catch (e) {
    console.warn('Failed to save last step to localStorage:', e);
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

/**
 * Check if stored state has meaningful progress worth resuming
 */
function hasResumableProgress(stored: BuildSelection | null): boolean {
  if (!stored) return false;
  
  // Has meaningful progress if model is selected or build type is set
  return !!(stored.modelSlug || stored.buildType || stored.floorPlanSelections.length > 0);
}

/**
 * Check if there's a saved quote that can be viewed
 */
export function getLatestQuoteId(): string | null {
  const quotes = getQuoteRequests();
  if (quotes.length > 0) {
    return quotes[0].id;
  }
  return null;
}

/**
 * Check if user has an in-progress build
 */
export function hasInProgressBuild(): boolean {
  const stored = loadFromStorage();
  return hasResumableProgress(stored);
}

export function useConfiguratorState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasHydrated = useRef(false);
  
  // Track preselected model from URL (for change confirmation)
  const preselectedModelRef = useRef<string | null>(null);
  
  // State for resume prompt
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [pendingResumeState, setPendingResumeState] = useState<{
    selection: BuildSelection;
    step: number;
  } | null>(null);
  
  // Initialize state with intelligent hydration
  const [selection, setSelection] = useState<BuildSelection>(() => {
    const urlParams = parseUrlParams(searchParams);
    const stored = loadFromStorage();
    const hasUrlParams = Object.keys(urlParams).length > 0;
    
    // Track if model was preselected via URL
    if (urlParams.modelSlug) {
      preselectedModelRef.current = urlParams.modelSlug;
    }
    
    // If URL params exist, use them (deep link scenario)
    if (hasUrlParams) {
      return {
        ...defaultBuildSelection,
        ...urlParams,
      };
    }
    
    // If stored state has progress, we'll prompt to resume
    if (hasResumableProgress(stored)) {
      // Return defaults for now, prompt will handle resume
      return defaultBuildSelection;
    }
    
    return defaultBuildSelection;
  });
  
  // Current step in wizard (1-7)
  const [currentStep, setCurrentStep] = useState(() => {
    const urlParams = parseUrlParams(searchParams);
    const hasUrlParams = Object.keys(urlParams).length > 0;
    
    // If model was preselected, skip to step 3 (model selection)
    if (urlParams.modelSlug) {
      return 3;
    }
    
    return 1;
  });
  
  // Check for resumable state on mount (only once)
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    
    const urlParams = parseUrlParams(searchParams);
    const hasUrlParams = Object.keys(urlParams).length > 0;
    
    // Skip resume prompt if URL params are present
    if (hasUrlParams) return;
    
    const stored = loadFromStorage();
    const lastStep = loadLastStep();
    
    if (hasResumableProgress(stored)) {
      setPendingResumeState({
        selection: stored!,
        step: lastStep,
      });
      setShowResumePrompt(true);
    }
  }, [searchParams]);
  
  // Resume saved state
  const resumeSavedState = useCallback(() => {
    if (pendingResumeState) {
      setSelection(pendingResumeState.selection);
      setCurrentStep(pendingResumeState.step);
      
      // Track preselected model from resume
      if (pendingResumeState.selection.modelSlug) {
        preselectedModelRef.current = pendingResumeState.selection.modelSlug;
      }
    }
    setShowResumePrompt(false);
    setPendingResumeState(null);
  }, [pendingResumeState]);
  
  // Start fresh (discard saved state)
  const startFresh = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_STEP_KEY);
    setSelection(defaultBuildSelection);
    setCurrentStep(1);
    setShowResumePrompt(false);
    setPendingResumeState(null);
    preselectedModelRef.current = null;
  }, []);
  
  // Save to localStorage whenever selection changes
  useEffect(() => {
    saveToStorage(selection);
  }, [selection]);
  
  // Save step to localStorage whenever it changes
  useEffect(() => {
    saveLastStep(currentStep);
  }, [currentStep]);
  
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
    localStorage.removeItem(LAST_STEP_KEY);
    setSelection(defaultBuildSelection);
    setCurrentStep(1);
    setSearchParams({});
    preselectedModelRef.current = null;
  }, [setSearchParams]);
  
  // Individual field setters
  const setIntent = useCallback((intent: BuildIntent) => {
    setSelection(prev => ({ ...prev, intent }));
  }, []);
  
  // Model setter with change tracking
  const setModelSlug = useCallback((modelSlug: string, skipConfirmation?: boolean) => {
    // When changing model, reset floor plan selections and potentially build type
    const model = getModelBySlug(modelSlug);
    const newBuildType = model?.buildTypes[0] || null;
    
    setSelection(prev => ({
      ...prev,
      modelSlug,
      buildType: newBuildType,
      floorPlanSelections: [],
    }));
    
    // Update preselected ref if this is a fresh selection
    if (!preselectedModelRef.current) {
      preselectedModelRef.current = modelSlug;
    }
  }, []);
  
  // Check if changing model would be a change from preselected
  const isModelChangeFromPreselected = useCallback((newModelSlug: string) => {
    return preselectedModelRef.current !== null && 
           preselectedModelRef.current !== newModelSlug;
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
  
  // Exterior package and garage door setters (for unified Step3Design component)
  const setPackageId = useCallback((packageId: string | null) => {
    setSelection(prev => ({ ...prev, packageId }));
  }, []);
  
  const setGarageDoorId = useCallback((garageDoorId: string | null) => {
    setSelection(prev => ({ ...prev, garageDoorId }));
  }, []);
  
  // Get current model from selection
  const currentModel = useMemo(() => {
    return selection.modelSlug ? getModelBySlug(selection.modelSlug) : null;
  }, [selection.modelSlug]);

  // Derive pricing mode dynamically from intent
  // This ensures pricing mode is NEVER hardcoded and always reflects current state
  const derivedPricingMode = useMemo(() => {
    return derivePricingMode({
      buildIntent: selection.intent,
      hasLotSelected: false, // /build wizard doesn't have lot selection (that's BuildWizard)
      servicePackage: 'delivered_installed', // Default for /build configurator
    });
  }, [selection.intent]);

  // Create selection with derived pricing mode for external consumption
  const selectionWithDerivedMode = useMemo((): BuildSelection => ({
    ...selection,
    pricingMode: derivedPricingMode,
  }), [selection, derivedPricingMode]);
  
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
    // State - use selection with derived pricing mode
    selection: selectionWithDerivedMode,
    currentStep,
    currentModel,
    derivedPricingMode,
    
    // Resume prompt state
    showResumePrompt,
    pendingResumeState,
    resumeSavedState,
    startFresh,
    
    // Model preselection tracking
    isModelChangeFromPreselected,
    preselectedModel: preselectedModelRef.current,
    
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
    // Exterior package/garage setters (unified Step3Design)
    setPackageId,
    setGarageDoorId,
    
    // Utilities
    getShareableUrl,
    copyShareableLink,
    resetBuild,
  };
}

export default useConfiguratorState;
