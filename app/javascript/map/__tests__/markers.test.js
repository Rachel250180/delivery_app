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

  test("指定した地点と対応するMarkerだけの住所を更新する", () => {
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

  test("既に削除された地点は更新しない", () => {
    const removedPoint = { lat: 1, lng: 2, address: "" };
    state.deliveryPoints = [];
    state.markers = [];

    updatePointAddress(removedPoint, "古い住所");

    expect(removedPoint.address).toBe("");
    expect(refreshUI).not.toHaveBeenCalled();
  });
});
