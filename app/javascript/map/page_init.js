// page_init.js

import {
  initMapNew,
  initMapEdit,
  initMapShow
} from "map/pages";

export async function initializeMapPage() {
  const mapElement =
    document.getElementById("map");

  const routeData =
    document.getElementById("route-data");

  if (!mapElement || !routeData) return;
  if (mapElement.dataset.initialized === "true") return;
  if (mapElement.dataset.initializing === "true") return;

  const initializer = {
    new: initMapNew,
    edit: initMapEdit,
    show: initMapShow
  }[routeData.dataset.mapMode];

  if (!initializer) return;

  mapElement.dataset.initializing = "true";

  try {
    await loadGoogleMapsLibraries();

    // Turbo may have replaced the page while the libraries were loading.
    if (
      !mapElement.isConnected ||
      document.getElementById("map") !== mapElement
    ) {
      return;
    }

    initializer();
    mapElement.dataset.initialized = "true";
  } catch (error) {
    delete mapElement.dataset.initialized;
    throw error;
  } finally {
    delete mapElement.dataset.initializing;
  }
}

async function loadGoogleMapsLibraries() {
  await waitForGoogleMapsApi();

  if (!window.google?.maps?.importLibrary) {
    throw new Error("Google Maps API failed to initialize");
  }

  await Promise.all([
    google.maps.importLibrary("maps"),
    google.maps.importLibrary("marker"),
    google.maps.importLibrary("geocoding"),
    google.maps.importLibrary("routes")
  ]);
}

function waitForGoogleMapsApi() {
  if (!window.googleMapsApiReadyPromise) {
    return Promise.reject(
      new Error("Google Maps API readiness callback was not configured")
    );
  }

  return window.googleMapsApiReadyPromise;
}
