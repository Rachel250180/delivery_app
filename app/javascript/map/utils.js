// utils.js

import { state } from "map/state";

// API回数チェック
export const apiCounter = {};

export function countApi(name) {

  apiCounter[name] =
    (apiCounter[name] || 0) + 1;

  console.log(
    `${name}: ${apiCounter[name]}回`
  );
}


// 住所表示
export function getPointLabel(point) {

  if (point.address) {
    return point.address;
  }

  return formatLatLng(point);
}


// 座標表示
export function formatLatLng(point) {

  return (
    `${point.lat.toFixed(5)}, ` +
    `${point.lng.toFixed(5)}`
  );
}


// 経由地点上限チェック
export function canAddPoint() {

  const maxPoints = getMaxPoints();

  if (
    state.deliveryPoints.length
      >= maxPoints
  ) {

    alert(
      `最大${maxPoints}地点までです`
    );

    return false;
  }

  return true;
}

function getMaxPoints() {

  const routeData =
    document.getElementById("route-data");

  return Number(routeData?.dataset.maxPoints);
}
