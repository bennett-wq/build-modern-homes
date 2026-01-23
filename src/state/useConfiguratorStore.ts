import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================================
// Configurator Store - Single source of truth for wizard configuration state
// ============================================================================

// Type definitions
type BuildIntent = 'my-land' | 'find-land' | 'basemod-community';

type BuildType = 'xmod' | 'mod';

type ServicePackage = 'delivered_installed' | 'supply_only' | 'community_all_in';

type ExteriorSelection = {
  packageId: string | null;
  garageDoorId: string | null;
};

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

// Create the store with persistence
export const useConfiguratorStore = create<ConfiguratorState & ConfiguratorActions>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step].sort((a, b) => a - b),
        })),

      setIntent: (intent) => set({ intent }),

      setLocationZip: (zip) =>
        set((state) => ({
          location: { ...state.location, zipCode: zip },
        })),

      setLocationAddress: (address) =>
        set((state) => ({
          location: { ...state.location, address },
        })),

      setLocationKnown: (known) =>
        set((state) => ({
          location: { ...state.location, known },
        })),

      setModelSlug: (slug) => set({ modelSlug: slug }),

      setBuildType: (type) => set({ buildType: type }),

      setServicePackage: (pkg) => set({ servicePackage: pkg }),

      setExterior: (updates) =>
        set((state) => ({
          exterior: { ...state.exterior, ...updates },
        })),

      setLotId: (lotId) => set({ lotId }),

      setDevelopmentSlug: (slug) => set({ developmentSlug: slug }),

      resetBuild: () => set(initialState),
    }),
    {
      name: 'basemod-configurator-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        intent: state.intent,
        location: state.location,
        modelSlug: state.modelSlug,
        buildType: state.buildType,
        servicePackage: state.servicePackage,
        exterior: state.exterior,
        lotId: state.lotId,
        developmentSlug: state.developmentSlug,
      }),
      onRehydrateStorage: () => (state) => {
        // Never persist UI step progress
        if (state) {
          state.currentStep = 1;
          state.completedSteps = [];
        }
      },
      version: 1,
    }
  )
);

// Export types for consumers
export type {
  BuildIntent,
  BuildType,
  ServicePackage,
  ExteriorSelection,
  ConfiguratorState,
  ConfiguratorActions,
};
