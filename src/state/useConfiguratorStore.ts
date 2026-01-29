// ============================================================================
// Unified Configurator State Store
// Single source of truth for all configurator flows (direct + communities)
// Replaces: useConfiguratorState, useBuildSelection
// ============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  BuildType,
  FoundationType,
  ServicePackage,
  QuoteInsertPayload,
} from '@/types/database';

// ============================================================================
// Types
// ============================================================================

export type FlowType = 'communities' | 'direct';
export type BuildIntent = 'own-land' | 'find-land' | 'basemod-community' | null;
export type PricingMode = 'delivered_installed' | 'supply_only' | 'community_all_in';

export interface LocationState {
  zipCode: string;
  address: string;
  known: boolean | null; // null = not answered, true/false = explicit choice
}

export interface ConfiguratorState {
  // ═══════════════════════════════════════════════════════════════
  // FLOW CONTEXT
  // ═══════════════════════════════════════════════════════════════
  flowType: FlowType;
  developmentSlug: string | null;

  // ═══════════════════════════════════════════════════════════════
  // PROGRESS TRACKING (NOT persisted)
  // ═══════════════════════════════════════════════════════════════
  currentStep: number;
  completedSteps: number[];

  // ═══════════════════════════════════════════════════════════════
  // USER SELECTIONS (persisted)
  // ═══════════════════════════════════════════════════════════════

  // Step: Intent (direct flow only)
  intent: BuildIntent;

  // Step: Location (direct flow) / Lot (communities flow)
  location: LocationState;
  lotId: string | null; // UUID from lots table

  // Step: Model Selection
  modelId: string | null; // UUID from models table
  modelSlug: string | null; // Slug for backward compatibility

  // Step: Build Type
  buildType: BuildType | null;
  foundationType: FoundationType;

  // Step: Service Package
  servicePackage: ServicePackage;

  // Step: Floor Plan Options
  selectedOptionIds: string[]; // UUIDs from upgrade_options table

  // Step: Exterior Design
  exteriorPackageId: string | null; // UUID from exterior_packages table
  garageDoorId: string | null; // UUID from garage_door_options table

  // Step: Summary Toggles
  includeUtilityFees: boolean;
  includePermitsCosts: boolean;
}

export interface ConfiguratorActions {
  // Flow initialization
  initDirectFlow: () => void;
  initCommunityFlow: (developmentSlug: string) => void;

  // Navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepComplete: (step: number) => void;
  getTotalSteps: () => number;

  // Selection setters
  setIntent: (intent: BuildIntent) => void;
  setLocation: (location: Partial<LocationState>) => void;
  setLotId: (lotId: string | null) => void;
  setModel: (modelId: string | null, modelSlug: string | null) => void;
  setBuildType: (buildType: BuildType | null) => void;
  setFoundationType: (type: FoundationType) => void;
  setServicePackage: (pkg: ServicePackage) => void;
  toggleOption: (optionId: string) => void;
  setExteriorPackage: (id: string | null) => void;
  setGarageDoor: (id: string | null) => void;
  setFeeToggles: (fees: { utility?: boolean; permits?: boolean }) => void;

  // Bulk operations
  resetSelections: () => void;
  hydrateFromLegacy: () => boolean;

  // Computed helpers
  getPricingMode: () => PricingMode;
  getShareableUrl: () => string;
  getQuotePayload: () => QuoteInsertPayload;
  hasSelections: () => boolean;
}

export type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

// ============================================================================
// Default State
// ============================================================================

const defaultState: ConfiguratorState = {
  // Flow context
  flowType: 'direct',
  developmentSlug: null,

  // Progress (never persisted)
  currentStep: 1,
  completedSteps: [],

  // User selections
  intent: null,
  location: {
    zipCode: '',
    address: '',
    known: null,
  },
  lotId: null,
  modelId: null,
  modelSlug: null,
  buildType: null,
  foundationType: 'slab',
  servicePackage: 'delivered_installed',
  selectedOptionIds: [],
  exteriorPackageId: null,
  garageDoorId: null,
  includeUtilityFees: true,
  includePermitsCosts: true,
};

// ============================================================================
// Legacy LocalStorage Keys (for migration)
// ============================================================================

const LEGACY_BUILD_SELECTION_KEY = 'basemod-build-selection';
const LEGACY_CONFIGURATOR_STATE_KEY = 'basemod-configurator-state';
const LEGACY_CONFIGURATOR_STEP_KEY = 'basemod-configurator-step';

// ============================================================================
// Store Implementation
// ============================================================================

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      // ═══════════════════════════════════════════════════════════════
      // FLOW INITIALIZATION
      // ═══════════════════════════════════════════════════════════════

      initDirectFlow: () => {
        set({
          flowType: 'direct',
          developmentSlug: null,
          lotId: null,
          currentStep: 1,
          completedSteps: [],
        });
      },

      initCommunityFlow: (developmentSlug: string) => {
        set({
          flowType: 'communities',
          developmentSlug,
          intent: 'basemod-community',
          currentStep: 1,
          completedSteps: [],
        });
      },

      // ═══════════════════════════════════════════════════════════════
      // NAVIGATION
      // ═══════════════════════════════════════════════════════════════

      goToStep: (step: number) => {
        const totalSteps = get().getTotalSteps();
        set({ currentStep: Math.max(1, Math.min(totalSteps, step)) });
      },

      nextStep: () => {
        const { currentStep, getTotalSteps } = get();
        const totalSteps = getTotalSteps();
        if (currentStep < totalSteps) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      markStepComplete: (step: number) => {
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        }));
      },

      getTotalSteps: () => {
        const { flowType } = get();
        // Direct flow: 8 steps, Communities flow: 4 steps
        return flowType === 'direct' ? 8 : 4;
      },

      // ═══════════════════════════════════════════════════════════════
      // SELECTION SETTERS
      // ═══════════════════════════════════════════════════════════════

      setIntent: (intent: BuildIntent) => {
        set({ intent });
      },

      setLocation: (location: Partial<LocationState>) => {
        set((state) => ({
          location: { ...state.location, ...location },
        }));
      },

      setLotId: (lotId: string | null) => {
        set({ lotId });
      },

      setModel: (modelId: string | null, modelSlug: string | null) => {
        // Reset dependent selections when model changes
        set({
          modelId,
          modelSlug,
          buildType: null,
          selectedOptionIds: [],
        });
      },

      setBuildType: (buildType: BuildType | null) => {
        // Reset floor plan options when build type changes
        set({
          buildType,
          selectedOptionIds: [],
        });
      },

      setFoundationType: (foundationType: FoundationType) => {
        set({ foundationType });
      },

      setServicePackage: (servicePackage: ServicePackage) => {
        set({ servicePackage });
      },

      toggleOption: (optionId: string) => {
        set((state) => {
          const exists = state.selectedOptionIds.includes(optionId);
          return {
            selectedOptionIds: exists
              ? state.selectedOptionIds.filter((id) => id !== optionId)
              : [...state.selectedOptionIds, optionId],
          };
        });
      },

      setExteriorPackage: (exteriorPackageId: string | null) => {
        set({ exteriorPackageId });
      },

      setGarageDoor: (garageDoorId: string | null) => {
        set({ garageDoorId });
      },

      setFeeToggles: (fees: { utility?: boolean; permits?: boolean }) => {
        set((state) => ({
          includeUtilityFees: fees.utility ?? state.includeUtilityFees,
          includePermitsCosts: fees.permits ?? state.includePermitsCosts,
        }));
      },

      // ═══════════════════════════════════════════════════════════════
      // BULK OPERATIONS
      // ═══════════════════════════════════════════════════════════════

      resetSelections: () => {
        set({
          ...defaultState,
          currentStep: 1,
          completedSteps: [],
        });
        // Also clear legacy keys
        try {
          localStorage.removeItem(LEGACY_BUILD_SELECTION_KEY);
          localStorage.removeItem(LEGACY_CONFIGURATOR_STATE_KEY);
          localStorage.removeItem(LEGACY_CONFIGURATOR_STEP_KEY);
        } catch {
          // Ignore localStorage errors
        }
      },

      hydrateFromLegacy: (): boolean => {
        try {
          // Check for old BuildSelection data
          const oldBuildSelection = localStorage.getItem(LEGACY_BUILD_SELECTION_KEY);
          if (oldBuildSelection) {
            const parsed = JSON.parse(oldBuildSelection);
            set((state) => ({
              ...state,
              modelSlug: parsed.modelSlug || null,
              exteriorPackageId: parsed.packageId || null,
              garageDoorId: parsed.garageDoorId || null,
              lotId: parsed.lotId?.toString() || null,
              developmentSlug: parsed.developmentSlug || null,
              flowType: parsed.developmentSlug ? 'communities' : 'direct',
            }));
            localStorage.removeItem(LEGACY_BUILD_SELECTION_KEY);
            return true;
          }

          // Check for old Configurator state
          const oldConfiguratorState = localStorage.getItem(LEGACY_CONFIGURATOR_STATE_KEY);
          if (oldConfiguratorState) {
            const parsed = JSON.parse(oldConfiguratorState);
            set((state) => ({
              ...state,
              intent: parsed.intent || null,
              modelSlug: parsed.modelSlug || null,
              buildType: parsed.buildType || null,
              servicePackage: parsed.servicePackage || 'delivered_installed',
              exteriorPackageId: parsed.packageId || null,
              garageDoorId: parsed.garageDoorId || null,
              location: {
                zipCode: parsed.zipCode || '',
                address: parsed.address || '',
                known: parsed.locationKnown ?? null,
              },
              includeUtilityFees: parsed.includeUtilityFees ?? true,
              includePermitsCosts: parsed.includePermitsCosts ?? true,
            }));
            localStorage.removeItem(LEGACY_CONFIGURATOR_STATE_KEY);
            localStorage.removeItem(LEGACY_CONFIGURATOR_STEP_KEY);
            return true;
          }

          return false;
        } catch (e) {
          console.warn('Failed to hydrate from legacy storage:', e);
          return false;
        }
      },

      // ═══════════════════════════════════════════════════════════════
      // COMPUTED HELPERS
      // ═══════════════════════════════════════════════════════════════

      getPricingMode: (): PricingMode => {
        const { flowType, lotId, servicePackage, intent } = get();

        // User explicitly chose community all-in (requires lot)
        if (servicePackage === 'community_all_in' && lotId) {
          return 'community_all_in';
        }

        // Community flow with lot selected = all-in pricing
        if (flowType === 'communities' && lotId) {
          return 'community_all_in';
        }

        // Direct flow with basemod-community intent and lot = all-in
        if (intent === 'basemod-community' && lotId) {
          return 'community_all_in';
        }

        // User chose supply only
        if (servicePackage === 'supply_only') {
          return 'supply_only';
        }

        // Default to delivered & installed
        return 'delivered_installed';
      },

      getShareableUrl: (): string => {
        const state = get();
        const params = new URLSearchParams();

        if (state.modelSlug) params.set('model', state.modelSlug);
        if (state.buildType) params.set('type', state.buildType);
        if (state.exteriorPackageId) params.set('package', state.exteriorPackageId);
        if (state.garageDoorId) params.set('garage', state.garageDoorId);
        if (state.lotId) params.set('lot', state.lotId);
        if (state.location.zipCode) params.set('zip', state.location.zipCode);

        const base = window.location.origin;
        const path =
          state.flowType === 'communities' && state.developmentSlug
            ? `/developments/${state.developmentSlug}/build`
            : '/build';

        const queryString = params.toString();
        return queryString ? `${base}${path}?${queryString}` : `${base}${path}`;
      },

      getQuotePayload: (): QuoteInsertPayload => {
        const state = get();
        return {
          development_id: state.flowType === 'communities' ? state.developmentSlug : null,
          lot_id: state.lotId,
          model_id: state.modelId,
          build_type: state.buildType,
          foundation_type: state.foundationType,
          service_package: state.servicePackage,
          exterior_package_id: state.exteriorPackageId,
          garage_door_id: state.garageDoorId,
          selected_options: state.selectedOptionIds,
          include_permits_costs: state.includePermitsCosts,
          include_utility_fees: state.includeUtilityFees,
          zip_code: state.location.zipCode || null,
          address: state.location.address || null,
          total_estimate: null, // Calculated separately
        };
      },

      hasSelections: (): boolean => {
        const state = get();
        return !!(
          state.modelSlug ||
          state.lotId ||
          state.exteriorPackageId ||
          state.buildType
        );
      },
    }),
    {
      name: 'basemod-configurator-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist user selections
        flowType: state.flowType,
        developmentSlug: state.developmentSlug,
        intent: state.intent,
        location: state.location,
        lotId: state.lotId,
        modelId: state.modelId,
        modelSlug: state.modelSlug,
        buildType: state.buildType,
        foundationType: state.foundationType,
        servicePackage: state.servicePackage,
        selectedOptionIds: state.selectedOptionIds,
        exteriorPackageId: state.exteriorPackageId,
        garageDoorId: state.garageDoorId,
        includeUtilityFees: state.includeUtilityFees,
        includePermitsCosts: state.includePermitsCosts,
        // NEVER persist step progress - always start fresh
        // currentStep and completedSteps are intentionally excluded
      }),
    }
  )
);

// Reset step tracking after rehydration - zustand persist will call this
// We use subscribe to detect when state has been rehydrated
const unsubHydrate = useConfiguratorStore.persist.onFinishHydration((state) => {
  // Always reset step tracking on page load
  useConfiguratorStore.setState({
    currentStep: 1,
    completedSteps: [],
  });
});

// ============================================================================
// Convenience Selectors
// ============================================================================

export const selectFlowType = (state: ConfiguratorStore) => state.flowType;
export const selectDevelopmentSlug = (state: ConfiguratorStore) => state.developmentSlug;
export const selectCurrentStep = (state: ConfiguratorStore) => state.currentStep;
export const selectModelSlug = (state: ConfiguratorStore) => state.modelSlug;
export const selectModelId = (state: ConfiguratorStore) => state.modelId;
export const selectBuildType = (state: ConfiguratorStore) => state.buildType;
export const selectLotId = (state: ConfiguratorStore) => state.lotId;
export const selectExteriorPackageId = (state: ConfiguratorStore) => state.exteriorPackageId;
export const selectGarageDoorId = (state: ConfiguratorStore) => state.garageDoorId;
export const selectServicePackage = (state: ConfiguratorStore) => state.servicePackage;
export const selectLocation = (state: ConfiguratorStore) => state.location;
export const selectIntent = (state: ConfiguratorStore) => state.intent;

export default useConfiguratorStore;
