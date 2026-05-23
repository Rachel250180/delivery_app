



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




















function initializeMapPage() {
  if (mapBooted) return;

  if (!window.google?.maps) return;

  const mapElement = document.getElementById("map");
  if (!mapElement) return;

  mapBooted = true;

  const path = window.location.pathname;

  if (/\/routes\/\d+\/edit$/.test(path)) {
    window.initMapEdit();
  } else if (/\/routes\/new$/.test(path)) {
    window.initMapNew();
  } else if (/\/routes\/\d+$/.test(path)) {
    window.initMapShow();
  }
}

