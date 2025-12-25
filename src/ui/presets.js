import { loadPresets } from "../lib/presets";
import { escapeHtml } from "../lib/helpers";

export function renderPresetsUI(panel, state) {
  const presets = loadPresets().filter((p) => p && p.id && p.name && p.filters);
  const list = panel.querySelector("#presetsList");
  if (!list) return;

  if (!presets.length) {
    list.innerHTML = `<div style="font:12px/1.2 system-ui; opacity:.75;">Нет пресетов</div>`;
    return;
  }

  list.innerHTML = presets
    .map((p) => {
      const isActive = state?.activePresetId && state.activePresetId === p.id;

      return `
        <div data-preset-id="${escapeHtml(p.id)}" style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:10px;
          padding:6px 8px;
          border:1px solid rgba(0,0,0,.2);
          border-radius:10px;
          background: rgba(255,255,255,.7);
          font: 12px/1.2 system-ui;
        ">
          <div style="display:flex; flex-direction:column; gap:2px;">
            <div style="font-weight:700;">${escapeHtml(p.name)}</div>
          </div>

          <div style="display:flex; gap:8px; align-items:center;">
            <button type="button" data-action="${
              isActive ? "clear" : "apply"
            }" style="
              padding:3px 8px; font:12px/1.2 system-ui;
              border:1px solid #888; border-radius:8px; background:#fff; cursor:pointer;
            ">${isActive ? "Снять пресет" : "Применить"}</button>

            <button type="button" data-action="del" style="
              padding:3px 8px; font:12px/1.2 system-ui;
              border:1px solid #c55; border-radius:8px; background:#fff; cursor:pointer;
            ">Удалить</button>
          </div>
        </div>
      `;
    })
    .join("");
}
