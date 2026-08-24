// map.js

import { state } from "map/state";
import { START_POINT, DEFAULT_ZOOM, START_MARKER_COLORS } from "map/constants";
import { countApi } from "map/utils";

export function createMap() {
  if (state.map) return;

  countApi("Map API");

  state.map = new google.maps.Map(
    document.getElementById("map"),
    {
      zoom: DEFAULT_ZOOM,
      center: START_POINT,
      mapId: getMapId(),
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


function createStartMarker() {
  const pin = new google.maps.marker.PinElement({
    ...START_MARKER_COLORS,
    glyphText: "S"
  });

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: START_POINT,
    map: state.map,
    title: START_POINT.address
  });

  marker.append(pin);

  return marker;
}

function getMapId() {
  return document.querySelector(
    "script[data-google-maps-script]"
  )?.dataset.mapId || "DEMO_MAP_ID";
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
    marker.map = null;
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
