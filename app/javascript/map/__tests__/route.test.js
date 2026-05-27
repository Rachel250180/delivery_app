// app/javascript/map/__tests__/route.test.js

import { drawRoute } from "../route";

import { state } from "../state";

import { START_POINT } from "../constants";

import {
  countApi
} from "../utils";

jest.mock("../utils", () => ({
  countApi: jest.fn()
}));

describe("drawRoute", () => {

  beforeEach(() => {

    jest.clearAllMocks();

    global.google = {
      maps: {
        TravelMode: {
          DRIVING: "DRIVING"
        }
      }
    };

    state.directionsRenderer = {
      setDirections: jest.fn()
    };

    state.directionsService = {
      route: jest.fn()
    };

    state.deliveryPoints = [];
  });

  test("deliveryPoints が空なら routes を空にする", () => {

    drawRoute();

    expect(
      state.directionsRenderer.setDirections
    ).toHaveBeenCalledWith({
      routes: []
    });

    expect(countApi)
      .not.toHaveBeenCalled();

    expect(
      state.directionsService.route
    ).not.toHaveBeenCalled();
  });

  test("Directions API を呼び出す", () => {

    state.deliveryPoints = [
      { lat: 35.1, lng: 139.1 },
      { lat: 35.2, lng: 139.2 }
    ];

    drawRoute();

    expect(countApi)
      .toHaveBeenCalledWith(
        "Directions API"
      );
  });

  test("route を正しい引数で呼ぶ", () => {

    state.deliveryPoints = [
      { lat: 35.1, lng: 139.1 },
      { lat: 35.2, lng: 139.2 },
      { lat: 35.3, lng: 139.3 }
    ];

    drawRoute();

    expect(
      state.directionsService.route
    ).toHaveBeenCalledWith(

      {
        origin: START_POINT,

        destination: {
          lat: 35.3,
          lng: 139.3
        },

        waypoints: [
          {
            location: {
              lat: 35.1,
              lng: 139.1
            },
            stopover: true
          },

          {
            location: {
              lat: 35.2,
              lng: 139.2
            },
            stopover: true
          }
        ],

        travelMode: "DRIVING"
      },

      expect.any(Function)
    );
  });

  test("status が OK なら setDirections を呼ぶ", () => {

    const mockResult = {
      routes: ["test"]
    };

    state.deliveryPoints = [
      { lat: 35, lng: 139 }
    ];

    state.directionsService.route
      .mockImplementation(
        (options, callback) => {

          callback(
            mockResult,
            "OK"
          );
        }
      );

    drawRoute();

    expect(
      state.directionsRenderer.setDirections
    ).toHaveBeenCalledWith(
      mockResult
    );
  });

  test("status が OK 以外なら setDirections を呼ばない", () => {

    state.deliveryPoints = [
      { lat: 35, lng: 139 }
    ];

    state.directionsService.route
      .mockImplementation(
        (options, callback) => {

          callback(
            null,
            "ERROR"
          );
        }
      );

    drawRoute();

    expect(
      state.directionsRenderer.setDirections
    ).not.toHaveBeenCalledWith(
      expect.anything()
    );
  });

});