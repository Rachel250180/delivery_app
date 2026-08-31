import {
  clearRoutePolylines,
  drawRoute,
  formatDistance,
  formatDuration
} from "../route";
import { state } from "../state";
import { START_POINT } from "../constants";
import { countApi } from "../utils";

jest.mock("../utils", () => ({ countApi: jest.fn() }));

describe("drawRoute", () => {
  let polyline;
  let route;

  beforeEach(() => {
    jest.clearAllMocks();
    polyline = { setMap: jest.fn() };
    route = { createPolylines: jest.fn(() => [polyline]) };
    state.map = {};
    state.routeClass = {
      computeRoutes: jest.fn().mockResolvedValue({ routes: [route] })
    };
    state.routePolylines = [];
    state.routeRequestId = 0;
    state.deliveryPoints = [];
    document.body.innerHTML = "";
  });

  test("clears existing polylines when deliveryPoints is empty", async () => {
    const oldPolyline = { setMap: jest.fn() };
    state.routePolylines = [oldPolyline];

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([]);
    expect(state.routeClass.computeRoutes).not.toHaveBeenCalled();
    expect(countApi).not.toHaveBeenCalled();
  });

  test("calls Route.computeRoutes with minimal fields and point order", async () => {
    state.deliveryPoints = [
      { lat: 35.1, lng: 139.1 },
      { lat: 35.2, lng: 139.2 },
      { lat: 35.3, lng: 139.3 }
    ];

    await drawRoute();

    expect(countApi).toHaveBeenCalledWith("Routes API");
    expect(state.routeClass.computeRoutes).toHaveBeenCalledWith({
      origin: { lat: START_POINT.lat, lng: START_POINT.lng },
      destination: { lat: 35.3, lng: 139.3 },
      intermediates: [
        { location: { lat: 35.1, lng: 139.1 } },
        { location: { lat: 35.2, lng: 139.2 } }
      ],
      travelMode: "DRIVING",
      fields: ["path", "durationMillis", "distanceMeters"]
    });
    expect(state.routeClass.computeRoutes).toHaveBeenCalledTimes(1);
  });

  test("displays polylines created by createPolylines on the map", async () => {
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(route.createPolylines).toHaveBeenCalledTimes(1);
    expect(state.routePolylines).toEqual([polyline]);
    expect(polyline.setMap).toHaveBeenCalledWith(state.map);
  });

  test("removes old polylines from the map before redrawing", async () => {
    const oldPolyline = { setMap: jest.fn() };
    state.routePolylines = [oldPolyline];
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([polyline]);
  });

  test("does not let stale responses overwrite the latest polylines", async () => {
    let finishFirstRequest;
    const initialPolyline = { setMap: jest.fn() };
    const stalePolyline = { setMap: jest.fn() };
    const latestPolyline = { setMap: jest.fn() };
    const staleRoute = {
      durationMillis: 60000,
      distanceMeters: 1000,
      createPolylines: jest.fn(() => [stalePolyline])
    };
    const latestRoute = {
      durationMillis: 120000,
      distanceMeters: 2000,
      createPolylines: jest.fn(() => [latestPolyline])
    };
    addRouteSummaryElements();
    state.routePolylines = [initialPolyline];
    state.routeClass.computeRoutes
      .mockImplementationOnce(() => new Promise((resolve) => {
        finishFirstRequest = resolve;
      }))
      .mockResolvedValueOnce({ routes: [latestRoute] });
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    const firstRequest = drawRoute();
    const secondRequest = drawRoute();
    await secondRequest;

    expect(initialPolyline.setMap).toHaveBeenCalledTimes(1);
    expect(initialPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([latestPolyline]);
    expect(latestPolyline.setMap).toHaveBeenCalledWith(state.map);
    expect(document.getElementById("route-duration").textContent)
      .toBe("約2分");
    expect(document.getElementById("route-distance").textContent)
      .toBe("約2.0km");

    finishFirstRequest({ routes: [staleRoute] });
    await firstRequest;

    expect(staleRoute.createPolylines).not.toHaveBeenCalled();
    expect(latestPolyline.setMap).not.toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([latestPolyline]);
    expect(document.getElementById("route-duration").textContent)
      .toBe("約2分");
    expect(document.getElementById("route-distance").textContent)
      .toBe("約2.0km");
  });

  test("clears existing polylines when the latest request fails", async () => {
    const oldPolyline = { setMap: jest.fn() };
    const error = new Error("Routes API error");
    state.routePolylines = [oldPolyline];
    state.routeClass.computeRoutes.mockRejectedValue(error);
    state.deliveryPoints = [{ lat: 35, lng: 139 }];
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
    addRouteSummaryElements();

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([]);
    expect(window.alert).toHaveBeenCalledWith("経路を取得できませんでした");
    expect(document.getElementById("route-duration").textContent)
      .toBe("取得できませんでした");
    expect(document.getElementById("route-distance").textContent)
      .toBe("取得できませんでした");
  });

  test("does not let a stale failure affect the latest polylines", async () => {
    let failFirstRequest;
    const latestPolyline = { setMap: jest.fn() };
    const latestRoute = {
      createPolylines: jest.fn(() => [latestPolyline])
    };
    state.routeClass.computeRoutes
      .mockImplementationOnce(() => new Promise((resolve, reject) => {
        failFirstRequest = reject;
      }))
      .mockResolvedValueOnce({ routes: [latestRoute] });
    state.deliveryPoints = [{ lat: 35, lng: 139 }];
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});

    const firstRequest = drawRoute();
    await drawRoute();
    failFirstRequest(new Error("stale Routes API error"));
    await firstRequest;

    expect(latestPolyline.setMap).not.toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([latestPolyline]);
    expect(window.alert).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  test("clears existing polylines when the latest response has no routes", async () => {
    const oldPolyline = { setMap: jest.fn() };
    state.routePolylines = [oldPolyline];
    state.routeClass.computeRoutes.mockResolvedValue({ routes: [] });
    state.deliveryPoints = [{ lat: 35, lng: 139 }];
    jest.spyOn(window, "alert").mockImplementation(() => {});
    addRouteSummaryElements();

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([]);
    expect(window.alert).toHaveBeenCalledWith("経路を取得できませんでした");
    expect(document.getElementById("route-duration").textContent)
      .toBe("取得できませんでした");
    expect(document.getElementById("route-distance").textContent)
      .toBe("取得できませんでした");
  });

  test("shows unavailable only for a missing duration", async () => {
    route.distanceMeters = 14900;
    addRouteSummaryElements();
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(document.getElementById("route-duration").textContent)
      .toBe("取得できませんでした");
    expect(document.getElementById("route-distance").textContent)
      .toBe("約14.9km");
  });

  test("shows unavailable only for a missing distance", async () => {
    route.durationMillis = 1920000;
    addRouteSummaryElements();
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(document.getElementById("route-duration").textContent)
      .toBe("約32分");
    expect(document.getElementById("route-distance").textContent)
      .toBe("取得できませんでした");
  });

  test("does not fail when route summary elements are absent", async () => {
    route.durationMillis = 1920000;
    route.distanceMeters = 14900;
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await expect(drawRoute()).resolves.toBeUndefined();

    expect(route.createPolylines).toHaveBeenCalledTimes(1);
  });
});

describe("route summary formatters", () => {
  test("formats duration in minutes and hours", () => {
    expect(formatDuration(1920000)).toBe("約32分");
    expect(formatDuration(4500000)).toBe("約1時間15分");
  });

  test("formats meters as kilometers with one decimal place", () => {
    expect(formatDistance(14900)).toBe("約14.9km");
  });

  test("rejects missing and non-finite values", () => {
    expect(formatDuration(undefined)).toBeNull();
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBeNull();
    expect(formatDistance(undefined)).toBeNull();
    expect(formatDistance(Number.NaN)).toBeNull();
  });
});

function addRouteSummaryElements() {
  document.body.innerHTML = `
    <div id="route-duration">計算中...</div>
    <div id="route-distance">計算中...</div>
  `;
}

describe("clearRoutePolylines", () => {
  test("removes all polylines from the map", () => {
    const polylines = [
      { setMap: jest.fn() },
      { setMap: jest.fn() }
    ];
    state.routePolylines = polylines;

    clearRoutePolylines();

    polylines.forEach(polyline => {
      expect(polyline.setMap).toHaveBeenCalledWith(null);
    });
    expect(state.routePolylines).toEqual([]);
  });
});
