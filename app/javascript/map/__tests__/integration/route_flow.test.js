// app/javascript/map/__tests__/integration/route_flow.test.js

import { addPoint } from "../../markers";
import { state } from "../../state";

describe("route flow integration", () => {

  beforeEach(() => {

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
    state.routeClass = {
      computeRoutes: jest.fn().mockResolvedValue({
        routes: [{
          createPolylines: () => [{ setMap: jest.fn() }]
        }]
      })
    };
  });

  test(
    "addPointするとUIとルートが更新される",
    async () => {

      addPoint({
        lat: 35,
        lng: 139,
        address: "東京都"
      });
      await Promise.resolve();

      // state更新
      expect(
        state.deliveryPoints
      ).toEqual([
        {
          lat: 35,
          lng: 139,
          address: "東京都"
        }
      ]);

      // marker作成
      expect(
        state.markers.length
      ).toBe(1);

      // hidden更新
      expect(
        document.getElementById(
          "points_json"
        ).value
      ).toBe(
        JSON.stringify([
          {
            lat: 35,
            lng: 139,
            address: "東京都"
          }
        ])
      );

      // リスト描画
      expect(
        document.querySelectorAll(
          ".delivery-item"
        ).length
      ).toBe(1);

      expect(
        document.querySelector(
          ".delivery-item__address"
        ).textContent
      ).toBe("東京都");

      // Route.computeRoutes実行確認
      expect(
        state.routeClass.computeRoutes
      ).toHaveBeenCalledTimes(1);

      expect(state.routePolylines).toHaveLength(1);
    }
  );
});
