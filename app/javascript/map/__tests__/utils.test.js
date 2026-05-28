// utils.test.js

import {
  apiCounter,
  countApi,
  getPointLabel,
  formatLatLng,
  canAddPoint
} from "../utils";

import { state } from "map/state";

import {
  MAX_POINTS
} from "map/constants";

jest.mock("map/state", () => ({
  state: {
    deliveryPoints: []
  }
}));

jest.mock("map/constants", () => ({
  MAX_POINTS: 5
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

    test("API回数をカウントする", () => {

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

    test("address があれば address を返す", () => {

      const point = {
        address: "東京都"
      };

      const result =
        getPointLabel(point);

      expect(result)
        .toBe("東京都");
    });

    test("address が無ければ formatLatLng の形式を返す", () => {

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

    test("緯度経度を小数点5桁で返す", () => {

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

    test("MAX_POINTS 未満なら true", () => {

      state.deliveryPoints = [
        {},
        {}
      ];

      const result =
        canAddPoint();

      expect(result)
        .toBe(true);
    });

    test("MAX_POINTS 以上なら false", () => {

      window.alert = jest.fn();

      state.deliveryPoints =
        Array(MAX_POINTS).fill({});

      const result =
        canAddPoint();

      expect(window.alert)
        .toHaveBeenCalledWith(
          `最大${MAX_POINTS}地点までです`
        );

      expect(result)
        .toBe(false);
    });
  });
});