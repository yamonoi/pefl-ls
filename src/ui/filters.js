import { v4 as uuid } from "uuid";

import { defaultState, POS_GRID } from "../lib/constants";
import {
  loadPresets,
  savePresets,
  stateToPresetFilters,
  presetFiltersToState,
} from "../lib/presets";
import { isDefaultFilters } from "../lib/filters";
import { renderPresetsUI } from "./presets";

export function renderFiltersUI(panel, state, onChange, getState) {
  panel.innerHTML = `
    <details id="pefl-ext-details" style="
        margin:8px 0; padding: 14px;
        border:1px solid #7aa;
        border-radius:10px;"
    >
      <summary style="
        cursor:pointer;
        user-select:none;
        font: 14px/1.2 system-ui;
        font-weight:700;
        display:flex;
        align-items:center;
        justify-content:space-between;
        max-width: 720px;
      ">
        <span>Фильтры</span>
        <span id="pefl-ext-arrow" aria-hidden="true" style="
          width:22px;
          height:22px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          border:1px solid rgba(0,0,0,.25);
          border-radius:8px;
          background:rgba(255,255,255,.55);
        ">
          <svg viewBox="0 0 24 24" width="16" height="16" style="display:block">
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </summary>

      <div style="
        display: flex;
        max-width: 720px;
        border-top:1px solid rgba(0,0,0,.15);
        margin-top: 10px;
        padding: 10px 0;
      ">
        <div>
          <div style="font: 12px/1.2 system-ui; font-weight:700; margin-bottom:8px;">
            Позиция
          </div>

          <div
            style="
              display: grid;
              row-gap: 6px;
              justify-content: flex-start;
              margin: 0 0 0 -4px;
              width: 360px;
              font: 12px/1.2 system-ui;
            "
          >
            ${POS_GRID.map(
              (row) => `
                <div
                  style="
                    display: flex;
                    gap: 14px;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  ${row
                    .map(
                      (code) => `
                        <label
                          style="
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                            min-width: 72px;
                            cursor: pointer
                          "
                        >
                          <input type="checkbox" data-pos="${code}" style="cursor: pointer" />
                          <span>${code}</span>
                        </label>
                      `
                    )
                    .join("")}
                </div>
              `
            ).join("")}
          </div>

          <div style="margin: 8px 0 0 -4px; font: 12px/1.2 system-ui; display: flex; justify-self: flex-start;">
            <label style="display:flex; gap:8px; align-items:center; cursor: pointer">
              <input id="matchAllPos" type="checkbox" style="cursor: pointer" />
              <span>искать игроков со всеми отмеченными позициями</span>
            </label>
          </div>
        </div>

        <div style="display: flex; flex-direction: column;">
          <div style="font: 12px/1.2 system-ui; font-weight:700; margin-bottom:8px;">
            Параметры
          </div>
          <div style="
              display: grid;
              row-gap: 10px;
              justify-content: flex-start;
              margin: 0;
              width: 360px;
              font: 12px/1.2 system-ui;
            ">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span>Возраст</span>
              <span>от</span>
              <input id="ageMin" type="number" />
              <span>до</span>
              <input id="ageMax" type="number" />
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span>Номинал</span>
              <span>от</span>
              <input id="valMin" type="number" />
              <span>до</span>
              <input id="valMax" type="number" />
            </div>

            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
              <span>Цена</span>
              <span>от</span>
              <input id="priceMin" type="number" />
              <span>до</span>
              <input id="priceMax" type="number" />
            </div>

            <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-top:2px; margin-left: -4px;">
              <label style="display:flex; gap:6px; align-items:center; cursor: pointer">
                <input id="onlyTransfer" type="checkbox" style="cursor: pointer" />
                <span>на трансфере</span>
              </label>

              <label style="display:flex; gap:6px; align-items:center; cursor: pointer">
                <input id="onlyUnneeded" type="checkbox" style="cursor: pointer" />
                <span>ненужные</span>
              </label>
            </div>
          </div>
          <button id="resetBtn" type="button" style="
            display: flex;
            align-self: flex-end;
            padding:4px 10px;
            font: 12px/1.2 system-ui;
            border:1px solid #888;
            border-radius:8px;
            background:#fff;
            cursor:pointer;
            margin-top: auto;
          ">Сбросить</button>
        </div>
      </div>

      <!-- Presets -->
      <div>
        <div style="border-top:1px solid rgba(0,0,0,.15); padding-top:10px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div style="font: 12px/1.2 system-ui; font-weight:700;">
              Пресеты
            </div>

            <button id="createPresetBtn" type="button" style="
              padding:4px 10px;
              font: 12px/1.2 system-ui;
              border:1px solid #888;
              border-radius:8px;
              background:#fff;
              cursor:pointer;
            ">Создать пресет</button>
          </div>

          <div id="presetsList" style="margin-top:8px; display:grid; gap:6px;"></div>
        </div>

        <style>
          #pefl-ext-arrow { transition: transform 140ms ease; }
          #pefl-ext-details[open] > summary #pefl-ext-arrow { transform: rotate(180deg); }
          #pefl-ext-details > summary:hover #pefl-ext-arrow { background: rgba(255,255,255,.8); }

          #pefl-ext-details input[type="checkbox"]{ width:14px; height:14px; }

          #pefl-ext-details input[type="number"]{
            width:90px;
            padding:3px 6px;
            font:12px/1.2 system-ui;
            border:1px solid #888;
            border-radius:8px;
            background:#fff;
            -moz-appearance: textfield;
            appearance: textfield;
          }

          #pefl-ext-details input[type="number"]::-webkit-inner-spin-button,
          #pefl-ext-details input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }

          #pefl-ext-details summary::-webkit-details-marker { display:none; }

          #createPresetBtn:disabled{
            opacity:.5;
            cursor:not-allowed;
          }
        </style>
      </div>
    </details>
  `;

  // init values
  panel.querySelectorAll('input[type="checkbox"][data-pos]').forEach((cb) => {
    cb.checked = state.positions.has(cb.dataset.pos);
  });

  panel.querySelector("#matchAllPos").checked = state.matchAllPositions;
  panel.querySelector("#ageMin").value = state.ageMin;
  panel.querySelector("#ageMax").value = state.ageMax;
  panel.querySelector("#valMin").value = state.valueMin;
  panel.querySelector("#valMax").value = state.valueMax;
  panel.querySelector("#priceMin").value = state.priceMin;
  panel.querySelector("#priceMax").value = state.priceMax;
  panel.querySelector("#onlyTransfer").checked = state.onlyTransfer;
  panel.querySelector("#onlyUnneeded").checked = state.onlyUnneeded;

  // disable Create Preset if filters == default
  const createBtn = panel.querySelector("#createPresetBtn");
  createBtn.disabled = isDefaultFilters(state);

  // render presets list (needs state to render apply/clear)
  renderPresetsUI(panel, state);

  const emit = () => {
    const positions = new Set(
      [...panel.querySelectorAll('input[type="checkbox"][data-pos]')]
        .filter((x) => x.checked)
        .map((x) => x.dataset.pos)
    );
    const nextState = {
      positions,
      matchAllPositions: !!panel.querySelector("#matchAllPos").checked,
      ageMin: parseInt(panel.querySelector("#ageMin").value || "16", 10),
      ageMax: parseInt(panel.querySelector("#ageMax").value || "40", 10),
      valueMin: parseInt(panel.querySelector("#valMin").value || "0", 10),
      valueMax: parseInt(
        panel.querySelector("#valMax").value || "99000000",
        10
      ),
      priceMin: parseInt(panel.querySelector("#priceMin").value || "0", 10),
      priceMax: parseInt(
        panel.querySelector("#priceMax").value || "99000000",
        10
      ),
      onlyTransfer: !!panel.querySelector("#onlyTransfer").checked,
      onlyUnneeded: !!panel.querySelector("#onlyUnneeded").checked,

      // активный пресет не затираем при ручных изменениях
      activePresetId: state.activePresetId,
      activePresetName: state.activePresetName,
    };

    onChange(nextState);

    const createBtn = panel.querySelector("#createPresetBtn");
    createBtn.disabled = isDefaultFilters(nextState);
  };

  panel.addEventListener("input", emit);
  panel.addEventListener("change", emit);

  panel.querySelector("#resetBtn").addEventListener("click", (e) => {
    e.preventDefault();

    const nextState = {
      ...defaultState,
      activePresetId: "",
      activePresetName: "",
    };
    onChange(nextState);

    renderFiltersUI(panel, nextState, onChange);
    const details = panel.querySelector("#pefl-ext-details");
    if (details) details.open = true;
  });

  panel.querySelector("#createPresetBtn")?.addEventListener("click", (e) => {
    e.preventDefault();

    const name = prompt("Название пресета:", "Мой пресет");
    if (!name) return;

    const presets = loadPresets();
    const currentState = getState();
    presets.unshift({
      id: uuid(),
      name: name.trim(),
      createdAt: Date.now(),
      filters: stateToPresetFilters(currentState),
    });
    savePresets(presets);

    const wasOpen = !!panel.querySelector("#pefl-ext-details")?.open;
    renderFiltersUI(panel, state, onChange);
    const details = panel.querySelector("#pefl-ext-details");
    if (details) details.open = wasOpen || true;
  });

  // presets list: apply / clear / delete
  panel.querySelector("#presetsList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const item = e.target.closest("[data-preset-id]");
    const presetId = item?.getAttribute("data-preset-id");
    if (!presetId) return;

    const action = btn.getAttribute("data-action");
    const presetsNow = loadPresets();
    const preset = presetsNow.find((x) => x.id === presetId);
    if (!preset) return;

    if (action === "apply") {
      const nextFilters = presetFiltersToState(preset.filters);

      const nextState = {
        ...state,
        ...nextFilters,
        activePresetId: preset.id,
        activePresetName: preset.name || "",
      };

      onChange(nextState);

      const wasOpen = !!panel.querySelector("#pefl-ext-details")?.open;
      renderFiltersUI(panel, nextState, onChange);
      const details = panel.querySelector("#pefl-ext-details");
      if (details) details.open = wasOpen || true;

      return;
    }

    if (action === "clear") {
      const nextState = { ...state, activePresetId: "", activePresetName: "" };
      onChange(nextState);

      const wasOpen = !!panel.querySelector("#pefl-ext-details")?.open;
      renderFiltersUI(panel, nextState, onChange);
      const details = panel.querySelector("#pefl-ext-details");
      if (details) details.open = wasOpen || true;

      return;
    }

    if (action === "del") {
      const nextPresets = presetsNow.filter((x) => x.id !== presetId);
      savePresets(nextPresets);

      const isActive = state.activePresetId === presetId;
      const nextState = isActive
        ? { ...state, activePresetId: "", activePresetName: "" }
        : state;
      if (isActive) onChange(nextState);

      const wasOpen = !!panel.querySelector("#pefl-ext-details")?.open;
      renderFiltersUI(panel, nextState, onChange);
      const details = panel.querySelector("#pefl-ext-details");
      if (details) details.open = wasOpen || true;
    }
  });
}
