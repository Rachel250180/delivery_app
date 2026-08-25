// utils.test.js

import {
  apiCounter,
  countApi,
  getPointLabel,
  formatLatLng,
  canAddPoint
} from "../utils";

import { state } from "map/state";

jest.mock("map/state", () => ({
  state: {
    deliveryPoints: []
  }
}));

describe("utils.js", () => {

  beforeEach(() => {

    jest.clearAllMocks();

    Object.keys(apiCounter)
      .forEach(key => {
        delete apiCounter[key];
      });
  });

  describe("countApi", () => {

    test("counts API calls", () => {

      console.log = jest.fn();

      countApi("Map API");
      countApi("Map API");

      expect(
        apiCounter["Map API"]
      ).toBe(2);

      expect(console.log)
        .toHaveBeenCalledWith(
          "Map API: 2回"
        );
    });
  });

  describe("getPointLabel", () => {

    test("returns the address when present", () => {

      const point = {
        address: "東京都"
      };

      const result =
        getPointLabel(point);

      expect(result)
        .toBe("東京都");
    });

    test("returns formatted coordinates when the address is missing", () => {

      const point = {
        lat: 35.123456,
        lng: 139.987654
      };

      const result =
        getPointLabel(point);

      expect(result)
        .toBe(
          "35.12346, 139.98765"
        );
    });
  });

  describe("formatLatLng", () => {

    test("formats coordinates to five decimal places", () => {

      const point = {
        lat: 35.1234567,
        lng: 139.9876543
      };

      const result =
        formatLatLng(point);

      expect(result)
        .toBe(
          "35.12346, 139.98765"
        );
    });
  });

  describe("canAddPoint", () => {

    beforeEach(() => {

      document.body.innerHTML = `
        <div id="route-data" data-max-points="5"></div>
      `;
    });

    test("returns true when below the server-provided limit", () => {

      state.deliveryPoints = [
        {},
        {}
      ];

      const result =
        canAddPoint();

      expect(result)
        .toBe(true);
    });

    test("returns false when at or above the server-provided limit", () => {

      window.alert = jest.fn();

      state.deliveryPoints =
        Array(5).fill({});

      const result =
        canAddPoint();

      expect(window.alert)
        .toHaveBeenCalledWith(
          "最大5地点までです"
        );

      expect(result)
        .toBe(false);
    });
  });
});
