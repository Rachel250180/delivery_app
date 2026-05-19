const apiCounter = {};

function countApi(name) {
  apiCounter[name] = (apiCounter[name] || 0) + 1;

  console.log(
    `${name}: ${apiCounter[name]}回`
  );
}









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
  countApi("Map API");

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

  google.maps.event.trigger(map, "resize");

  map.setCenter(START_POINT);
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

  // 初期読み込み中は更新しない
  if (!isInitializing) {
    refreshUI();
  }
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
      lat: Number(routePoint.lat),
      lng: Number(routePoint.lng),
      address: routePoint.address
    });

  });

  isInitializing = false;

  refreshUI();
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

  countApi("Geocoder API");

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

  const container =
    document.getElementById("points-list");

  if (!container) return;

  container.innerHTML = "";

  deliveryPoints.forEach((point, index) => {

    const item =
      createDeliveryItem(point, index);

    container.appendChild(item);

  });
}

function createDeliveryItem(point, index) {

  const template =
    document.getElementById(
      "delivery-item-template"
    );

  const item =
    template.content.firstElementChild.cloneNode(true);

  item.dataset.index = index;

  item.querySelector(".delivery-item__number")
    .textContent = index + 1;

  item.querySelector(".delivery-item__address")
    .textContent =
      getPointLabel(point);

  setupDeleteButton(item, index);

  return item;
}

function setupDeleteButton(item, index) {

  const deleteBtn =
    item.querySelector(
      ".delivery-item__delete-btn"
    );

  if (!isEditable()) return;

  deleteBtn.addEventListener(
    "click",
    () => removePoint(index)
  );
}

function isEditable() {

  const container =
    document.getElementById("points-list");

  return (
    container?.dataset.editable === "true"
  );
}

function getPointLabel(point) {

  console.log("point:", point);

  if (point.address) {
    return point.address;
  }

  return formatLatLng(point);
}

function formatLatLng(point) {

  return (
    `${point.lat.toFixed(5)}, ` +
    `${point.lng.toFixed(5)}`
  );
}












// new用
window.initMapNew = function () {

  isNewPage = true;

  resetMapState();

  setTimeout(() => {

    createMap();

    const routePoints = getRoutePoints();

    if (routePoints.length > 0) {

      loadRoutePoints(routePoints);

    } else {

      const saved =
        sessionStorage.getItem("route_points");

      if (saved) {

        loadRoutePoints(
          JSON.parse(saved)
        );
      }
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

  }, 100);


  const form = document.getElementById("route-form");

  if (form && !form.dataset.listenerAdded) {
    form.dataset.listenerAdded = "true";
  }
};


// show用
window.initMapShow = function () {

  resetMapState();
  createMap();

  const routePoints = getRoutePoints();

  loadRoutePoints(routePoints);
};



// edit用
window.initMapEdit = function () {
  isNewPage = false;

  resetMapState();
  createMap();

  const routePoints = getRoutePoints();

  loadRoutePoints(routePoints);

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

  countApi("Directions API");
  
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

  if (!el) return;


  new Sortable(el, {
    animation: 150,

    filter: ".start-point",

    onMove: function (evt) {
      return !evt.related.classList.contains("start-point");
    },

    onEnd: function (evt) {

      // Sの分だけズラす
      const oldIndex = evt.oldDraggableIndex;
      const newIndex = evt.newDraggableIndex;

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








function initializeMapPage() {

  if (!window.google || !window.google.maps) return;

  const mapElement =
    document.getElementById("map");

  if (!mapElement) return;

  const path = window.location.pathname;

  if (/\/routes\/\d+\/edit$/.test(path)) {
    window.initMapEdit();
  } else if (/\/routes\/new$/.test(path)) {
    window.initMapNew();
  } else if (/\/routes\/\d+$/.test(path)) {
    window.initMapShow();
  }
}

document.addEventListener(
  "turbo:load",
  initializeMapPage
);

document.addEventListener("turbo:render", () => {
  requestAnimationFrame(initializeMapPage);
});










function getRoutePoints() {
  const routeData = document.getElementById("route-data");

  if (!routeData) return [];

  return JSON.parse(routeData.dataset.points || "[]");
}