import { fetchAddress } from "../geocoder";
import { state } from "../state";

describe("fetchAddress", () => {
  beforeEach(() => {
    state.mapGeneration = 1;
    state.geocoder = {
      geocode: jest.fn()
    };
  });

  test("returns the address when the generation is unchanged", () => {
    const callback = jest.fn();

    fetchAddress(35, 139, callback, 1);
    const geocoderCallback =
      state.geocoder.geocode.mock.calls[0][1];

    geocoderCallback(
      [{ formatted_address: "東京都" }],
      "OK"
    );

    expect(callback).toHaveBeenCalledWith("東京都");
  });

  test("does not invoke the callback when the generation changes", () => {
    const callback = jest.fn();

    fetchAddress(35, 139, callback, 1);
    const geocoderCallback =
      state.geocoder.geocode.mock.calls[0][1];

    state.mapGeneration = 2;
    geocoderCallback(
      [{ formatted_address: "古い住所" }],
      "OK"
    );

    expect(callback).not.toHaveBeenCalled();
  });
});
