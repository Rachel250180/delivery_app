let map;
let markers = [];
let directionsService;
let directionsRenderer;
let geocoder;
let points = [];
let isInitializing = false;
let isNewPage = false;

const START_POINT = { lat: 36.27883160931458, lng: 139.3873576767888, address: 
  "銀のさら太田店"
 };

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

  geocoder = new google.maps.Geocoder();
}

// ポイント追加
function addPoint(point) {
  const lat =
    typeof point.lat === "function"
      ? point.lat()
      : point.lat;

  const lng =
    typeof point.lng === "function"
      ? point.lng()
      : point.lng;

  const index = markers.length;

  const marker = new google.maps.Marker({
    position: { lat, lng },
    map,
    label: index === 0 ? "S" : String(index + 1),
    icon: index === 0
      ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
      : null
  });

  markers.push(marker);

  points.push({
    lat,
    lng,
    address: point.address || ""
  });

  refreshUI();
}


/*初期化専用関数*/
function resetMapState() {
  markers.forEach(marker => marker.setMap(null));

  markers = [];
  points = [];

  if (directionsRenderer) {
    directionsRenderer.setDirections({ routes: [] });
  }
}


/*登録地点の読み込み*/
function loadRoutePoints(routePoints) {
  isInitializing = true;

  routePoints.forEach(routePoint => {
    addPoint({
      lat: Number(routePoint.latitude),
      lng: Number(routePoint.longitude)
    });
  });

  isInitializing = false;
}


/*画面更新*/
function refreshUI() {
  updateHiddenField();
  renumberMarkers();
  renderList();

  if (!isInitializing) {
    drawRoute();
  }
}

function fetchAddress(lat, lng, callback) {
  geocoder.geocode(
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





function updateHiddenField() {
  const input = document.getElementById("points_json");
  if (input) {
    input.value = JSON.stringify(points);
  }


  if (isNewPage) {
    sessionStorage.setItem("route_points", JSON.stringify(points));
  }
}


function renderList() {
  const container = document.getElementById("points-list");
  if (!container) return;
  container.innerHTML = "";

  points.forEach((p, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${index + 1}: ${p.address || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`}
        ${index === 0 ? "": `<button onclick="removePoint(${index})">削除</button>`}
    `;

    container.appendChild(li);
  });
}

// new用
window.initMapNew = function () {
  isNewPage = true;
  resetMapState();

  createMap();

  const saved = sessionStorage.getItem("route_points");

  if (saved) {
    const parsed = JSON.parse(saved);

    isInitializing = true;

    parsed.forEach(p => {
      addPoint(p);
    });

    isInitializing = false;

    drawRoute();
  } else {
    addPoint(START_POINT);
  }

  map.addListener("click", (e) => {

    if (points.length >= 10) {
      alert("最大10地点までです");
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    fetchAddress(lat, lng, (address) => {

      addPoint({
        lat,
        lng,
        address
      });

    });
  });

  initSortable();

  const form = document.getElementById("route-form");

  if (form && !form.dataset.listenerAdded) {
    form.dataset.listenerAdded = "true";

    form.addEventListener("submit", () => {
      sessionStorage.removeItem("route_points");
    });
  }
};

// show用
window.initMapShow = function (routePoints) {
  isNewPage = false;

  resetMapState();
  
  
  createMap();

  loadRoutePoints();

  drawRoute();
};

// edit用
window.initMapEdit = function (routePoints) {
  isNewPage = false;

  resetMapState();

  createMap();

  loadRoutePoints();

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

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    markers.forEach(m => m.setMap(null));

    markers = [];
    points = [];

    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  }
});