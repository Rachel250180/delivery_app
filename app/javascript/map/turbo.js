// turbo.js

import { initializeMapPage } from "map/page_init";
import { resetMapState } from "map/map";

document.addEventListener("turbo:before-render", resetMapState);

document.addEventListener("turbo:load", initializeMapPage);
