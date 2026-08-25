// app/javascript/map/__tests__/page_init.test.js

import { initializeMapPage } from "../page_init";
import {
  initMapNew,
  initMapEdit,
  initMapShow
} from "../pages";
import { state } from "../state";

jest.mock("../pages", () => ({
  initMapNew: jest.fn(),
  initMapEdit: jest.fn(),
  initMapShow: jest.fn()
}));

describe("initializeMapPage", () => {

  const Route = {
    computeRoutes: jest.fn()
  };

  beforeEach(() => {

    // mock初期化
    jest.clearAllMocks();

    // google maps mock
    window.google = {
      maps: {
        importLibrary: jest.fn((name) => Promise.resolve(
          name === "routes" ? { Route } : {}
        ))
      }
    };
    window.googleMapsApiReadyPromise = Promise.resolve();
    window.Sortable = jest.fn();
    state.routeClass = null;

    // map要素追加
    document.body.innerHTML = `
      <div id="map"></div>
      <div id="route-data" data-map-mode="new"></div>
    `;
  });

  test("does nothing for an already initialized map element", async () => {

    document.getElementById("map").dataset.initialized = "true";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("throws when the readiness callback is not configured", async () => {

    window.googleMapsApiReadyPromise = undefined;

    await expect(initializeMapPage()).rejects.toThrow(
      "Google Maps API readiness callback was not configured"
    );

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("does nothing when the map element is missing", async () => {

    document.body.innerHTML = "";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("waits for libraries and calls initMapNew on a new page", async () => {

    await initializeMapPage();

    expect(google.maps.importLibrary.mock.calls.map(([name]) => name))
      .toEqual(["maps", "marker", "geocoding", "routes"]);
    expect(state.routeClass).toBe(Route);
    expect(Route.computeRoutes).not.toHaveBeenCalled();

    expect(initMapNew).toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();

    expect(
      document.getElementById("map").dataset.initialized
    ).toBe("true");
  });

  test("calls initMapEdit on an edit page", async () => {

    document.getElementById("route-data").dataset.mapMode = "edit";

    await initializeMapPage();

    expect(initMapEdit).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("calls initMapShow on a show page", async () => {

    document.getElementById("route-data").dataset.mapMode = "show";

    await initializeMapPage();

    expect(initMapShow).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
  });

  test("does not initialize an unsupported page", async () => {

    document.getElementById("route-data").dataset.mapMode = "unknown";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("does not initialize the same map element twice", async () => {
    await Promise.all([
      initializeMapPage(),
      initializeMapPage()
    ]);

    expect(initMapNew).toHaveBeenCalledTimes(1);
  });

  test("initializes once after the Google Maps callback", async () => {
    window.google = undefined;

    let notifyGoogleMapsReady;
    window.googleMapsApiReadyPromise = new Promise((resolve) => {
      notifyGoogleMapsReady = resolve;
    });

    const initialization = initializeMapPage();
    const duplicateInitialization = initializeMapPage();

    window.google = {
      maps: {
        importLibrary: jest.fn((name) => Promise.resolve(
          name === "routes" ? { Route } : {}
        ))
      }
    };
    notifyGoogleMapsReady();

    await Promise.all([initialization, duplicateInitialization]);

    expect(initMapNew).toHaveBeenCalledTimes(1);
  });

  test("waits for Sortable.js before initializing an edit page", async () => {
    document.getElementById("route-data").dataset.mapMode = "edit";
    window.Sortable = undefined;

    const script = document.createElement("script");
    script.dataset.sortableScript = "";
    document.head.appendChild(script);

    const initialization = initializeMapPage();
    await Promise.resolve();

    expect(initMapEdit).not.toHaveBeenCalled();

    window.Sortable = jest.fn();
    script.dispatchEvent(new Event("load"));
    await initialization;

    expect(initMapEdit).toHaveBeenCalledTimes(1);
    script.remove();
  });

  test("does not wait for Sortable.js on a show page", async () => {
    document.getElementById("route-data").dataset.mapMode = "show";
    window.Sortable = undefined;

    await initializeMapPage();

    expect(initMapShow).toHaveBeenCalledTimes(1);
  });

  test("does not initialize when Turbo replaces the page while waiting", async () => {
    const finishLoading = [];
    google.maps.importLibrary.mockImplementation(
      (name) => new Promise((resolve) => {
        finishLoading.push({ name, resolve });
      })
    );

    const initialization = initializeMapPage();
    await Promise.resolve();
    document.body.innerHTML = "";
    finishLoading.forEach(({ name, resolve }) => {
      resolve(name === "routes" ? { Route } : {});
    });

    await initialization;

    expect(initMapNew).not.toHaveBeenCalled();
  });

});
