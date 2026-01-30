// BuildSelection state management hook
// Persists to URL params and localStorage for shareable links and return visits

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { normalizeModelSlug } from '@/data/hawthorne-exteriors';
import type { BuildType } from '@/data/pricing-config';

export interface BuildSelection {
  developmentSlug: string;
  lotId: number | null;
  modelSlug: string | null;
  buildType: BuildType | null;
  packageId: string | null;
  garageDoorId: string | null;
}

const STORAGE_KEY = 'basemod-build-selection';

interface UseBuildSelectionOptions {
  developmentSlug: string;
}

export function useBuildSelection({ developmentSlug }: UseBuildSelectionOptions) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [justSaved, setJustSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from URL params first, then localStorage
  const initialSelection = useMemo((): BuildSelection => {
    const lotParam = searchParams.get('lot');
    const modelParam = searchParams.get('model');
    const buildTypeParam = searchParams.get('buildType');
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
    // Normalize model slugs for backward compatibility (hawthorn → hawthorne)
    const rawModelSlug = modelParam || storedSelection.modelSlug || null;
    const rawBuildType = buildTypeParam || storedSelection.buildType || null;
    return {
      developmentSlug,
      lotId: lotParam ? parseInt(lotParam, 10) : (storedSelection.lotId ?? null),
      modelSlug: normalizeModelSlug(rawModelSlug),
      buildType: (rawBuildType === 'xmod' || rawBuildType === 'mod') ? rawBuildType : null,
      packageId: packageParam || storedSelection.packageId || null,
      garageDoorId: garageParam || storedSelection.garageDoorId || null,
    };
  }, [developmentSlug, searchParams]);

  const [selection, setSelectionState] = useState<BuildSelection>(initialSelection);

  // Show "Saved" indicator when selection changes
  const triggerSaveIndicator = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setJustSaved(true);
    saveTimeoutRef.current = setTimeout(() => {
      setJustSaved(false);
    }, 1500);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Sync to localStorage and URL when selection changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));

    // Update URL params
    const newParams = new URLSearchParams();
    if (selection.lotId !== null) newParams.set('lot', selection.lotId.toString());
    if (selection.modelSlug) newParams.set('model', selection.modelSlug);
    if (selection.buildType) newParams.set('buildType', selection.buildType);
    if (selection.packageId) newParams.set('package', selection.packageId);
    if (selection.garageDoorId) newParams.set('garage', selection.garageDoorId);

    setSearchParams(newParams, { replace: true });
  }, [selection, setSearchParams]);

  const setLot = useCallback((lotId: number | null) => {
    setSelectionState(prev => ({ ...prev, lotId }));
    triggerSaveIndicator();
  }, [triggerSaveIndicator]);

  const setModel = useCallback((modelSlug: string | null) => {
    // Always normalize model slugs (hawthorn → hawthorne)
    const normalized = normalizeModelSlug(modelSlug);
    // Reset buildType when model changes (different models have different build types)
    setSelectionState(prev => ({ ...prev, modelSlug: normalized, buildType: null }));
    triggerSaveIndicator();
  }, [triggerSaveIndicator]);

  const setBuildType = useCallback((buildType: BuildType | null) => {
    setSelectionState(prev => ({ ...prev, buildType }));
    triggerSaveIndicator();
  }, [triggerSaveIndicator]);

  const setPackage = useCallback((packageId: string | null) => {
    setSelectionState(prev => ({ ...prev, packageId }));
    triggerSaveIndicator();
  }, [triggerSaveIndicator]);

  const setGarageDoor = useCallback((garageDoorId: string | null) => {
    setSelectionState(prev => ({ ...prev, garageDoorId }));
    triggerSaveIndicator();
  }, [triggerSaveIndicator]);

  const clearSelection = useCallback(() => {
    setSelectionState({
      developmentSlug,
      lotId: null,
      modelSlug: null,
      buildType: null,
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
    if (selection.buildType) params.set('buildType', selection.buildType);
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
    if (selection.buildType) params.set('buildType', selection.buildType);
    if (selection.packageId) params.set('package', selection.packageId);
    if (selection.garageDoorId) params.set('garage', selection.garageDoorId);
    return `/contact?${params.toString()}`;
  }, [selection]);

  const isComplete = useMemo(() => {
    return (
      selection.lotId !== null &&
      selection.modelSlug !== null &&
      selection.buildType !== null &&
      selection.packageId !== null &&
      selection.garageDoorId !== null
    );
  }, [selection]);

  return {
    selection,
    setLot,
    setModel,
    setBuildType,
    setPackage,
    setGarageDoor,
    clearSelection,
    getShareableUrl,
    getContactUrl,
    isComplete,
    justSaved,
  };
}
