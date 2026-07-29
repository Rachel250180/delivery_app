// map.js

import { state } from "map/state";
import { START_POINT, DEFAULT_ZOOM, START_MARKER_ICON} from "map/constants";
import { countApi } from "map/utils";

export function createMap() {
  if (state.map) return;

  countApi("Map API");

  state.map = new google.maps.Map(
    document.getElementById("map"),
    {
      zoom: DEFAULT_ZOOM,
      center: START_POINT,
      streetViewControl: false,
      mapTypeControl: false,
    }
  );

  initializeServices();
  state.directionsRenderer.setMap(state.map);

  createStartMarker();

  google.maps.event.trigger(
    state.map,
    "resize"
  );

  state.map.setCenter(START_POINT);
}


function createStartMarker(){
  return new google.maps.Marker({
    position: START_POINT,
    map: state.map,
    label: "S",
    icon: START_MARKER_ICON,
  });
}


function initializeServices() {
  state.directionsService =
    new google.maps.DirectionsService();

  state.directionsRenderer =
    new google.maps.DirectionsRenderer({
      suppressMarkers: true,
    });


  state.geocoder =
    new google.maps.Geocoder();
}


export function resetMapState() {

  clearMarkers();
  clearDeliveryPoints();
  clearDirections();

  state.map = null;
}


function clearMarkers() {
  state.markers.forEach(marker => {
    marker.setMap(null);
  });

  state.markers = [];
}

function clearDeliveryPoints() {
  state.deliveryPoints = [];
}

function clearDirections() {
  if (!state.directionsRenderer) return;

  state.directionsRenderer.setDirections({
    routes: [],
  });
}