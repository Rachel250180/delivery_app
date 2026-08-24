// app/javascript/map/__tests__/page_init.test.js

import { initializeMapPage } from "../page_init";
import {
  initMapNew,
  initMapEdit,
  initMapShow
} from "../pages";

jest.mock("../pages", () => ({
  initMapNew: jest.fn(),
  initMapEdit: jest.fn(),
  initMapShow: jest.fn()
}));

describe("initializeMapPage", () => {

  beforeEach(() => {

    // mock初期化
    jest.clearAllMocks();

    // google maps mock
    window.google = {
      maps: {
        importLibrary: jest.fn().mockResolvedValue({})
      }
    };
    window.googleMapsApiReadyPromise = Promise.resolve();
    window.Sortable = jest.fn();

    // map要素追加
    document.body.innerHTML = `
      <div id="map"></div>
      <div id="route-data" data-map-mode="new"></div>
    `;
  });

  test("初期化済みの map 要素では何もしない", async () => {

    document.getElementById("map").dataset.initialized = "true";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("readiness callback が未設定ならエラーにする", async () => {

    window.googleMapsApiReadyPromise = undefined;

    await expect(initializeMapPage()).rejects.toThrow(
      "Google Maps API readiness callback was not configured"
    );

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("map 要素が無い場合は何もしない", async () => {

    document.body.innerHTML = "";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("new ページならライブラリを待って initMapNew を呼ぶ", async () => {

    await initializeMapPage();

    expect(google.maps.importLibrary.mock.calls.map(([name]) => name))
      .toEqual(["maps", "marker", "geocoding", "routes"]);

    expect(initMapNew).toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();

    expect(
      document.getElementById("map").dataset.initialized
    ).toBe("true");
  });

  test("edit ページなら initMapEdit を呼ぶ", async () => {

    document.getElementById("route-data").dataset.mapMode = "edit";

    await initializeMapPage();

    expect(initMapEdit).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("show ページなら initMapShow を呼ぶ", async () => {

    document.getElementById("route-data").dataset.mapMode = "show";

    await initializeMapPage();

    expect(initMapShow).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
  });

  test("対象外ページでは何も呼ばない", async () => {

    document.getElementById("route-data").dataset.mapMode = "unknown";

    await initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("同じ map 要素を二重に初期化しない", async () => {
    await Promise.all([
      initializeMapPage(),
      initializeMapPage()
    ]);

    expect(initMapNew).toHaveBeenCalledTimes(1);
  });

  test("Google Maps callback の通知後に一度だけ初期化する", async () => {
    window.google = undefined;

    let notifyGoogleMapsReady;
    window.googleMapsApiReadyPromise = new Promise((resolve) => {
      notifyGoogleMapsReady = resolve;
    });

    const initialization = initializeMapPage();
    const duplicateInitialization = initializeMapPage();

    window.google = {
      maps: {
        importLibrary: jest.fn().mockResolvedValue({})
      }
    };
    notifyGoogleMapsReady();

    await Promise.all([initialization, duplicateInitialization]);

    expect(initMapNew).toHaveBeenCalledTimes(1);
  });

  test("編集画面では Sortable.js の読み込み完了を待って初期化する", async () => {
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

  test("詳細画面では Sortable.js を待たない", async () => {
    document.getElementById("route-data").dataset.mapMode = "show";
    window.Sortable = undefined;

    await initializeMapPage();

    expect(initMapShow).toHaveBeenCalledTimes(1);
  });

  test("ライブラリ待機中に Turbo が画面を差し替えた場合は初期化しない", async () => {
    const finishLoading = [];
    google.maps.importLibrary.mockImplementation(
      () => new Promise((resolve) => { finishLoading.push(resolve); })
    );

    const initialization = initializeMapPage();
    await Promise.resolve();
    document.body.innerHTML = "";
    finishLoading.forEach((resolve) => resolve({}));

    await initialization;

    expect(initMapNew).not.toHaveBeenCalled();
  });

});
