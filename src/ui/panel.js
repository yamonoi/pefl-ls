function findContentCell() {
  return (
    [...document.querySelectorAll("td.back4")].find(
      (el) => el.offsetWidth > 200 && el.offsetHeight > 200
    ) || document.querySelector("td.back4")
  );
}

function findGridRoot() {
  // jqGrid обычно: <table id="list"> ... и рядом <div id="pager">
  // но точных id мы не знаем — поэтому ищем по tr.jqgrow как маркер
  const row = document.querySelector("tr.jqgrow");
  if (!row) return null;
  return row.closest("table") || row.closest("div") || row.parentElement;
}

export function renderPanelUI() {
  const content = findContentCell();
  if (!content) return null;

  let panel = document.getElementById("pefl-ext-filters");
  if (panel) return panel;

  panel = document.createElement("div");
  panel.id = "pefl-ext-filters";
  panel.style.cssText = "margin:8px 4px;width:750px;box-sizing:border-box";

  // вставим панель повыше — рядом с гридом
  // если найдём таблицу — вставим перед ней
  const gridRoot = findGridRoot();
  if (gridRoot && gridRoot.parentElement) {
    gridRoot.parentElement.insertBefore(panel, gridRoot);
  } else {
    content.insertBefore(panel, content.firstChild);
  }

  return panel;
}
