// map.test.js

import { resetMapState } from "../resetMapState";
import { createMap } from "../map";
import { state } from "../state";
import { START_POINT, DEFAULT_ZOOM } from "../constants";
import { countApi } from "../utils";

jest.mock("../utils", () => ({
  countApi: jest.fn(),
}));

describe("createMap", () => {

  beforeEach(() => {

    // map用のDOMを用意
    document.body.innerHTML = `
      <div id="map"></div>
    `;

    // stateを初期化
    state.map = null;
    state.directionsService = null;
    state.directionsRenderer = null;
    state.geocoder = null;

    // Google Maps API をモック
    global.google = {
      maps: {
        Map: jest.fn(() => ({
          setCenter: jest.fn(),
        })),

        DirectionsService: jest.fn(),

        DirectionsRenderer: jest.fn(() => ({
          setMap: jest.fn(),
        })),

        Geocoder: jest.fn(),

        Marker: jest.fn(),

        event: {
          trigger: jest.fn(),
        },
      },
    };
  });

  test("地図を初期化できる", () => {

    createMap();

    // Map API が呼ばれる
    expect(countApi).toHaveBeenCalledWith("Map API");

    // Map が生成される
    expect(google.maps.Map).toHaveBeenCalledWith(
      document.getElementById("map"),
      {
        zoom: DEFAULT_ZOOM,
        center: START_POINT,
        streetViewControl: false,
        mapTypeControl: false,
      }
    );

    // DirectionsService が生成される
    expect(
      google.maps.DirectionsService
    ).toHaveBeenCalled();

    // DirectionsRenderer が生成される
    expect(
      google.maps.DirectionsRenderer
    ).toHaveBeenCalledWith({
      suppressMarkers: true,
    });

    // Geocoder が生成される
    expect(
      google.maps.Geocoder
    ).toHaveBeenCalled();

    // Marker が生成される
    expect(
      google.maps.Marker
    ).toHaveBeenCalled();

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

  test("すでに map が存在する場合は何もしない", () => {

    state.map = {};

    createMap();

    expect(countApi).not.toHaveBeenCalled();

    expect(
      google.maps.Map
    ).not.toHaveBeenCalled();
  });
});

describe("resetMapState", () => {

  beforeEach(() => {

    const marker1 = {
      setMap: jest.fn(),
    };

    const marker2 = {
      setMap: jest.fn(),
    };

    state.markers = [marker1, marker2];

    state.deliveryPoints = [
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ];

    state.directionsRenderer = {
      setDirection: jest.fn(),
    };

    state.map = {};
});

test("地図状態をリセットできる", () => {

  resetMapState();

  // marker削除
  state.markers.forEach(marker => {
    expect(marker.setMap)
      .toHaveBeenCalledWith(null);
  });

    // markers初期化
    expect(state.markers).toEqual([]);

    // deliveryPoints初期化
    expect(state.deliveryPoints)
      .toEqual([]);

    // directions削除
    expect(
      state.directionsRenderer.setDirections
    ).toHaveBeenCalledWith({
      routes: []
    });

    // map初期化
    expect(state.map).toBeNull();
  });

  test("directionsRenderer が無くても落ちない", () => {

    state.directionsRenderer = null;

    expect(() => {
      resetMapState();
    }).not.toThrow();

  });
});