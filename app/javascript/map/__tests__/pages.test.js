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
  addPoint,
  updatePointAddress
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
  addPoint: jest.fn(),
  updatePointAddress: jest.fn()
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

    state.mapGeneration = 0;
    state.deliveryPoints = [];

    resetMapState.mockImplementation(() => {
      state.mapGeneration += 1;
      state.deliveryPoints = [];
    });

    addPoint.mockImplementation((point) => {
      const deliveryPoint = { ...point };
      state.deliveryPoints.push(deliveryPoint);
      return deliveryPoint;
    });

    updatePointAddress.mockImplementation(
      (point, address) => {
        if (state.deliveryPoints.includes(point)) {
          point.address = address;
        }
      }
    );

    state.map = {
      addListener: jest.fn()
    };

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

      expect(loadRoutePoints)
        .toHaveBeenCalledWith(savedPoints);
    });
  });

  describe("map click", () => {

    test("クリック時に地点を追加し、callbackで住所を更新する", () => {

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
          expect.any(Function),
          1
        );

      expect(addPoint)
        .toHaveBeenCalledWith({
          lat: 35,
          lng: 139,
          address: ""
        });

      expect(updatePointAddress)
        .toHaveBeenCalledWith(
          state.deliveryPoints[0],
          "東京都"
        );
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

    test("Geocoderの応答順に関係なくクリック順を維持する", () => {

      getRoutePoints.mockReturnValue([]);
      canAddPoint.mockReturnValue(true);

      const callbacks = [];
      fetchAddress.mockImplementation(
        (_lat, _lng, callback) => {
          callbacks.push(callback);
        }
      );

      initMapEdit();

      const clickHandler =
        state.map.addListener.mock.calls[0][1];

      [1, 2, 3].forEach((value) => {
        clickHandler({
          latLng: {
            lat: () => value,
            lng: () => value + 10
          }
        });
      });

      callbacks[2]("C");
      callbacks[1]("B");
      callbacks[0]("A");

      expect(state.deliveryPoints).toEqual([
        { lat: 1, lng: 11, address: "A" },
        { lat: 2, lng: 12, address: "B" },
        { lat: 3, lng: 13, address: "C" }
      ]);
    });

    test("再初期化前のcallbackは現在のstateを変更しない", () => {

      getRoutePoints.mockReturnValue([]);
      canAddPoint.mockReturnValue(true);

      let oldCallback;
      fetchAddress.mockImplementation(
        (_lat, _lng, callback) => {
          oldCallback = callback;
        }
      );

      initMapEdit();
      const oldClickHandler =
        state.map.addListener.mock.calls[0][1];

      oldClickHandler({
        latLng: {
          lat: () => 1,
          lng: () => 2
        }
      });

      initMapEdit();
      oldCallback("古い住所");

      expect(state.deliveryPoints).toEqual([]);
      expect(updatePointAddress)
        .not.toHaveBeenCalled();
    });

    test("上限直前の連続クリックでも9地点を超えない", () => {

      getRoutePoints.mockReturnValue([]);
      state.deliveryPoints = Array.from(
        { length: 8 },
        (_, index) => ({ lat: index, lng: index })
      );
      canAddPoint.mockImplementation(
        () => state.deliveryPoints.length < 9
      );

      initMapEdit();
      state.deliveryPoints = Array.from(
        { length: 8 },
        (_, index) => ({ lat: index, lng: index })
      );

      const clickHandler =
        state.map.addListener.mock.calls[0][1];

      for (let i = 0; i < 3; i += 1) {
        clickHandler({
          latLng: {
            lat: () => 20 + i,
            lng: () => 30 + i
          }
        });
      }

      expect(state.deliveryPoints).toHaveLength(9);
      expect(fetchAddress).toHaveBeenCalledTimes(1);
    });
  });
});
