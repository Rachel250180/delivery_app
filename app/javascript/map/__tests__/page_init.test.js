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
      maps: {}
    };

    // map要素追加
    document.body.innerHTML = `
      <div id="map"></div>
      <div id="route-data" data-map-mode="new"></div>
    `;
  });

  test("初期化済みの map 要素では何もしない", () => {

    document.getElementById("map").dataset.initialized = "true";

    initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("google.maps が無い場合は何もしない", () => {

    window.google = undefined;

    initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("map 要素が無い場合は何もしない", () => {

    document.body.innerHTML = "";

    initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
  });

  test("new ページなら initMapNew を呼ぶ", () => {

    initializeMapPage();

    expect(initMapNew).toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();

    expect(
      document.getElementById("map").dataset.initialized
    ).toBe("true");
  });

  test("edit ページなら initMapEdit を呼ぶ", () => {

    document.getElementById("route-data").dataset.mapMode = "edit";

    initializeMapPage();

    expect(initMapEdit).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("show ページなら initMapShow を呼ぶ", () => {

    document.getElementById("route-data").dataset.mapMode = "show";

    initializeMapPage();

    expect(initMapShow).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
  });

  test("対象外ページでは何も呼ばない", () => {

    document.getElementById("route-data").dataset.mapMode = "unknown";

    initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("同じ map 要素を二重に初期化しない", () => {
    initializeMapPage();
    initializeMapPage();

    expect(initMapNew).toHaveBeenCalledTimes(1);
  });

  test("Google Maps の読み込み完了後に一度だけ初期化する", () => {
    window.google = undefined;

    const script = document.createElement("script");
    script.dataset.googleMapsScript = "";
    document.head.appendChild(script);

    initializeMapPage();
    initializeMapPage();

    window.google = { maps: {} };
    script.dispatchEvent(new Event("load"));

    expect(initMapNew).toHaveBeenCalledTimes(1);
    expect(script.dataset.listenerAdded).toBe("true");

    script.remove();
  });

});
