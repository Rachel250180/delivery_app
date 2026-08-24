// route.js

import { state } from "map/state";
import { START_POINT } from "map/constants";
import { countApi } from "map/utils";

export async function drawRoute() {

  const requestId = ++state.routeRequestId;

  if (
    state.deliveryPoints.length === 0
  ) {
    clearRoutePolylines();
    return;
  }

  countApi("Routes API");

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
        fields: ["path"]
      });

    if (requestId !== state.routeRequestId) {
      return;
    }

    clearRoutePolylines();

    if (!routes?.length) return;

    state.routePolylines =
      routes[0].createPolylines();

    state.routePolylines.forEach(
      polyline => polyline.setMap(state.map)
    );
  } catch (error) {
    if (requestId === state.routeRequestId) {
      console.error("Route computation failed:", error);
    }
  }
}

export function clearRoutePolylines() {
  state.routePolylines.forEach(
    polyline => polyline.setMap(null)
  );

  state.routePolylines = [];
}
