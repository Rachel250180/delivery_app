// ui.test.js

import { updateHiddenField } from "../ui";
import { state } from "../state";

describe("updateHiddenField", () => {

  beforeEach(() => {

    document.body.innerHTML = `
      <input id="points_json">
    `;

    state.deliveryPoints = [
      {
        lat: 35.0,
        lng: 139.0,
        address: "東京"
      }
    ];

    state.isNewPage = false;
  });

  test("hidden field が更新される", () => {

    updateHiddenField();

    const input =
      document.getElementById(
        "points_json"
      );

    expect(input.value).toBe(
      JSON.stringify(state.deliveryPoints)
    );
  });
});