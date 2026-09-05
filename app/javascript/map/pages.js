// pages.js

import { getDraftKey, isValidDraft } from "map/draft";

import { state } from "map/state";

import {
  createMap,
  resetMapState
} from "map/map";

import {
  loadRoutePoints,
  addPoint,
  updatePointAddress
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

  const draftKey = getDraftKey();
  if (!draftKey) return;

  const saved = sessionStorage.getItem(draftKey);

  if (saved !== null) {

    let savedPoints;

    try {

      savedPoints = JSON.parse(saved);

      if (!isValidDraft(savedPoints)) {
        sessionStorage.removeItem(draftKey);
        return;
      }

    } catch (_error) {

      sessionStorage.removeItem(draftKey);
      return;
    }

    loadRoutePoints(
      savedPoints
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

      const generation =
        state.mapGeneration;

      const deliveryPoint =
        addPoint({
          lat,
          lng,
          address: ""
        });

      fetchAddress(
        lat,
        lng,

        (address) => {

          if (
            generation !==
              state.mapGeneration
          ) {
            return;
          }

          updatePointAddress(
            deliveryPoint,
            address
          );
        },
        generation
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
