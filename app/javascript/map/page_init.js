// page_init.js

import { state } from "map/state";
import {
  initMapNew,
  initMapEdit,
  initMapShow
} from "map/pages";

export function initializeMapPage() {

  if (state.mapBooted) return;

  if (!window.google?.maps) return;

  const mapElement =
    document.getElementById("map");

  if (!mapElement) return;

  state.mapBooted = true;

  const path =
    window.location.pathname;

  if (/\/routes\/\d+\/edit$/.test(path)) {

    initMapEdit();

  } else if (/\/routes\/new$/.test(path)) {

    initMapNew();

  } else if (/\/routes\/\d+$/.test(path)) {

    initMapShow();
  }
}