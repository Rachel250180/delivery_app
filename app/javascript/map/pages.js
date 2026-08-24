// pages.js

import { state } from "map/state";

import {
  createMap,
  resetMapState
} from "map/map";

import {
  loadRoutePoints,
  addPoint
} from "map/markers";

import {
  initSortable,
  getRoutePoints
} from "map/ui";

import {
  fetchAddress
} from "map/geocoder";

import {
  canAddPoint
} from "map/utils";


// 共通初期化
function setupMapPage({
  editable = false,
  useSession = false
} = {}) {

  resetMapState();

  createMap();

  loadInitialPoints(useSession);

  if (editable) {

    setupMapClick();

    initSortable();
  }
}


// 初期地点読み込み
function loadInitialPoints(
  useSession
) {

  const routePoints =
    getRoutePoints();

  if (routePoints.length > 0) {

    loadRoutePoints(
      routePoints
    );

    return;
  }

  if (!useSession) return;

  const saved =
    sessionStorage.getItem(
      "route_points"
    );

  if (saved) {

    loadRoutePoints(
      JSON.parse(saved)
    );
  }
}


// mapクリック
function setupMapClick() {

  state.map.addListener(
    "click",

    (e) => {

      if (!canAddPoint()) {
        return;
      }

      const lat =
        e.latLng.lat();

      const lng =
        e.latLng.lng();

      fetchAddress(
        lat,
        lng,

        (address) => {

          addPoint({
            lat,
            lng,
            address
          });
        }
      );
    }
  );
}


// new
export function initMapNew() {

  state.isNewPage = true;

  setupMapPage({
    editable: true,
    useSession: true
  });

  setupForm();
}


// show
export function initMapShow() {

  state.isNewPage = false;

  setupMapPage();
}


// edit
export function initMapEdit() {

  state.isNewPage = false;

  setupMapPage({
    editable: true
  });
}


// form設定
function setupForm() {

  const form =
    document.getElementById(
      "route-form"
    );

  if (
    !form ||
    form.dataset.listenerAdded
  ) {
    return;
  }

  form.dataset.listenerAdded =
    "true";
}
