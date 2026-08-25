import { state } from "../state";
import { updatePointAddress } from "../markers";
import { refreshUI } from "../ui";

jest.mock("../ui", () => ({
  refreshUI: jest.fn()
}));

describe("updatePointAddress", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("updates only the selected point and its marker address", () => {
    const first = { lat: 1, lng: 2, address: "" };
    const second = { lat: 3, lng: 4, address: "" };
    const firstMarker = { title: "" };
    const secondMarker = { title: "" };

    state.deliveryPoints = [first, second];
    state.markers = [firstMarker, secondMarker];

    updatePointAddress(second, "東京都");

    expect(first.address).toBe("");
    expect(firstMarker.title).toBe("");
    expect(second.address).toBe("東京都");
    expect(secondMarker.title).toBe("東京都");
    expect(refreshUI).toHaveBeenCalledTimes(1);
  });

  test("does not update a point that has already been removed", () => {
    const removedPoint = { lat: 1, lng: 2, address: "" };
    state.deliveryPoints = [];
    state.markers = [];

    updatePointAddress(removedPoint, "古い住所");

    expect(removedPoint.address).toBe("");
    expect(refreshUI).not.toHaveBeenCalled();
  });
});
