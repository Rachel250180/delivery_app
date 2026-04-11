let map;
let markers = [];
let directionsService;
let directionsRenderer;
let points = [];

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

  points.push({ lat, lng });

  rebuildHiddenInputs();

  renumberMarkers();
  drawRoute();
  renderList();

}

function rebuildHiddenInputs() {
  const container = document.getElementById("points");
  container.innerHTML = "";

  points.forEach((p, index) => {
    container.insertAdjacentHTML("beforeend", `
      <div class="point">
        <input type="hidden" name="route[route_points_attributes][${index}][latitude]" value="${p.lat}">
        <input type="hidden" name="route[route_points_attributes][${index}][longitude]" value="${p.lng}">
        <input type="hidden" name="route[route_points_attributes][${index}][position]" value="${index + 1}">
      </div>
    `);
  });
}

function renderList() {
  const container = document.getElementById("points-list");
  container.innerHTML = "";

  points.forEach((p, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${index + 1}: ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}
        ${index === 0 ? "": `<button onclick="removePoint(${index})">削除</button>`}
    `;

    container.appendChild(li);
  });
}

// new用
window.initMapNew = function () {
  createMap();

  addPoint(START_POINT);

  map.addListener("click", (e) => {
    addPoint(e.latLng);
  });

    initSortable();
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

window.initMapEdit = function (points) {
  createMap();

  addPoint(START_POINT);

  map.addListener("click", (e) => {
    addPoint(e.latLng);
  });
  initSortable();
};

function removePoint(index) {
  markers[index].setMap(null);

  markers.splice(index, 1);
  points.splice(index, 1);

  rebuildHiddenInputs();

  renumberMarkers();
  drawRoute();
  renderList();
};

function renumberMarkers() {
  markers.forEach((marker, i) => {
    marker.setLabel(i === 0 ? "S" : String(i + 1));
  });
}

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

function initSortable() {
  const el = document.getElementById("points-list");

  new Sortable(el, {
    animation: 150,

    onEnd: function (evt) {
      const oldIndex = evt.oldIndex;
      const newIndex = evt.newIndex;

      movePoint(oldIndex, newIndex);
    }
  });
}

function movePoint(oldIndex, newIndex) {
    if (oldIndex === 0 || newIndex === 0) {
    renderList();
    return;
  }

  const marker = markers.splice(oldIndex, 1)[0];
  markers.splice(newIndex, 0, marker);

  const point = points.splice(oldIndex, 1)[0];
  points.splice(newIndex, 0, point);

  rebuildHiddenInputs();
  renumberMarkers();
  drawRoute();
  renderList();
}