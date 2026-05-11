window.goToGoogleMap = function () {
  navigator.geolocation.getCurrentPosition((pos) => {
    const originLat = pos.coords.latitude;
    const originLng = pos.coords.longitude;

    const el = document.getElementById("route-data");
    const points = JSON.parse(el.dataset.points);

    if (!points || points.length === 0) return;

    const destination = points[points.length - 1];
    const waypoints = points.slice(0, -1);

    const waypointsStr = waypoints
      .map(p => `${p.lat},${p.lng}`)
      .join("|");

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      `&origin=${originLat},${originLng}` +
      `&destination=${destination.lat},${destination.lng}` +
      (waypointsStr ? `&waypoints=${encodeURIComponent(waypointsStr)}` : "") +
      `&travelmode=driving`;

    window.location.href = url;
  });
}