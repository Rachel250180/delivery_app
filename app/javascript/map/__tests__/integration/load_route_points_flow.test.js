import {
  loadRoutePoints
} from "../../markers";

import { state } from "../../state";

describe("load route points flow", () => {

  beforeEach(() => {

    jest.useFakeTimers();

    document.body.innerHTML = `
      <input id="points_json">

      <div
        id="points-list"
        data-editable="true">
      </div>

      <template id="delivery-item-template">
        <div class="delivery-item">
          <span class="delivery-item__number"></span>
          <span class="delivery-item__address"></span>

          <button
            class="delivery-item__delete-btn">
          </button>
        </div>
      </template>
    `;

    state.deliveryPoints = [];
    state.markers = [];

    state.isInitializing = false;
    state.isNewPage = false;

    global.google = {
      maps: {
        marker: {
          PinElement: jest.fn((options) => ({ ...options })),
          AdvancedMarkerElement: jest.fn((options) => ({
            ...options,
            append: jest.fn()
          }))
        },

        TravelMode: {
          DRIVING: "DRIVING"
        }
      }
    };

    state.map = {};

    state.routePolylines = [];
    state.routeRequestId = 0;
    state.mapGeneration = 0;
    state.routeClass = {
      computeRoutes: jest.fn().mockResolvedValue({
        routes: [{
          createPolylines: () => [{ setMap: jest.fn() }]
        }]
      })
    };
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test(
    "loadRoutePointsで地点を復元できる",
    async () => {

      loadRoutePoints([
        {
          lat: 35,
          lng: 139,
          address: "東京"
        },
        {
          lat: 36,
          lng: 140,
          address: "大阪"
        }
      ]);
      jest.advanceTimersByTime(150);
      await Promise.resolve();

      // state復元
      expect(
        state.deliveryPoints
      ).toEqual([
        {
          lat: 35,
          lng: 139,
          address: "東京"
        },
        {
          lat: 36,
          lng: 140,
          address: "大阪"
        }
      ]);

      // marker復元
      expect(
        state.markers.length
      ).toBe(2);

      // hidden更新
      expect(
        document
          .getElementById("points_json")
          .value
      ).toContain("東京");

      // リスト描画
      expect(
        document.querySelectorAll(
          ".delivery-item"
        ).length
      ).toBe(2);

      // route描画
      expect(state.routeClass.computeRoutes).toHaveBeenCalledTimes(1);

      expect(state.routePolylines).toHaveLength(1);
    }
  );
});
