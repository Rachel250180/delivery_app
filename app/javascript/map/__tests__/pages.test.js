// app/javascript/map/__tests__/pages.test.js

import {
  initMapNew,
  initMapShow,
  initMapEdit
} from "../pages";

import { state } from "../state";

import {
  createMap,
  resetMapState
} from "../map";

import {
  loadRoutePoints,
  addPoint
} from "../markers";

import {
  initSortable,
  getRoutePoints
} from "../ui";

import {
  fetchAddress
} from "../geocoder";

import {
  canAddPoint
} from "../utils";

jest.mock("../map", () => ({
  createMap: jest.fn(),
  resetMapState: jest.fn()
}));

jest.mock("../markers", () => ({
  loadRoutePoints: jest.fn(),
  addPoint: jest.fn()
}));

jest.mock("../ui", () => ({
  initSortable: jest.fn(),
  getRoutePoints: jest.fn()
}));

jest.mock("../geocoder", () => ({
  fetchAddress: jest.fn()
}));

jest.mock("../utils", () => ({
  canAddPoint: jest.fn()
}));

describe("pages.js", () => {

  beforeEach(() => {

    jest.clearAllMocks();

    sessionStorage.clear();

    state.map = {
      addListener: jest.fn()
    };

    jest.useFakeTimers();
  });

  afterEach(() => {

    jest.useRealTimers();
  });

  describe("initMapShow", () => {

    test("mapを初期化する", () => {

      getRoutePoints.mockReturnValue([]);

      initMapShow();

      expect(state.isNewPage).toBe(false);

      expect(resetMapState)
        .toHaveBeenCalled();

      expect(createMap)
        .toHaveBeenCalled();

      expect(initSortable)
        .not.toHaveBeenCalled();
    });

    test("routePoints が存在すれば読み込む", () => {

      const points = [
        { lat: 1, lng: 2 }
      ];

      getRoutePoints.mockReturnValue(points);

      initMapShow();

      expect(loadRoutePoints)
        .toHaveBeenCalledWith(points);
    });
  });

  describe("initMapEdit", () => {

    test("editable モードで初期化する", () => {

      getRoutePoints.mockReturnValue([]);

      initMapEdit();

      expect(state.isNewPage).toBe(false);

      expect(initSortable)
        .toHaveBeenCalled();

      expect(state.map.addListener)
        .toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );
    });
  });

  describe("initMapNew", () => {

    test("newページとして初期化する", () => {

      getRoutePoints.mockReturnValue([]);

      initMapNew();

      jest.runAllTimers();

      expect(state.isNewPage).toBe(true);

      expect(resetMapState)
        .toHaveBeenCalled();

      expect(createMap)
        .toHaveBeenCalled();

      expect(initSortable)
        .toHaveBeenCalled();
    });

    test("sessionStorage の route_points を読み込む", () => {

      const savedPoints = [
        { lat: 10, lng: 20 }
      ];

      sessionStorage.setItem(
        "route_points",
        JSON.stringify(savedPoints)
      );

      getRoutePoints.mockReturnValue([]);

      initMapNew();

      jest.runAllTimers();

      expect(loadRoutePoints)
        .toHaveBeenCalledWith(savedPoints);
    });
  });

  describe("map click", () => {

    test("クリック時に addPoint を呼ぶ", () => {

      getRoutePoints.mockReturnValue([]);

      canAddPoint.mockReturnValue(true);

      fetchAddress.mockImplementation(
        (lat, lng, callback) => {
          callback("東京都");
        }
      );

      initMapEdit();

      const clickHandler =
        state.map.addListener.mock.calls[0][1];

      clickHandler({
        latLng: {
          lat: () => 35,
          lng: () => 139
        }
      });

      expect(fetchAddress)
        .toHaveBeenCalledWith(
          35,
          139,
          expect.any(Function)
        );

      expect(addPoint)
        .toHaveBeenCalledWith({
          lat: 35,
          lng: 139,
          address: "東京都"
        });
    });

    test("canAddPoint が false の場合は追加しない", () => {

      getRoutePoints.mockReturnValue([]);

      canAddPoint.mockReturnValue(false);

      initMapEdit();

      const clickHandler =
        state.map.addListener.mock.calls[0][1];

      clickHandler({
        latLng: {
          lat: () => 35,
          lng: () => 139
        }
      });

      expect(fetchAddress)
        .not.toHaveBeenCalled();

      expect(addPoint)
        .not.toHaveBeenCalled();
    });
  });
});