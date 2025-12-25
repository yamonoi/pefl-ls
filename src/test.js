function parsePlayersFromGrid() {
  // jqGrid обычно рисует строки как tr.jqgrow
  const rows = document.querySelectorAll('tr.jqgrow[role="row"]');

  const players = [...rows].map((tr) => {
    const getCell = (key) =>
      tr.querySelector(`td[aria-describedby="list_${key}"]`);

    const nameCell = getCell("name");
    const nameLink = nameCell?.querySelector("a");

    const nationCell = getCell("nation");
    const nationImg = nationCell?.querySelector("img");

    const age = getCell("age")?.textContent?.trim() ?? "";
    const position = getCell("position")?.textContent?.trim() ?? "";
    const value = getCell("value")?.textContent?.trim() ?? "";
    const wantPrice = getCell("wantprice")?.textContent?.trim() ?? "";

    const clubCell = getCell("nameshort");
    const clubLink = clubCell?.querySelector("a");

    const pmCell = getCell("mid");
    const pmLink = pmCell?.querySelector("a");
    const saleIcon = nameCell?.querySelector('img[src*="sale"]'); // на трансфере
    const isOnTransfer = !!saleIcon;

    // "ненужные" — на PEFL обычно тоже иконкой. Я не знаю точный src,
    // поэтому сделаю эвристику: если найдём картинку с "un" / "need" / "trash" — true.
    // Потом ты просто подправишь селектор под реальный src.
    const isUnneeded = !!nameCell?.querySelector(
      'img[src*="un"], img[src*="need"], img[src*="trash"]'
    );

    return {
      id: tr.id,
      name: nameLink?.textContent?.trim() ?? "",
      playerUrl: nameLink?.href ?? "",
      nationFlagUrl: nationImg?.src ?? "",
      age,
      position,
      value,
      wantPrice,
      clubName: clubLink?.textContent?.trim() ?? "",
      clubUrl: clubLink?.href ?? "",
      pmUrl: pmLink?.href ?? "",
      isOnTransfer,
      isUnneeded,
    };
  });

  // иногда есть пустые строки — отфильтруем
  return players.filter((p) => p.id && p.name);
}

function renderPlayersTable(rootEl, players) {
  rootEl.innerHTML = `
    <div style="font-weight:700; margin-bottom:8px;">
      Игроки: ${players.length}
    </div>

    <div style="overflow:auto; border:1px solid #7aa; border-radius:10px; background:#fff;">
      <table style="width:100%; border-collapse:collapse; font: 13px system-ui;">
        <thead>
          <tr style="background:#f3fff3;">
            <th style="text-align:left; padding:8px; border-bottom:1px solid #cfd;">Имя</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #cfd;">Нац</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #cfd;">Возраст</th>
            <th style="text-align:center; padding:8px; border-bottom:1px solid #cfd;">Поз</th>
            <th style="text-align:right; padding:8px; border-bottom:1px solid #cfd;">Номинал</th>
            <th style="text-align:right; padding:8px; border-bottom:1px solid #cfd;">Цена</th>
            <th style="text-align:left; padding:8px; border-bottom:1px solid #cfd;">Клуб</th>
          </tr>
        </thead>
        <tbody>
          ${players
            .map(
              (p) => `
            <tr>
              <td style="padding:8px; border-bottom:1px solid #eee;">
                <a href="${
                  p.playerUrl
                }" target="_blank" rel="noreferrer">${escapeHtml(p.name)}</a>
              </td>
              <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">
                ${
                  p.nationFlagUrl
                    ? `<img src="${p.nationFlagUrl}" alt="" style="height:14px; vertical-align:middle;" />`
                    : ""
                }
              </td>
              <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">${escapeHtml(
                p.age
              )}</td>
              <td style="text-align:center; padding:8px; border-bottom:1px solid #eee;">${escapeHtml(
                p.position
              )}</td>
              <td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">${escapeHtml(
                p.value
              )}</td>
              <td style="text-align:right; padding:8px; border-bottom:1px solid #eee;">${escapeHtml(
                p.wantPrice
              )}</td>
              <td style="padding:8px; border-bottom:1px solid #eee;">
                ${
                  p.clubUrl
                    ? `<a href="${
                        p.clubUrl
                      }" target="_blank" rel="noreferrer">${escapeHtml(
                        p.clubName
                      )}</a>`
                    : escapeHtml(p.clubName)
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

const POS_GRID = [
  ["CFW"],
  ["LAM", "CAM", "RAM"],
  ["LM", "CM", "RM"],
  ["LDM", "CDM", "RDM"],
  ["LD", "CD", "RD"],
  ["SW"],
  ["GK"],
];

// Превращаем строку позиций из PEFL вида "LR DF/DM" в набор "LD, RD, LDM, RDM, ..."
function normalizePositions(posStr) {
  if (!posStr) return new Set();

  const s = posStr.trim();
  // GK и SW иногда идут без сторон
  if (s === "GK") return new Set(["GK"]);
  if (s === "SW") return new Set(["SW"]);

  const [sidesRaw, rolesRaw] = s.split(/\s+/, 2);
  if (!rolesRaw) return new Set(); // на всякий

  const sides = sidesRaw.toUpperCase(); // L, R, C, LC, CR, LR, LCR...
  const roles = rolesRaw.toUpperCase().split("/"); // DF, DM, MF, AM, FW...

  const out = new Set();

  const hasL = sides.includes("L");
  const hasR = sides.includes("R");
  const hasC = sides.includes("C");

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
      out.add("CFW"); // на практике форварда можно считать CFW
    } else if (role === "SW") {
      out.add("SW");
    } else if (role === "GK") {
      out.add("GK");
    }
  }

  return out;
}

function parseNumberLikePefl(str) {
  // "14,916,000" -> 14916000
  if (!str) return null;
  const n = Number(String(str).replaceAll(",", "").replaceAll(" ", "").trim());
  return Number.isFinite(n) ? n : null;
}

function clampInt(v, fallback) {
  const n = parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function buildFiltersUI(container, initialState, onChange) {
  container.innerHTML = `
    <div style="border:1px solid #7aa; background:#eaffea; padding:14px; border-radius:12px;">
      <div style="font-weight:800; font-size:20px; margin-bottom:10px;">Позиция</div>

      <div id="posBox" style="display:grid; grid-auto-rows:auto; row-gap:10px; width:fit-content;">
        ${POS_GRID.map(
          (row) => `
          <div style="display:flex; gap:18px; align-items:center;">
            ${row
              .map(
                (code) => `
              <label style="display:flex; gap:8px; align-items:center; font-size:22px;">
                <input type="checkbox" data-pos="${code}" style="width:22px;height:22px;" />
                <span>${code}</span>
              </label>
            `
              )
              .join("")}
          </div>
        `
        ).join("")}
      </div>

      <div style="margin-top:12px;">
        <label style="display:flex; gap:10px; align-items:center; font-size:22px;">
          <input id="matchAllPos" type="checkbox" style="width:22px;height:22px;" />
          <span>искать игроков со всеми отмеченными позициями</span>
        </label>
      </div>

      <div style="height:18px;"></div>

      <div style="display:flex; flex-direction:column; gap:16px; font-size:26px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span>Возраст от</span>
          <input id="ageMin" type="number" style="width:72px; font-size:26px;" />
          <span>до</span>
          <input id="ageMax" type="number" style="width:72px; font-size:26px;" />
        </div>

        <div style="display:flex; align-items:center; gap:12px;">
          <span>Номинал от</span>
          <input id="valMin" type="number" style="width:160px; font-size:26px;" />
          <span>до</span>
          <input id="valMax" type="number" style="width:160px; font-size:26px;" />
        </div>

        <div style="display:flex; align-items:center; gap:12px;">
          <span>Цена от</span>
          <input id="priceMin" type="number" style="width:160px; font-size:26px;" />
          <span>до</span>
          <input id="priceMax" type="number" style="width:160px; font-size:26px;" />
        </div>

        <div style="display:flex; align-items:center; gap:22px; margin-top:6px;">
          <label style="display:flex; gap:10px; align-items:center;">
            <input id="onlyTransfer" type="checkbox" style="width:22px;height:22px;" />
            <span>на трансфере</span>
          </label>

          <label style="display:flex; gap:10px; align-items:center;">
            <input id="onlyUnneeded" type="checkbox" style="width:22px;height:22px;" />
            <span>ненужные</span>
          </label>

          <button id="resetBtn" style="font-size:18px; padding:6px 10px;">Сбросить</button>
        </div>
      </div>
    </div>
  `;

  // set initial values
  const setChecked = (sel, checked) => {
    const el = container.querySelector(sel);
    if (el) el.checked = !!checked;
  };

  container
    .querySelectorAll('input[type="checkbox"][data-pos]')
    .forEach((cb) => {
      cb.checked = initialState.positions.has(cb.dataset.pos);
    });

  setChecked("#matchAllPos", initialState.matchAllPositions);
  setChecked("#onlyTransfer", initialState.onlyTransfer);
  setChecked("#onlyUnneeded", initialState.onlyUnneeded);

  container.querySelector("#ageMin").value = initialState.ageMin;
  container.querySelector("#ageMax").value = initialState.ageMax;
  container.querySelector("#valMin").value = initialState.valueMin;
  container.querySelector("#valMax").value = initialState.valueMax;
  container.querySelector("#priceMin").value = initialState.priceMin;
  container.querySelector("#priceMax").value = initialState.priceMax;

  const emit = () => {
    const positions = new Set(
      [...container.querySelectorAll('input[type="checkbox"][data-pos]')]
        .filter((x) => x.checked)
        .map((x) => x.dataset.pos)
    );

    onChange({
      positions,
      matchAllPositions: !!container.querySelector("#matchAllPos")?.checked,
      ageMin: clampInt(container.querySelector("#ageMin")?.value, 16),
      ageMax: clampInt(container.querySelector("#ageMax")?.value, 40),
      valueMin: clampInt(container.querySelector("#valMin")?.value, 0),
      valueMax: clampInt(container.querySelector("#valMax")?.value, 99000000),
      priceMin: clampInt(container.querySelector("#priceMin")?.value, 0),
      priceMax: clampInt(container.querySelector("#priceMax")?.value, 40000000),
      onlyTransfer: !!container.querySelector("#onlyTransfer")?.checked,
      onlyUnneeded: !!container.querySelector("#onlyUnneeded")?.checked,
    });
  };

  container.addEventListener("input", emit);
  container.addEventListener("change", emit);

  container.querySelector("#resetBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    onChange({
      positions: new Set(),
      matchAllPositions: false,
      ageMin: 16,
      ageMax: 40,
      valueMin: 0,
      valueMax: 99000000,
      priceMin: 0,
      priceMax: 40000000,
      onlyTransfer: false,
      onlyUnneeded: false,
    });
  });
}

function applyFilters(players, filters) {
  return players.filter((p) => {
    const age = clampInt(p.age, 0);
    const value = parseNumberLikePefl(p.value) ?? 0;
    const price = parseNumberLikePefl(p.wantPrice) ?? 0;

    if (age < filters.ageMin || age > filters.ageMax) return false;
    if (value < filters.valueMin || value > filters.valueMax) return false;
    if (price < filters.priceMin || price > filters.priceMax) return false;

    if (filters.onlyTransfer && !p.isOnTransfer) return false;
    if (filters.onlyUnneeded && !p.isUnneeded) return false;

    if (filters.positions.size > 0) {
      const posSet = p._posSet ?? normalizePositions(p.position);
      p._posSet = posSet; // микро-кэш на объекте

      if (filters.matchAllPositions) {
        // игрок должен иметь ВСЕ отмеченные позиции
        for (const need of filters.positions) {
          if (!posSet.has(need)) return false;
        }
      } else {
        // игрок должен иметь ХОТЯ БЫ ОДНУ отмеченную позицию
        let ok = false;
        for (const need of filters.positions) {
          if (posSet.has(need)) {
            ok = true;
            break;
          }
        }
        if (!ok) return false;
      }
    }

    return true;
  });
}

function renderWithFilters(root, allPlayers) {
  root.innerHTML = `
    <div id="filtersRoot"></div>
    <div style="height:14px;"></div>
    <div id="tableRoot"></div>
  `;

  const filtersRoot = root.querySelector("#filtersRoot");
  const tableRoot = root.querySelector("#tableRoot");

  let state = {
    positions: new Set(),
    matchAllPositions: false,
    ageMin: 16,
    ageMax: 40,
    valueMin: 0,
    valueMax: 99000000,
    priceMin: 0,
    priceMax: 40000000,
    onlyTransfer: false,
    onlyUnneeded: false,
  };

  const rerender = () => {
    const filtered = applyFilters(allPlayers, state);
    renderPlayersTable(tableRoot, filtered);
  };

  buildFiltersUI(filtersRoot, state, (nextState) => {
    state = nextState;
    // перерисуем фильтры (для Reset) и таблицу
    buildFiltersUI(filtersRoot, state, (s) => {
      state = s;
      rerender();
    });
    rerender();
  });

  rerender();
}

// минимальный escape чтобы не вставить мусор в HTML
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function waitForRows({ timeoutMs = 15000, intervalMs = 100 } = {}) {
  return new Promise((resolve) => {
    const start = Date.now();

    const tick = () => {
      const rows = document.querySelectorAll('tr.jqgrow[role="row"]');
      if (rows.length) return resolve(rows);
      if (Date.now() - start > timeoutMs) return resolve(rows); // вернёт пусто, но без падения
      setTimeout(tick, intervalMs);
    };

    tick();
  });
}

(async function () {
  const params = new URLSearchParams(location.search);
  if (params.get("p") !== "sc") return;

  // 1) Включаем "все игроки" один раз
  if (params.get("u") !== "1") {
    const allOnOnePageLink = [...document.querySelectorAll("a")].find(
      (a) => a.textContent.trim() === "Все игроки на 1 странице"
    );

    if (allOnOnePageLink?.href) {
      console.log("[EXT] Enable 'all players on one page' via redirect");
      location.href = allOnOnePageLink.href;
      return;
    }

    // Если ссылки вдруг нет (редко) — можно принудительно добавить u=1:
    params.set("u", "1");
    location.search = params.toString();
    return;
  }

  // 2) Находим контентную зону (твоя td.back4)
  const contentCell =
    [...document.querySelectorAll("td.back4")].find(
      (el) => el.offsetWidth > 200 && el.offsetHeight > 200
    ) || document.querySelector("td.back4");

  if (!contentCell) {
    console.warn("[EXT] content cell td.back4 not found");
    return;
  }

  // 3) Мягко заменяем контент (можно не удалять навсегда, а спрятать)
  const original = contentCell.innerHTML;
  await waitForRows();
  const players = parsePlayersFromGrid();
  console.log(players);

  // root для твоего UI
  const root = document.createElement("div");
  root.id = "pefl-ext-root";
  root.style.padding = "12px";

  // Простейший экран, чтобы понять, что всё работает
  // root.innerHTML = `
  //   <div style="border:1px solid #7aa; background:#eaffea; padding:12px; border-radius:10px;">
  //     <div style="font-weight:700; margin-bottom:6px;">PEFL Extension UI</div>
  //     <div style="margin-bottom:10px;">Контентная зона перехвачена ✅</div>
  //     <button id="pefl-ext-restore">Показать оригинал</button>
  //     <button id="pefl-ext-load" style="margin-left:8px;">Загрузить данные (debug)</button>
  //     <pre id="pefl-ext-out" style="white-space:pre-wrap; margin-top:10px; max-height:260px; overflow:auto;"></pre>
  //   </div>
  // `;

  const children = Array.from(contentCell.childNodes);
  children.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) n.style.display = "none";
  });

  // 2) Вставляем свой UI
  contentCell.appendChild(root);

  renderWithFilters(root, players);
})();
