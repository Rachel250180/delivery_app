// route.js

import { state } from "map/state";
import { START_POINT } from "map/constants";
import { countApi } from "map/utils";

export function drawRoute() {

  if (
    state.deliveryPoints.length === 0
  ) {

    state.directionsRenderer
      .setDirections({
        routes: []
      });

    return;
  }

  countApi("Directions API");

  const origin = START_POINT;

  const destination =
    state.deliveryPoints[
      state.deliveryPoints.length - 1
    ];

  const waypoints =
    state.deliveryPoints
      .slice(0, -1)
      .map(point => ({
        location: point,
        stopover: true
      }));

  state.directionsService.route(
    {
      origin,
      destination,
      waypoints,
      travelMode:
        google.maps.TravelMode.DRIVING
    },

    (result, status) => {

      console.log(
        "route status:",
        status
      );

      if (status === "OK") {

        state.directionsRenderer
          .setDirections(result);
      }
    }
  );
}