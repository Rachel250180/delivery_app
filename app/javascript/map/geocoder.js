// geocoder.js

import { state } from "map/state";
import { countApi } from "map/utils";

export function fetchAddress(lat, lng, callback) {

  countApi("Geocoder API");

  state.geocoder.geocode(
    {
      location: { lat, lng }
    },
    (results, status) => {

      let address = "";

      if (status === "OK" && results[0]) {
        address = results[0].formatted_address;
      }

      callback(address);
    }
  );
}