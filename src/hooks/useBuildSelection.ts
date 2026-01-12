// BuildSelection state management hook
// Persists to URL params and localStorage for shareable links and return visits

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface BuildSelection {
  developmentSlug: string;
  lotId: number | null;
  modelSlug: string | null;
  packageId: string | null;
  garageDoorId: string | null;
}

const STORAGE_KEY = 'basemod-build-selection';

interface UseBuildSelectionOptions {
  developmentSlug: string;
}

export function useBuildSelection({ developmentSlug }: UseBuildSelectionOptions) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize from URL params first, then localStorage
  const initialSelection = useMemo((): BuildSelection => {
    const lotParam = searchParams.get('lot');
    const modelParam = searchParams.get('model');
    const packageParam = searchParams.get('package');
    const garageParam = searchParams.get('garage');

    // Check localStorage for existing selection
    const stored = localStorage.getItem(STORAGE_KEY);
    let storedSelection: Partial<BuildSelection> = {};
    if (stored) {
      try {
        storedSelection = JSON.parse(stored);
      } catch {
        // Invalid JSON, ignore
      }
    }

    // URL params take priority over localStorage
    return {
      developmentSlug,
      lotId: lotParam ? parseInt(lotParam, 10) : (storedSelection.lotId ?? null),
      modelSlug: modelParam || storedSelection.modelSlug || null,
      packageId: packageParam || storedSelection.packageId || null,
      garageDoorId: garageParam || storedSelection.garageDoorId || null,
    };
  }, [developmentSlug, searchParams]);

  const [selection, setSelectionState] = useState<BuildSelection>(initialSelection);

  // Sync to localStorage and URL when selection changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));

    // Update URL params
    const newParams = new URLSearchParams();
    if (selection.lotId !== null) newParams.set('lot', selection.lotId.toString());
    if (selection.modelSlug) newParams.set('model', selection.modelSlug);
    if (selection.packageId) newParams.set('package', selection.packageId);
    if (selection.garageDoorId) newParams.set('garage', selection.garageDoorId);

    setSearchParams(newParams, { replace: true });
  }, [selection, setSearchParams]);

  const setLot = useCallback((lotId: number | null) => {
    setSelectionState(prev => ({ ...prev, lotId }));
  }, []);

  const setModel = useCallback((modelSlug: string | null) => {
    setSelectionState(prev => ({ ...prev, modelSlug }));
  }, []);

  const setPackage = useCallback((packageId: string | null) => {
    setSelectionState(prev => ({ ...prev, packageId }));
  }, []);

  const setGarageDoor = useCallback((garageDoorId: string | null) => {
    setSelectionState(prev => ({ ...prev, garageDoorId }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState({
      developmentSlug,
      lotId: null,
      modelSlug: null,
      packageId: null,
      garageDoorId: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  }, [developmentSlug]);

  const getShareableUrl = useCallback(() => {
    const base = window.location.origin;
    const path = `/developments/${selection.developmentSlug}/build`;
    const params = new URLSearchParams();
    if (selection.lotId !== null) params.set('lot', selection.lotId.toString());
    if (selection.modelSlug) params.set('model', selection.modelSlug);
    if (selection.packageId) params.set('package', selection.packageId);
    if (selection.garageDoorId) params.set('garage', selection.garageDoorId);
    const queryString = params.toString();
    return queryString ? `${base}${path}?${queryString}` : `${base}${path}`;
  }, [selection]);

  const getContactUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('development', selection.developmentSlug);
    if (selection.lotId !== null) params.set('lot', selection.lotId.toString());
    if (selection.modelSlug) params.set('model', selection.modelSlug);
    if (selection.packageId) params.set('package', selection.packageId);
    if (selection.garageDoorId) params.set('garage', selection.garageDoorId);
    return `/contact?${params.toString()}`;
  }, [selection]);

  const isComplete = useMemo(() => {
    return (
      selection.lotId !== null &&
      selection.modelSlug !== null &&
      selection.packageId !== null &&
      selection.garageDoorId !== null
    );
  }, [selection]);

  return {
    selection,
    setLot,
    setModel,
    setPackage,
    setGarageDoor,
    clearSelection,
    getShareableUrl,
    getContactUrl,
    isComplete,
  };
}
