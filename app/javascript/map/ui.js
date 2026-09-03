// ui.js

import { state } from "map/state";

import { drawRoute } from "map/route";

import {
  renumberMarkers,
  removePoint,
  movePoint
} from "map/markers";

import {
  getPointLabel
} from "map/utils";

const ROUTE_DRAW_DEBOUNCE_MS = 150;
let routeDrawTimer = null;


// リスト表示
export function renderList() {

  const container =
    document.getElementById(
      "points-list"
    );

  if (!container) return;

  container.innerHTML = "";

  state.deliveryPoints.forEach(
    (point, index) => {

      const item =
        createDeliveryItem(
          point,
          index
        );

      container.appendChild(item);
    }
  );
}


// 画面更新
export function refreshUI({ recalculateRoute = true } = {}) {

  updateHiddenField();

  renumberMarkers();

  renderList();

  if (!state.isInitializing && recalculateRoute) {
    scheduleRouteDraw();
  }
}

function scheduleRouteDraw() {
  clearTimeout(routeDrawTimer);

  const generation = state.mapGeneration;

  routeDrawTimer = setTimeout(() => {
    routeDrawTimer = null;

    if (generation === state.mapGeneration) {
      drawRoute();
    }
  }, ROUTE_DRAW_DEBOUNCE_MS);
}


// HTML生成
function createDeliveryItem(
  point,
  index
) {

  const template =
    document.getElementById(
      "delivery-item-template"
    );

  const item =
    template.content
      .firstElementChild
      .cloneNode(true);

  item.dataset.index = index;

  item.querySelector(
    ".delivery-item__number"
  ).textContent = index + 1;

  item.querySelector(
    ".delivery-item__address"
  ).textContent =
    getPointLabel(point);

  setupDeleteButton(
    item,
    index
  );

  return item;
}


// 削除ボタン処理
function setupDeleteButton(
  item,
  index
) {

  const deleteBtn =
    item.querySelector(
      ".delivery-item__delete-btn"
    );

  if (!isEditable()) return;

  deleteBtn.addEventListener(
    "click",
    () => removePoint(index)
  );
}


// 編集可能チェック
function isEditable() {

  const container =
    document.getElementById(
      "points-list"
    );

  return (
    container?.dataset.editable === "true"
  );
}


// hidden field更新
export function updateHiddenField() {

  const input =
    document.getElementById(
      "points_json"
    );

  if (input) {

    input.value =
      JSON.stringify(
        state.deliveryPoints
      );
  }

  if (state.isNewPage) {

    sessionStorage.setItem(
      "route_points",

      JSON.stringify(
        state.deliveryPoints
      )
    );
  }
}


// リスト並べ替え
export function initSortable() {

  const el =
    document.getElementById(
      "points-list"
    );

  if (!el) return;

  new Sortable(el, {

    animation: 150,

    filter: ".start-point",

    onMove(evt) {

      return !evt.related
        .classList
        .contains("start-point");
    },

    onEnd(evt) {

      movePoint(
        evt.oldDraggableIndex,
        evt.newDraggableIndex
      );
    }
  });
}


// 経由地点取得
export function getRoutePoints() {

  const routeData =
    document.getElementById(
      "route-data"
    );

  if (!routeData) return [];

  return JSON.parse(
    routeData.dataset.points || "[]"
  );
}
