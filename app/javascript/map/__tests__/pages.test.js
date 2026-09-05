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
  ...jest.requireActual("../utils"),
  canAddPoint: jest.fn()
}));

describe("pages.js", () => {

  beforeEach(() => {

    jest.clearAllMocks();

    sessionStorage.clear();
    document.body.innerHTML = `<div id="route-data" data-town-id="1" data-max-points="9"></div>`;

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

  test.each([initMapEdit, initMapShow])("existing pages ignore drafts (%p)", initialize => {
    sessionStorage.setItem("route_points:1", JSON.stringify([{ lat: 35, lng: 139, address: "下書き" }]));
    getRoutePoints.mockReturnValue([]);
    initialize();
    expect(loadRoutePoints).not.toHaveBeenCalled();
    expect(state.isNewPage).toBe(false);
  });

  describe("initMapShow", () => {

    test("initializes the map", () => {

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

    test("loads existing route points", () => {

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

    test("initializes in editable mode", () => {

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

    test("initializes as a new page", () => {

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

    test("restores a draft only in the town where it was saved", () => {
      const points = [{ lat: 35, lng: 139, address: "東京" }];
      state.isNewPage = true;
      state.deliveryPoints = points;
      jest.requireActual("../ui").updateHiddenField();
      getRoutePoints.mockReturnValue([]);
      document.getElementById("route-data").dataset.townId = "2";
      initMapNew();
      expect(loadRoutePoints).not.toHaveBeenCalled();
      expect(sessionStorage.getItem("route_points:1")).toBe(JSON.stringify(points));
      document.getElementById("route-data").dataset.townId = "1";
      initMapNew();
      expect(loadRoutePoints).toHaveBeenCalledWith(points);
    });

    test("ignores the legacy shared key", () => {
      sessionStorage.setItem("route_points", JSON.stringify([{ lat: 35, lng: 139, address: "" }]));
      getRoutePoints.mockReturnValue([]);
      initMapNew();
      expect(loadRoutePoints).not.toHaveBeenCalled();
    });

    test.each([
      null, {}, "text", 1, true,
      Array(10).fill({ lat: 35, lng: 139, address: "" }),
      [null], [[]], [{}], [1],
      [{ lat: 35, lng: 139 }],
      [{ lat: 35, lng: 139, address: {} }],
      ...[-91, 91, "35", null, true].map(lat => [{ lat, lng: 139, address: "" }]),
      ...[-181, 181, "139", null, true].map(lng => [{ lat: 35, lng, address: "" }])
    ].map(value => [value]))("removes invalid draft data: %j", (points) => {
      sessionStorage.setItem("route_points:1", JSON.stringify(points));
      sessionStorage.setItem("route_points:2", "other town");
      getRoutePoints.mockReturnValue([]);
      expect(() => initMapNew()).not.toThrow();
      expect(sessionStorage.getItem("route_points:1")).toBeNull();
      expect(sessionStorage.getItem("route_points:2")).toBe("other town");
      expect(loadRoutePoints).not.toHaveBeenCalled();
      expect(state.deliveryPoints).toEqual([]);
      expect(initSortable).toHaveBeenCalled();
    });

    test("rejects non-finite coordinates parsed from JSON", () => {
      sessionStorage.setItem("route_points:1", '[{"lat":1e400,"lng":139,"address":""}]');
      getRoutePoints.mockReturnValue([]);
      initMapNew();
      expect(sessionStorage.getItem("route_points:1")).toBeNull();
      expect(loadRoutePoints).not.toHaveBeenCalled();
    });

    test.each([[], Array(9).fill({ lat: -90, lng: -180, address: "" }),
      [{ lat: 90, lng: 180, address: "境界" }]].map(value => [value]))("restores valid boundary data: %j", points => {
      sessionStorage.setItem("route_points:1", JSON.stringify(points));
      getRoutePoints.mockReturnValue([]);
      initMapNew();
      expect(loadRoutePoints).toHaveBeenCalledWith(points);
    });

    test("uses the configured point limit", () => {
      document.getElementById("route-data").dataset.maxPoints = "1";
      sessionStorage.setItem("route_points:1", JSON.stringify(Array(2).fill({ lat: 0, lng: 0, address: "" })));
      getRoutePoints.mockReturnValue([]);
      initMapNew();
      expect(sessionStorage.getItem("route_points:1")).toBeNull();
    });

    test("prioritizes server points over a draft", () => {
      const points = [{ lat: 1, lng: 2, address: "サーバー" }];
      sessionStorage.setItem("route_points:1", "invalid");
      getRoutePoints.mockReturnValue(points);
      initMapNew();
      expect(loadRoutePoints).toHaveBeenCalledWith(points);
    });

    test("loads route_points from sessionStorage", () => {

      const savedPoints = [
        { lat: 10, lng: 20, address: "東京" }
      ];

      sessionStorage.setItem(
        "route_points:1",
        JSON.stringify(savedPoints)
      );

      getRoutePoints.mockReturnValue([]);

      initMapNew();

      expect(loadRoutePoints)
        .toHaveBeenCalledWith(savedPoints);
    });

    test("removes invalid route_points and continues with empty data", () => {

      sessionStorage.setItem(
        "route_points:1",
        "invalid json"
      );

      getRoutePoints.mockReturnValue([]);

      expect(() => initMapNew())
        .not.toThrow();

      expect(sessionStorage.getItem("route_points:1"))
        .toBeNull();

      expect(loadRoutePoints)
        .not.toHaveBeenCalled();

      expect(initSortable)
        .toHaveBeenCalled();

      expect(state.map.addListener)
        .toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );
    });

    test("removes empty route_points and continues with empty data", () => {

      sessionStorage.setItem(
        "route_points:1",
        ""
      );

      getRoutePoints.mockReturnValue([]);

      expect(() => initMapNew())
        .not.toThrow();

      expect(sessionStorage.getItem("route_points:1"))
        .toBeNull();

      expect(loadRoutePoints)
        .not.toHaveBeenCalled();

      expect(initSortable)
        .toHaveBeenCalled();

      expect(state.map.addListener)
        .toHaveBeenCalledWith(
          "click",
          expect.any(Function)
        );
    });
  });

  describe("map click", () => {

    test("adds a point on click and updates its address in the callback", () => {

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

    test("does not add a point when canAddPoint returns false", () => {

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

    test("preserves click order regardless of Geocoder response order", () => {

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

    test("ignores callbacks from before map reinitialization", () => {

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

    test("does not exceed nine points after rapid clicks near the limit", () => {

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
