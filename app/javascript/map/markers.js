// markers.js

import { state } from "map/state";
import { refreshUI } from "map/ui";
import { DELIVERY_MARKER_COLORS } from "map/constants";


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

  const pin = new google.maps.marker.PinElement({
    ...DELIVERY_MARKER_COLORS,
    glyphText: String(index + 1)
  });

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat, lng },
    map: state.map,
    title: point.address || ""
  });

  marker.append(pin);
  marker.deliveryPin = pin;

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

  state.markers[index].map = null;

  state.markers.splice(index, 1);

  state.deliveryPoints.splice(index, 1);

  refreshUI();
}


// マーカー順序変更
export function movePoint(oldIndex,  newIndex) {
  if (oldIndex < 0 ||  newIndex < 0) { return;}

  moveArrayItem(
    state.markers,
    oldIndex,
    newIndex
  );

  moveArrayItem(
    state.deliveryPoints,
    oldIndex,
    newIndex
  );

  refreshUI();
}

function moveArrayItem(array, from, to) {
  const item = array.splice(from, 1)[0];
  array.splice(to, 0, item);
}


// マーカー番号更新
export function renumberMarkers() {

  state.markers.forEach(
    (marker, i) => {

      marker.deliveryPin.glyphText =
        String(i + 1);
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
