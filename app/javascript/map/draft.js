import { getMaxPoints } from "map/utils";

export function getDraftKey() {
  const townId = document.getElementById("route-data")?.dataset.townId;
  return townId ? `route_points:${townId}` : null;
}

export function isValidDraft(points) {
  return Array.isArray(points) &&
    points.length <= getMaxPoints() &&
    points.every(point =>
      point !== null &&
      typeof point === "object" &&
      !Array.isArray(point) &&
      Number.isFinite(point.lat) &&
      point.lat >= -90 && point.lat <= 90 &&
      Number.isFinite(point.lng) &&
      point.lng >= -180 && point.lng <= 180 &&
      typeof point.address === "string"
    );
}
