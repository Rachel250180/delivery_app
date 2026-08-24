import {
  clearRoutePolylines,
  drawRoute
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
  });

  test("deliveryPoints が空なら既存Polylineだけを消す", async () => {
    const oldPolyline = { setMap: jest.fn() };
    state.routePolylines = [oldPolyline];

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([]);
    expect(state.routeClass.computeRoutes).not.toHaveBeenCalled();
    expect(countApi).not.toHaveBeenCalled();
  });

  test("Route.computeRoutes を最小フィールドと地点順で呼ぶ", async () => {
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
      fields: ["path"]
    });
  });

  test("createPolylines で生成した経路線をMapへ表示する", async () => {
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(route.createPolylines).toHaveBeenCalledTimes(1);
    expect(state.routePolylines).toEqual([polyline]);
    expect(polyline.setMap).toHaveBeenCalledWith(state.map);
  });

  test("再描画前に古いPolylineをMapから外す", async () => {
    const oldPolyline = { setMap: jest.fn() };
    state.routePolylines = [oldPolyline];
    state.deliveryPoints = [{ lat: 35, lng: 139 }];

    await drawRoute();

    expect(oldPolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([polyline]);
  });

  test("古いレスポンスは最新のPolylineを上書きしない", async () => {
    let finishFirstRequest;
    const initialPolyline = { setMap: jest.fn() };
    const stalePolyline = { setMap: jest.fn() };
    const latestPolyline = { setMap: jest.fn() };
    const staleRoute = {
      createPolylines: jest.fn(() => [stalePolyline])
    };
    const latestRoute = {
      createPolylines: jest.fn(() => [latestPolyline])
    };
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

    finishFirstRequest({ routes: [staleRoute] });
    await firstRequest;

    expect(staleRoute.createPolylines).not.toHaveBeenCalled();
    expect(latestPolyline.setMap).not.toHaveBeenCalledWith(null);
    expect(state.routePolylines).toEqual([latestPolyline]);
  });
});

describe("clearRoutePolylines", () => {
  test("すべてのPolylineをMapから外す", () => {
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
