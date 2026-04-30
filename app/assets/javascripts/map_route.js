let map;
let markers = [];
let directionsService;
let directionsRenderer;
let points = [];
let isInitializing = false;

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

  updateHiddenField();
  renumberMarkers();
  renderList();

  if (!isInitializing) {
    drawRoute();
  }

}

function updateHiddenField() {
  const input = document.getElementById("points_json");
  if (!input) return;
  
  input.value = JSON.stringify(points);
}


function renderList() {
  const container = document.getElementById("points-list");
  if (!container) return;
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
    if (points.length >= 10) {
      alert("最大10地点までです");
      return;
    }

    addPoint(e.latLng);
  });

  initSortable();
};

// show用
window.initMapShow = function (routePoints) {
  createMap();

  isInitializing = true;

  routePoints.forEach(routePoint => {
    addPoint({
      lat: Number(routePoint.latitude),
      lng: Number(routePoint.longitude)
    });
  });

  isInitializing = false;

  drawRoute();
};

// edit用
window.initMapEdit = function (routePoints) {

  markers.forEach(m => m.setMap(null));
  markers = [];
  points = [];

  createMap();

  isInitializing = true;

  routePoints.forEach(routePoint => {
    addPoint({
      lat: Number(routePoint.latitude),
      lng: Number(routePoint.longitude)
    });
  });

  isInitializing = false;

  drawRoute();

  map.addListener("click", (e) => {
    addPoint(e.latLng);
  });

  initSortable();
};

function removePoint(index) {
  markers[index].setMap(null);

  markers.splice(index, 1);
  points.splice(index, 1);

  updateHiddenField();

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
  if (points.length < 2) {
    directionsRenderer.setDirections({ routes: [] });
    return;
  }

  const origin = points[0];
  const destination = points[points.length - 1];

  const waypoints = points.slice(1, -1).map(p => ({
    location: p,
    stopover: true
  }));

  directionsService.route({
    origin,
    destination,
    waypoints,
    travelMode: google.maps.TravelMode.DRIVING
  }, (result, status) => {
    console.log("route status:", status);

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

  updateHiddenField();
  renumberMarkers();
  drawRoute();
  renderList();
}