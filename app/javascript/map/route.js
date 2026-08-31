// route.js

import { state } from "map/state";
import { START_POINT } from "map/constants";
import { countApi } from "map/utils";

const UNAVAILABLE_TEXT = "取得できませんでした";
const CALCULATING_TEXT = "計算中...";

export async function drawRoute() {

  const requestId = ++state.routeRequestId;

  if (
    state.deliveryPoints.length === 0
  ) {
    clearRoutePolylines();
    return;
  }

  countApi("Routes API");
  updateRouteSummaryText(CALCULATING_TEXT, CALCULATING_TEXT);

  const origin = START_POINT;

  const destination =
    state.deliveryPoints[
      state.deliveryPoints.length - 1
    ];

  const intermediates =
    state.deliveryPoints
      .slice(0, -1)
      .map(point => ({
        location: {
          lat: point.lat,
          lng: point.lng
        }
      }));

  try {
    const { routes } =
      await state.routeClass.computeRoutes({
        origin: {
          lat: origin.lat,
          lng: origin.lng
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng
        },
        intermediates,
        travelMode: "DRIVING",
        fields: ["path", "durationMillis", "distanceMeters"]
      });

    if (requestId !== state.routeRequestId) {
      return;
    }

    clearRoutePolylines();

    if (!routes?.length) {
      markRouteSummaryUnavailable();
      alert("経路を取得できませんでした");
      return;
    }

    const route = routes[0];

    state.routePolylines =
      route.createPolylines();

    state.routePolylines.forEach(
      polyline => polyline.setMap(state.map)
    );

    updateRouteSummary(route);
  } catch (error) {
    if (requestId === state.routeRequestId) {
      clearRoutePolylines();
      markRouteSummaryUnavailable();
      alert("経路を取得できませんでした");
      console.error("Route computation failed:", error);
    }
  }
}

export function formatDuration(durationMillis) {
  if (!Number.isFinite(durationMillis) || durationMillis < 0) return null;

  const minutes = Math.round(durationMillis / 1000 / 60);
  if (minutes < 60) return `約${minutes}分`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes === 0
    ? `約${hours}時間`
    : `約${hours}時間${remainingMinutes}分`;
}

export function formatDistance(distanceMeters) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return null;

  return `約${(distanceMeters / 1000).toFixed(1)}km`;
}

function updateRouteSummary(route) {
  updateRouteSummaryText(
    formatDuration(route.durationMillis) || UNAVAILABLE_TEXT,
    formatDistance(route.distanceMeters) || UNAVAILABLE_TEXT
  );
}

function markRouteSummaryUnavailable() {
  updateRouteSummaryText(UNAVAILABLE_TEXT, UNAVAILABLE_TEXT);
}

function updateRouteSummaryText(duration, distance) {
  const durationElement = document.getElementById("route-duration");
  const distanceElement = document.getElementById("route-distance");

  if (durationElement) durationElement.textContent = duration;
  if (distanceElement) distanceElement.textContent = distance;
}

export function clearRoutePolylines() {
  state.routePolylines.forEach(
    polyline => polyline.setMap(null)
  );

  state.routePolylines = [];
}
