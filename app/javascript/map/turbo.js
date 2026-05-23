// turbo.js

import { initializeMapPage } from "map/page_init";
import { resetMapState } from "map/map";
import { state } from "map/state";

document.addEventListener("turbo:render", () => {
  state.mapBooted = false;
  resetMapState();
  requestAnimationFrame(initializeMapPage);
});

document.addEventListener("turbo:load", initializeMapPage);