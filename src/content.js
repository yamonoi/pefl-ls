import { defaultState } from "./lib/constants";
import { applyFiltersToExistingTable } from "./lib/filters";
import { renderFiltersUI } from "./ui/filters";
import { renderPanelUI } from "./ui/panel";

function watchGridRerenderAndReapply(stateRef) {
  // stateRef = { get: () => state }
  const grid =
    document.querySelector("table.ui-jqgrid-btable") ||
    document.querySelector("table[id]");
  if (!grid) return () => {};

  const tbody = grid.querySelector("tbody") || grid;
  const obs = new MutationObserver(() => {
    // jqGrid иногда мутирует пачкой — сделаем micro-debounce
    clearTimeout(watchGridRerenderAndReapply._t);
    watchGridRerenderAndReapply._t = setTimeout(() => {
      applyFiltersToExistingTable(stateRef.get());
    }, 0);
  });

  obs.observe(tbody, { childList: true, subtree: true });
  return () => obs.disconnect();
}

function hidePeflUI() {
  const style = document.createElement("style");
  style.textContent = `
    /* Ссылки под таблицей */
    a[href*="plug.php?p=sc"][href*="n=1"],
    a[href*="plug.php?p=sc"][href*="n=2"] {
      display: none !important;
    }

    /* Pager jqGrid */
    #pager1_center,
    #pager1_right {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
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

  hidePeflUI();

  let state = defaultState;

  const panel = renderPanelUI();

  const onFiltersChange = (next) => {
    state = next;
    applyFiltersToExistingTable(state);
  };
  const getState = () => {
    return state;
  };

  renderFiltersUI(panel, state, onFiltersChange, getState);

  // применим сразу на старте
  applyFiltersToExistingTable(state);

  const stateRef = { get: () => state };
  watchGridRerenderAndReapply(stateRef);
})();
