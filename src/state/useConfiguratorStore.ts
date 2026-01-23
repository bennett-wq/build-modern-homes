import { create } from 'zustand';

// ============================================================================
// Configurator Store - Single source of truth for wizard configuration state
// ============================================================================

// Type definitions (standalone, no external imports needed)
type BuildIntent = 'my-land' | 'find-land' | 'basemod-community';

type BuildType = 'xmod' | 'mod';

type ServicePackage = 'delivered_installed' | 'supply_only' | 'community_all_in';

interface ExteriorSelection {
  packageId: string | null;
  garageDoorId: string | null;
}

// State interface
interface ConfiguratorState {
  currentStep: number;
  completedSteps: number[];
  intent: BuildIntent | null;
  location: { zipCode: string; address: string; known: boolean | null };
  modelSlug: string | null;
  buildType: BuildType | null;
  servicePackage: ServicePackage;
  exterior: ExteriorSelection;
  lotId: number | null;
  developmentSlug: string | null;
}

// Actions interface
interface ConfiguratorActions {
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  setIntent: (intent: BuildIntent | null) => void;
  setLocationZip: (zip: string) => void;
  setLocationAddress: (address: string) => void;
  setLocationKnown: (known: boolean | null) => void;
  setModelSlug: (slug: string | null) => void;
  setBuildType: (type: BuildType | null) => void;
  setServicePackage: (pkg: ServicePackage) => void;
  setExterior: (updates: Partial<ExteriorSelection>) => void;
  setLotId: (lotId: number | null) => void;
  setDevelopmentSlug: (slug: string | null) => void;
  resetBuild: () => void;
}

// Initial state
const initialState: ConfiguratorState = {
  currentStep: 1,
  completedSteps: [],
  intent: null,
  location: { zipCode: '', address: '', known: null },
  modelSlug: null,
  buildType: null,
  servicePackage: 'delivered_installed',
  exterior: { packageId: null, garageDoorId: null },
  lotId: null,
  developmentSlug: null,
};

// Create the store with proper typing
export const useConfiguratorStore = create<ConfiguratorState & ConfiguratorActions>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setCurrentStep: (step: number) => set({ currentStep: step }),

  markStepComplete: (step: number) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step].sort((a, b) => a - b),
    })),

  setIntent: (intent: BuildIntent | null) => set({ intent }),

  setLocationZip: (zip: string) =>
    set((state) => ({
      location: { ...state.location, zipCode: zip },
    })),

  setLocationAddress: (address: string) =>
    set((state) => ({
      location: { ...state.location, address },
    })),

  setLocationKnown: (known: boolean | null) =>
    set((state) => ({
      location: { ...state.location, known },
    })),

  setModelSlug: (slug: string | null) => set({ modelSlug: slug }),

  setBuildType: (type: BuildType | null) => set({ buildType: type }),

  setServicePackage: (pkg: ServicePackage) => set({ servicePackage: pkg }),

  setExterior: (updates: Partial<ExteriorSelection>) =>
    set((state) => ({
      exterior: { ...state.exterior, ...updates },
    })),

  setLotId: (lotId: number | null) => set({ lotId }),

  setDevelopmentSlug: (slug: string | null) => set({ developmentSlug: slug }),

  resetBuild: () => set(initialState),
}));

// Export types for consumers
export type { BuildIntent, BuildType, ServicePackage, ExteriorSelection, ConfiguratorState, ConfiguratorActions };
