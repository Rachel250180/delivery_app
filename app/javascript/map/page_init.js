// page_init.js

import {
  initMapNew,
  initMapEdit,
  initMapShow
} from "map/pages";

export function initializeMapPage() {
  const mapElement =
    document.getElementById("map");

  const routeData =
    document.getElementById("route-data");

  if (!mapElement || !routeData) return;
  if (mapElement.dataset.initialized === "true") return;

  if (!window.google?.maps) {
    initializeWhenGoogleMapsLoads();
    return;
  }

  const initializer = {
    new: initMapNew,
    edit: initMapEdit,
    show: initMapShow
  }[routeData.dataset.mapMode];

  if (!initializer) return;

  mapElement.dataset.initialized = "true";

  try {
    initializer();
  } catch (error) {
    delete mapElement.dataset.initialized;
    throw error;
  }
}

function initializeWhenGoogleMapsLoads() {
  const script = document.querySelector(
    "script[data-google-maps-script]"
  );

  if (!script || script.dataset.listenerAdded === "true") return;

  script.dataset.listenerAdded = "true";
  script.addEventListener("load", initializeMapPage, { once: true });
}
