import { defaultState } from "./constants";

function parseNumberLikePefl(str) {
  if (!str) return 0;
  const n = Number(String(str).replaceAll(",", "").replaceAll(" ", ""));
  return Number.isFinite(n) ? n : 0;
}

function normalizePositions(posStr) {
  if (!posStr) return new Set();
  const s = posStr.trim().toUpperCase();
  if (s === "GK") return new Set(["GK"]);

  const [sidesRaw, rolesRaw] = s.split(/\s+/, 2);
  if (!rolesRaw) return new Set();

  const sides = sidesRaw;
  const roles = rolesRaw.split("/");

  const hasL = sides.includes("L");
  const hasR = sides.includes("R");
  const hasC = sides.includes("C");

  const out = new Set();

  for (const role of roles) {
    if (role === "DF") {
      if (hasL) out.add("LD");
      if (hasC) out.add("CD");
      if (hasR) out.add("RD");
    } else if (role === "DM") {
      if (hasL) out.add("LDM");
      if (hasC) out.add("CDM");
      if (hasR) out.add("RDM");
    } else if (role === "MF" || role === "M") {
      if (hasL) out.add("LM");
      if (hasC) out.add("CM");
      if (hasR) out.add("RM");
    } else if (role === "AM") {
      if (hasL) out.add("LAM");
      if (hasC) out.add("CAM");
      if (hasR) out.add("RAM");
    } else if (role === "FW") {
      out.add("CFW");
    } else if (role === "SW") {
      out.add("SW");
    }
  }

  return out;
}

function rowToData(tr) {
  const cell = (key) => tr.querySelector(`td[aria-describedby="list_${key}"]`);
  const nameCell = cell("name");

  const rowId = tr.id ? String(tr.id) : "";
  const age = parseInt(cell("age")?.textContent?.trim() || "0", 10);
  const position = cell("position")?.textContent?.trim() || "";
  const value = parseNumberLikePefl(cell("value")?.textContent?.trim() || "");
  const price = parseNumberLikePefl(
    cell("wantprice")?.textContent?.trim() || ""
  );

  // На трансфере: у тебя есть <img src=".../sale.png">
  const isOnTransfer = !!nameCell?.querySelector(
    'img[src*="system/img/g/sale.png"]'
  );

  // Ненужные: пока заглушка. Подправим, когда увидим иконку.
  const isUnneeded = !!nameCell?.querySelector(
    'img[src*="system/img/g/nn.png"]'
  );

  return {
    rowId,
    age,
    position,
    posSet: normalizePositions(position),
    value,
    price,
    isOnTransfer,
    isUnneeded,
  };
}

function rowMatchesFilters(data, f) {
  if (data.age < f.ageMin || data.age > f.ageMax) return false;
  if (data.value < f.valueMin || data.value > f.valueMax) return false;
  if (data.price < f.priceMin || data.price > f.priceMax) return false;
  if (f.onlyTransfer && !data.isOnTransfer) return false;
  if (f.onlyUnneeded && !data.isUnneeded) return false;

  if (f.positions.size > 0) {
    if (f.matchAllPositions) {
      for (const need of f.positions) {
        if (!data.posSet.has(need)) return false;
      }
    } else {
      let ok = false;
      for (const need of f.positions) {
        if (data.posSet.has(need)) {
          ok = true;
          break;
        }
      }
      if (!ok) return false;
    }
  }

  return true;
}

export function isDefaultFilters(state) {
  console.log(state);
  console.log(defaultState);
  const d = defaultState;

  const posSize = state?.positions instanceof Set ? state.positions.size : 0;
  const dPosSize = d?.positions instanceof Set ? d.positions.size : 0;
  if (posSize !== dPosSize) return false;

  if (posSize > 0) {
    for (const p of state.positions) {
      if (!d.positions.has(p)) return false;
    }
  }

  return (
    !!state.matchAllPositions === !!d.matchAllPositions &&
    Number(state.ageMin) === Number(d.ageMin) &&
    Number(state.ageMax) === Number(d.ageMax) &&
    Number(state.valueMin) === Number(d.valueMin) &&
    Number(state.valueMax) === Number(d.valueMax) &&
    Number(state.priceMin) === Number(d.priceMin) &&
    Number(state.priceMax) === Number(d.priceMax) &&
    !!state.onlyTransfer === !!d.onlyTransfer &&
    !!state.onlyUnneeded === !!d.onlyUnneeded
  );
}

export function applyFiltersToExistingTable(filters) {
  const rows = document.querySelectorAll('tr.jqgrow[role="row"]');
  let shown = 0;

  rows.forEach((tr) => {
    const data = rowToData(tr);
    const ok = rowMatchesFilters(data, filters);
    tr.style.display = ok ? "" : "none";
    if (ok) shown++;
  });

  // если хочешь, можно где-то показать счётчик
  console.log(`[EXT] shown ${shown}/${rows.length}`);
}
