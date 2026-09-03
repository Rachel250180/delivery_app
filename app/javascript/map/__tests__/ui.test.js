// ui.test.js

import {
  renderList,
  refreshUI,
  updateHiddenField,
  initSortable,
  getRoutePoints
} from "../ui";

import { state } from "map/state";

import { drawRoute } from "map/route";

import {
  renumberMarkers,
  removePoint,
  movePoint
} from "map/markers";

import {
  getPointLabel
} from "map/utils";

jest.mock("map/state", () => ({
  state: {
    deliveryPoints: [],
    isInitializing: false,
    isNewPage: false
  }
}));

jest.mock("map/route", () => ({
  drawRoute: jest.fn()
}));

jest.mock("map/markers", () => ({
  renumberMarkers: jest.fn(),
  removePoint: jest.fn(),
  movePoint: jest.fn()
}));

jest.mock("map/utils", () => ({
  getPointLabel: jest.fn()
}));

describe("ui.js", () => {

  beforeEach(() => {

    document.body.innerHTML = `
      <div
        id="points-list"
        data-editable="true">
      </div>

      <template id="delivery-item-template">
        <div class="delivery-item">
          <span class="delivery-item__number"></span>
          <span class="delivery-item__address"></span>
          <button class="delivery-item__delete-btn">
            削除
          </button>
        </div>
      </template>

      <input id="points_json" />

      <div
        id="route-data"
        data-points='[{"lat":35,"lng":139}]'>
      </div>
    `;

    state.deliveryPoints = [];
    state.isInitializing = false;
    state.isNewPage = false;
    state.mapGeneration = 0;

    jest.clearAllMocks();
  });

  describe("renderList", () => {

    test("renders deliveryPoints in the list", () => {

      state.deliveryPoints = [
        {
          lat: 35,
          lng: 139
        },
        {
          lat: 36,
          lng: 140
        }
      ];

      getPointLabel
        .mockReturnValue("東京");

      renderList();

      const items =
        document.querySelectorAll(
          ".delivery-item"
        );

      expect(items.length)
        .toBe(2);

      expect(
        items[0].querySelector(
          ".delivery-item__number"
        ).textContent
      ).toBe("1");

      expect(
        items[0].querySelector(
          ".delivery-item__address"
        ).textContent
      ).toBe("東京");
    });

    test("calls removePoint when the delete button is clicked", () => {

      state.deliveryPoints = [
        {
          lat: 35,
          lng: 139
        }
      ];

      getPointLabel
        .mockReturnValue("東京");

      renderList();

      const deleteBtn =
        document.querySelector(
          ".delivery-item__delete-btn"
        );

      deleteBtn.click();

      expect(removePoint)
        .toHaveBeenCalledWith(0);
    });

    test("does nothing when points-list is missing", () => {

      document.body.innerHTML = "";

      expect(() => {
        renderList();
      }).not.toThrow();
    });
  });

  describe("refreshUI", () => {

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    test("updates the UI", () => {

      state.deliveryPoints = [
        {
          lat: 35,
          lng: 139
        }
      ];

      getPointLabel
        .mockReturnValue("東京");

      refreshUI();

      expect(drawRoute)
        .not.toHaveBeenCalled();

      jest.advanceTimersByTime(150);

      expect(renumberMarkers)
        .toHaveBeenCalled();

      expect(drawRoute)
        .toHaveBeenCalled();
    });

    test("does not draw the route while initializing", () => {

      state.isInitializing = true;

      refreshUI();

      expect(drawRoute)
        .not.toHaveBeenCalled();
    });

    test("debounces consecutive route recalculations", () => {

      refreshUI();
      refreshUI();
      refreshUI();

      expect(drawRoute)
        .not.toHaveBeenCalled();

      jest.advanceTimersByTime(150);

      expect(drawRoute)
        .toHaveBeenCalledTimes(1);
    });

    test("can update the UI without recalculating the route", () => {

      refreshUI({ recalculateRoute: false });

      jest.advanceTimersByTime(150);

      expect(renumberMarkers)
        .toHaveBeenCalled();

      expect(drawRoute)
        .not.toHaveBeenCalled();
    });
  });

  describe("updateHiddenField", () => {

    test("updates the hidden field", () => {

      state.deliveryPoints = [
        {
          lat: 35,
          lng: 139
        }
      ];

      updateHiddenField();

      const input =
        document.getElementById(
          "points_json"
        );

      expect(input.value)
        .toBe(
          JSON.stringify(
            state.deliveryPoints
          )
        );
    });

    test("saves to sessionStorage on a new page", () => {

      state.isNewPage = true;

      state.deliveryPoints = [
        {
          lat: 35,
          lng: 139
        }
      ];

      const setItemSpy =
        jest.spyOn(
          Storage.prototype,
          "setItem"
        );

      updateHiddenField();

      expect(setItemSpy)
        .toHaveBeenCalledWith(
          "route_points",
          JSON.stringify(
            state.deliveryPoints
          )
        );
    });
  });

  describe("initSortable", () => {

    test("initializes Sortable", () => {

      global.Sortable = jest.fn();

      initSortable();

      expect(Sortable)
        .toHaveBeenCalled();
    });

    test("calls movePoint after sorting", () => {

      let sortableOptions;

      global.Sortable = jest.fn(
        (el, options) => {
          sortableOptions = options;
        }
      );

      initSortable();

      sortableOptions.onEnd({
        oldDraggableIndex: 0,
        newDraggableIndex: 1
      });

      expect(movePoint)
        .toHaveBeenCalledWith(0, 1);
    });

    test("does nothing when points-list is missing", () => {

      document.body.innerHTML = "";

      global.Sortable = jest.fn();

      initSortable();

      expect(Sortable)
        .not.toHaveBeenCalled();
    });
  });

  describe("getRoutePoints", () => {

    test("gets points from route-data", () => {

      const result =
        getRoutePoints();

      expect(result)
        .toEqual([
          {
            lat: 35,
            lng: 139
          }
        ]);
    });

    test("returns an empty array when route-data is missing", () => {

      document.body.innerHTML = "";

      const result =
        getRoutePoints();

      expect(result)
        .toEqual([]);
    });
  });
});
