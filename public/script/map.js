let map;
// initMap is now async
async function initMap() {

  // Request libraries when needed, not in the script tag.
  const position = { lat: 22.263586100, lng: 88.320890600 };
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  // Short namespaces can be used.

  map = new Map(document.getElementById("mapper"), {
    center: position,
    zoom: 14,
    mapId: "Republic Wing"
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Republic Wing",
  });

}
initMap();