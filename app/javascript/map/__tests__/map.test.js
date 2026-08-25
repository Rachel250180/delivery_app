// map.test.js

import { resetMapState } from "../map";
import { createMap } from "../map";
import { state } from "../state";
import { START_POINT, DEFAULT_ZOOM } from "../constants";
import { countApi } from "../utils";

jest.mock("../utils", () => ({
  countApi: jest.fn(),
}));

describe("createMap", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    
    // map用のDOMを用意
    document.body.innerHTML = `
      <div id="map"></div>
      <script data-google-maps-script data-map-id="test-map-id"></script>
    `;

    // stateを初期化
    state.map = null;
    state.routePolylines = [];
    state.routeRequestId = 0;
    state.geocoder = null;

    // Google Maps API をモック
    global.google = {
      maps: {
        Map: jest.fn(() => ({
          setCenter: jest.fn(),
        })),

        Geocoder: jest.fn(),

        marker: {
          PinElement: jest.fn((options) => ({ ...options })),
          AdvancedMarkerElement: jest.fn((options) => ({
            ...options,
            append: jest.fn()
          }))
        },

        event: {
          trigger: jest.fn(),
        },
      },
    };
  });

  test("initializes the map", () => {

    createMap();

    // Map API が呼ばれる
    expect(countApi).toHaveBeenCalledWith("Map API");

    // Map が生成される
    expect(google.maps.Map).toHaveBeenCalledWith(
      document.getElementById("map"),
      {
        zoom: DEFAULT_ZOOM,
        center: START_POINT,
        mapId: "test-map-id",
        streetViewControl: false,
        mapTypeControl: false,
      }
    );

    // Geocoder が生成される
    expect(
      google.maps.Geocoder
    ).toHaveBeenCalled();

    // AdvancedMarkerElement が生成される
    expect(
      google.maps.marker.AdvancedMarkerElement
    ).toHaveBeenCalled();
    expect(
      google.maps.marker.PinElement
    ).toHaveBeenCalledWith({
      background: "#34A853",
      borderColor: "#137333",
      glyphColor: "#FFFFFF",
      glyphText: "S"
    });

    // resize trigger
    expect(
      google.maps.event.trigger
    ).toHaveBeenCalledWith(
      state.map,
      "resize"
    );

    // center設定
    expect(
      state.map.setCenter
    ).toHaveBeenCalledWith(START_POINT);
  });

  test("does nothing when a map already exists", () => {

    state.map = {};

    createMap();

    expect(countApi).not.toHaveBeenCalled();

    expect(
      google.maps.Map
    ).not.toHaveBeenCalled();
  });
});

describe("resetMapState", () => {

  let markers;
  let routePolyline;

  beforeEach(() => {

    markers = [
      { map: state.map },
      { map: state.map }
    ];

    state.markers = markers;

    state.deliveryPoints = [
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ];

    routePolyline = { setMap: jest.fn() };
    state.routePolylines = [routePolyline];
    state.routeRequestId = 5;
    state.mapGeneration = 7;

    state.map = {};
  });

  test("resets the map state", () => {

    resetMapState();

    markers.forEach(marker => {
      expect(marker.map).toBeNull();
    });

    expect(state.markers).toEqual([]);

    expect(state.deliveryPoints)
      .toEqual([]);

    expect(state.routePolylines).toEqual([]);
    expect(routePolyline.setMap).toHaveBeenCalledWith(null);
    expect(state.routeRequestId).toBe(6);
    expect(state.mapGeneration).toBe(8);

    expect(state.map).toBeNull();
  });
});
