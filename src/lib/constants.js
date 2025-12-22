export const defaultState = {
  positions: new Set(),
  matchAllPositions: false,
  ageMin: 16,
  ageMax: 40,
  valueMin: 0,
  valueMax: 99000000,
  priceMin: 0,
  priceMax: 99000000,
  onlyTransfer: false,
  onlyUnneeded: false,
  activePresetId: "",
  activePresetName: "",
};

export const POS_GRID = [
  ["CFW"],
  ["LAM", "CAM", "RAM"],
  ["LM", "CM", "RM"],
  ["LDM", "CDM", "RDM"],
  ["LD", "CD", "RD"],
  ["SW"],
  ["GK"],
];

export const PRESETS_KEY = "pefl-ext:presets";
