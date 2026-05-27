// app/javascript/map/__tests__/page_init.test.js

import { initializeMapPage } from "../page_init";
import { state } from "../state";
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

    // state初期化
    state.mapBooted = false;

    // google maps mock
    window.google = {
      maps: {}
    };

    // map要素追加
    document.body.innerHTML = `
      <div id="map"></div>
    `;
  });

  test("mapBooted が true の場合は何もしない", () => {

    state.mapBooted = true;

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

    window.history.pushState({}, "", "/routes/new");

    initializeMapPage();

    expect(initMapNew).toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();

    expect(state.mapBooted).toBe(true);
  });

  test("edit ページなら initMapEdit を呼ぶ", () => {

    window.history.pushState({}, "", "/routes/1/edit");

    initializeMapPage();

    expect(initMapEdit).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

  test("show ページなら initMapShow を呼ぶ", () => {

    window.history.pushState({}, "", "/routes/1");

    initializeMapPage();

    expect(initMapShow).toHaveBeenCalled();
    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
  });

  test("対象外ページでは何も呼ばない", () => {

    window.history.pushState({}, "", "/");

    initializeMapPage();

    expect(initMapNew).not.toHaveBeenCalled();
    expect(initMapEdit).not.toHaveBeenCalled();
    expect(initMapShow).not.toHaveBeenCalled();
  });

});