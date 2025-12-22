import { PRESETS_KEY } from "./constants";

export function loadPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function savePresets(presets) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function normalizeFiltersForCompare(filtersLikeState) {
  const asPreset = stateToPresetFilters(filtersLikeState);

  return {
    ...asPreset,
    positions: [...(asPreset.positions || [])].sort(),
  };
}

export function arePresetFiltersEqual(state, presetFilters) {
  if (!presetFilters) return false;

  const normalizedState = normalizeFiltersForCompare(state);
  const normalizedPreset = normalizeFiltersForCompare(
    presetFiltersToState(presetFilters)
  );

  if (normalizedState.positions.length !== normalizedPreset.positions.length)
    return false;

  for (let i = 0; i < normalizedState.positions.length; i++) {
    if (normalizedState.positions[i] !== normalizedPreset.positions[i]) {
      return false;
    }
  }

  return (
    normalizedState.matchAllPositions === normalizedPreset.matchAllPositions &&
    normalizedState.ageMin === normalizedPreset.ageMin &&
    normalizedState.ageMax === normalizedPreset.ageMax &&
    normalizedState.valueMin === normalizedPreset.valueMin &&
    normalizedState.valueMax === normalizedPreset.valueMax &&
    normalizedState.priceMin === normalizedPreset.priceMin &&
    normalizedState.priceMax === normalizedPreset.priceMax &&
    normalizedState.onlyTransfer === normalizedPreset.onlyTransfer &&
    normalizedState.onlyUnneeded === normalizedPreset.onlyUnneeded
  );
}

export function stateToPresetFilters(state) {
  return {
    positions: Array.from(state.positions),
    matchAllPositions: !!state.matchAllPositions,
    ageMin: Number(state.ageMin ?? 16),
    ageMax: Number(state.ageMax ?? 40),
    valueMin: Number(state.valueMin ?? 0),
    valueMax: Number(state.valueMax ?? 99000000),
    priceMin: Number(state.priceMin ?? 0),
    priceMax: Number(state.priceMax ?? 99000000),
    onlyTransfer: !!state.onlyTransfer,
    onlyUnneeded: !!state.onlyUnneeded,
  };
}

export function presetFiltersToState(filters) {
  return {
    positions: new Set(filters?.positions || []),
    matchAllPositions: !!filters?.matchAllPositions,
    ageMin: Number(filters?.ageMin ?? 16),
    ageMax: Number(filters?.ageMax ?? 40),
    valueMin: Number(filters?.valueMin ?? 0),
    valueMax: Number(filters?.valueMax ?? 99000000),
    priceMin: Number(filters?.priceMin ?? 0),
    priceMax: Number(filters?.priceMax ?? 99000000),
    onlyTransfer: !!filters?.onlyTransfer,
    onlyUnneeded: !!filters?.onlyUnneeded,
  };
}
