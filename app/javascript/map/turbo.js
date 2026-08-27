// turbo.js

import { initializeMapPage } from "map/page_init";
import { resetMapState } from "map/map";

export function resetMapPageBeforeCache() {
  resetMapState();

  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  delete mapElement.dataset.initialized;
  delete mapElement.dataset.initializing;
}

document.addEventListener("turbo:before-cache", resetMapPageBeforeCache);
document.addEventListener("turbo:before-render", resetMapState);

document.addEventListener("turbo:load", initializeMapPage);
