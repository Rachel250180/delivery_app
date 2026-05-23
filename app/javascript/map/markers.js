// markers.js

import { state } from "map/state";
import { refreshUI } from "map/ui";


// ポイント追加
export function addPoint(point) {

  const lat =
    typeof point.lat === "function"
      ? point.lat()
      : point.lat;

  const lng =
    typeof point.lng === "function"
      ? point.lng()
      : point.lng;

  const index =
    state.markers.length;

  const marker =
    new google.maps.Marker({
      position: { lat, lng },
      map: state.map,
      label: String(index + 1),
    });

  state.markers.push(marker);

  state.deliveryPoints.push({
    lat,
    lng,
    address: point.address || ""
  });

  // 初期読み込み中は更新しない
  if (!state.isInitializing) {
    refreshUI();
  }
}


// マーカー削除
export function removePoint(index) {

  state.markers[index].setMap(null);

  state.markers.splice(index, 1);

  state.deliveryPoints.splice(index, 1);

  refreshUI();
}


// マーカー順序変更
export function movePoint(
  oldIndex,
  newIndex
) {

  if (
    oldIndex < 0 ||
    newIndex < 0
  ) {
    return;
  }

  const marker =
    state.markers.splice(
      oldIndex,
      1
    )[0];

  state.markers.splice(
    newIndex,
    0,
    marker
  );

  const point =
    state.deliveryPoints.splice(
      oldIndex,
      1
    )[0];

  state.deliveryPoints.splice(
    newIndex,
    0,
    point
  );

  refreshUI();
}


// マーカー番号更新
export function renumberMarkers() {

  state.markers.forEach(
    (marker, i) => {

      marker.setLabel(
        String(i + 1)
      );
    }
  );
}


// 登録地点読み込み
export function loadRoutePoints(
  routePoints
) {

  state.isInitializing = true;

  routePoints.forEach(
    (routePoint) => {

      addPoint({
        lat: Number(routePoint.lat),
        lng: Number(routePoint.lng),
        address:
          routePoint.address
      });
    }
  );

  state.isInitializing = false;

  refreshUI();
}