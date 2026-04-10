let map;
let markers = [];
let directionsService;
let directionsRenderer;

const START_POINT = { lat: 36.27883160931458, lng: 139.3873576767888 };

function createMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: START_POINT,
    streetViewControl: false,
    mapTypeControl: false,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true
  });

  directionsRenderer.setMap(map);
}

// ポイント追加
function addPoint(latLng) {
  const lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
  const lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;

  const index = markers.length;

  const marker = new google.maps.Marker({
    position: { lat: lat, lng: lng },
    map: map,
    label: index === 0 ? "S" : String(index + 1),
    icon: index === 0 ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" : null
  });

  markers.push(marker);

  const container = document.getElementById("points");

  if (container) {
    container.insertAdjacentHTML("beforeend", `
      <div class="point">
        <input type="hidden" name="route[route_points_attributes][${index}][latitude]" value="${lat}">
        <input type="hidden" name="route[route_points_attributes][${index}][longitude]" value="${lng}">
        <input type="hidden" name="route[route_points_attributes][${index}][position]" value="${index + 1}">
      </div>
    `);
  }

  renumberMarkers();
  drawRoute();
}

// new用
window.initMapNew = function () {
  createMap();

  addPoint(START_POINT);

  map.addListener("click", (e) => {
    addPoint(e.latLng);
  });
};

// show用
window.initMapShow = function (points) {
  createMap();

  points.forEach(point => {
    addPoint({
      lat: point.latitude,
      lng: point.longitude
    });
  });

  drawRoute();
};

function renumberMarkers() {
  markers.forEach((marker, i) => {
    marker.setLabel(i === 0 ? "S" : String(i + 1));
  });
}

window.undoLastPoint = function () {
  if (markers.length <= 1) return;

  const marker = markers.pop();
  marker.setMap(null);

  const container = document.getElementById("points");

  if (container) {
    const lastPoint = container.lastElementChild;
    if (lastPoint) lastPoint.remove();
  }

  renumberMarkers();
  drawRoute();
};

window.resetPoints = function () {
  while (markers.length > 1) {
    const marker = markers.pop();
    marker.setMap(null);
  }

  const container = document.getElementById("points");

  if (container) {
    while (container.children.length > 1) {
      container.lastElementChild.remove();
    }
  }

  renumberMarkers();
  drawRoute();
};

function drawRoute() {
  if (markers.length < 2) {
    directionsRenderer.setDirections({ routes: [] });
    return;
  }

  const origin = markers[0].getPosition();
  const destination = markers[markers.length - 1].getPosition();

  const waypoints = markers.slice(1, -1).map(marker => ({
    location: marker.getPosition(),
    stopover: true
  }));

  directionsService.route({
    origin: origin,
    destination: destination,
    waypoints: waypoints,
    travelMode: google.maps.TravelMode.DRIVING
  }, (result, status) => {
    if (status === "OK") {
      directionsRenderer.setDirections(result);
    }
  });
}
