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
