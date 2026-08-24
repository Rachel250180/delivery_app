import {
  addPoint,
  removePoint
} from "../../markers";

import { state } from "../../state";

describe("remove point flow", () => {

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
    "removePointで状態とUIが更新される",
    async () => {

      addPoint({
        lat: 35,
        lng: 139,
        address: "東京"
      });

      addPoint({
        lat: 36,
        lng: 140,
        address: "大阪"
      });

      const firstMarker =
        state.markers[0];

      removePoint(0);
      await Promise.resolve();

      // marker削除
      expect(firstMarker.map).toBeNull();
      expect(state.markers[0].deliveryPin.glyphText).toBe("1");

      // state更新
      expect(
        state.deliveryPoints
      ).toEqual([
        {
          lat: 36,
          lng: 140,
          address: "大阪"
        }
      ]);

      // hidden更新
      expect(
        document
          .getElementById("points_json")
          .value
      ).toBe(
        JSON.stringify([
          {
            lat: 36,
            lng: 140,
            address: "大阪"
          }
        ])
      );

      // リスト再描画
      expect(
        document.querySelectorAll(
          ".delivery-item"
        ).length
      ).toBe(1);

      expect(
        document.querySelector(
          ".delivery-item__address"
        ).textContent
      ).toBe("大阪");

      // ルート再計算
      expect(
        state.routeClass.computeRoutes
      ).toHaveBeenCalled();
    }
  );
});
