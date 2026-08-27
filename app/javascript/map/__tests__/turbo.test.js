import { initializeMapPage } from "../page_init";
import { initMapNew } from "../pages";
import { state } from "../state";
import { resetMapPageBeforeCache } from "../turbo";

jest.mock("../pages", () => ({
  initMapNew: jest.fn(),
  initMapEdit: jest.fn(),
  initMapShow: jest.fn()
}));

describe("Turbo map lifecycle", () => {
  const Route = {
    computeRoutes: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    window.google = {
      maps: {
        importLibrary: jest.fn((name) => Promise.resolve(
          name === "routes" ? { Route } : {}
        ))
      }
    };
    window.googleMapsApiReadyPromise = Promise.resolve();
    window.Sortable = jest.fn();

    state.map = null;
    state.markers = [];
    state.deliveryPoints = [];
    state.routePolylines = [];

    document.body.innerHTML = `
      <div id="map"></div>
      <div id="route-data" data-map-mode="new"></div>
    `;
  });

  test("resets state and initialization flags before caching", () => {
    const mapElement = document.getElementById("map");
    mapElement.dataset.initialized = "true";
    mapElement.dataset.initializing = "true";
    state.map = {};

    document.dispatchEvent(new Event("turbo:before-cache"));

    expect(state.map).toBeNull();
    expect(mapElement.dataset.initialized).toBeUndefined();
    expect(mapElement.dataset.initializing).toBeUndefined();
  });

  test("initializes a restored cached map only once", async () => {
    const mapElement = document.getElementById("map");
    mapElement.dataset.initialized = "true";
    resetMapPageBeforeCache();

    await Promise.all([
      initializeMapPage(),
      initializeMapPage()
    ]);

    expect(initMapNew).toHaveBeenCalledTimes(1);
    expect(mapElement.dataset.initialized).toBe("true");
  });
});
