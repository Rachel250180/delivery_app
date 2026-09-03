import { initMapShow } from "../../pages";
import { state } from "../../state";
import { START_POINT } from "../../constants";

describe("route search map flow", () => {
  const searchedPoint = {
    lat: 36.2912,
    lng: 139.3754,
    address: "由良町1423"
  };

  beforeEach(() => {
    jest.useFakeTimers();

    document.body.innerHTML = `
      <div id="map"></div>
      <div id="route-duration">計算中...</div>
      <div id="route-distance">計算中...</div>
      <div id="route-data" data-map-mode="show"
        data-points='[{"lat":36,"lng":139,"address":"地点A"},{"lat":36.2912,"lng":139.3754,"address":"由良町1423"}]'>
      </div>
    `;

    global.google = {
      maps: {
        Map: jest.fn(() => ({
          setCenter: jest.fn()
        })),
        Geocoder: jest.fn(),
        event: { trigger: jest.fn() },
        marker: {
          PinElement: jest.fn((options) => ({ ...options })),
          AdvancedMarkerElement: jest.fn((options) => ({
            ...options,
            append: jest.fn()
          }))
        }
      }
    };

    state.map = null;
    state.markers = [];
    state.deliveryPoints = [];
    state.routePolylines = [];
    state.routeRequestId = 0;
    state.routeClass = {
      computeRoutes: jest.fn().mockResolvedValue({
        routes: [{
          durationMillis: 1920000,
          distanceMeters: 14900,
          createPolylines: () => [{ setMap: jest.fn() }]
        }]
      })
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test("loads searched points and computes a route to the searched address", async () => {
    initMapShow();
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    expect(state.deliveryPoints).toEqual([
      { lat: 36, lng: 139, address: "地点A" },
      searchedPoint
    ]);
    expect(google.maps.marker.AdvancedMarkerElement)
      .toHaveBeenCalledTimes(3);
    expect(state.routeClass.computeRoutes).toHaveBeenCalledWith({
      origin: { lat: START_POINT.lat, lng: START_POINT.lng },
      destination: { lat: searchedPoint.lat, lng: searchedPoint.lng },
      intermediates: [{ location: { lat: 36, lng: 139 } }],
      travelMode: "DRIVING",
      fields: ["path", "durationMillis", "distanceMeters"]
    });
    expect(state.routeClass.computeRoutes).toHaveBeenCalledTimes(1);
    expect(document.getElementById("route-duration").textContent)
      .toBe("約32分");
    expect(document.getElementById("route-distance").textContent)
      .toBe("約14.9km");
  });
});
