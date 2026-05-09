let map;
let markers = [];
let directionsService;
let directionsRenderer;
let geocoder;
let deliveryPoints = [];
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

  new google.maps.Marker({
    position: START_POINT,
    map,
    label: "S",
    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
  });
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
    label: String(index + 1),
  });

  markers.push(marker);

  deliveryPoints.push({
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
  deliveryPoints = [];

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
      lng: Number(routePoint.longitude),
      address: routePoint.address
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
    input.value = JSON.stringify(deliveryPoints);
  }


  if (isNewPage) {
    sessionStorage.setItem("route_points", JSON.stringify(deliveryPoints));
  }
}


function renderList() {
  const container = document.getElementById("points-list");

  if (!container) return;

  container.innerHTML = "";

  // スタート地点表示
  const startLi = document.createElement("li");

  startLi.innerHTML = `
    <span>
      S: ${START_POINT.address}
    </span>
  `;

  startLi.classList.add("start-point");

  container.appendChild(startLi);

  // 配達地点表示
  deliveryPoints.forEach((p, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>
        ${index + 1}: ${
          p.address || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
        }
      </span>

      <button type="button" onclick="removePoint(${index})">
        削除
      </button>
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
  } 

  map.addListener("click", (e) => {

    if (!canAddPoint()) return;

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

  loadRoutePoints(routePoints);

  drawRoute();
};

// edit用
window.initMapEdit = function (routePoints) {
  isNewPage = false;

  resetMapState();

  createMap();

  loadRoutePoints(routePoints);

  drawRoute();

  map.addListener("click", (e) => {

    if (!canAddPoint()) return;

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
};






function removePoint(index) {
  markers[index].setMap(null);

  markers.splice(index, 1);
  deliveryPoints.splice(index, 1);

  refreshUI();
};

function renumberMarkers() {
  markers.forEach((marker, i) => {
    marker.setLabel(String(i + 1));
  });
}

function drawRoute() {
  if (deliveryPoints.length === 0) {
    directionsRenderer.setDirections({ routes: [] });
    return;
  }

  const origin = START_POINT;
  const destination = deliveryPoints[deliveryPoints.length - 1];

  const waypoints = deliveryPoints.slice(0, -1).map(p => ({
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

    filter: ".start-point",

    onMove: function (evt) {
      return !evt.related.classList.contains("start-point");
    },

    onEnd: function (evt) {

      // Sの分だけズラす
      const oldIndex = evt.oldIndex - 1;
      const newIndex = evt.newIndex - 1;

      movePoint(oldIndex, newIndex);
    }
  });
}

function movePoint(oldIndex, newIndex) {

  if (oldIndex < 0 || newIndex < 0) {
    return;
  }

  const marker = markers.splice(oldIndex, 1)[0];
  markers.splice(newIndex, 0, marker);

  const point = deliveryPoints.splice(oldIndex, 1)[0];
  deliveryPoints.splice(newIndex, 0, point);

  refreshUI();
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted) {
    resetMapState();
  }
});


function canAddPoint() {
  if (deliveryPoints.length >= 9) {
    alert("最大9地点までです");
    return false;
  }

  return true;
}
