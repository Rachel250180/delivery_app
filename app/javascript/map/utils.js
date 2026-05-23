// utils.js

import { state } from "map/state";

import {
  MAX_POINTS
} from "map/constants";


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

  if (
    state.deliveryPoints.length
      >= MAX_POINTS
  ) {

    alert(
      `最大${MAX_POINTS}地点までです`
    );

    return false;
  }

  return true;
}