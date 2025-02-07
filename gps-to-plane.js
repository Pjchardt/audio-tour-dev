// Earth’s radius in meters (approx)
const R = 6378137;

// Choose reference lat/lon
const lat0 = 38.048954;
const lon0 = -84.500638;

// Convert degrees to radians
function degToRad(deg) {
  return deg * Math.PI / 180;
}

/**
 * Convert lat/lon to local X/Y using equirectangular approximation.
 * lat0/lon0 = reference lat/lon in degrees
 */
function latLonToXY(lat, lon/*, lat0, lon0*/) {
  const dLat = degToRad(lat - lat0);
  const dLon = degToRad(lon - lon0);
  
  // Approximate local x/y in meters
  // (We multiply dLon by cos of the average latitude to compensate for longitude shrinkage.)
  const x = R * dLon * Math.cos(degToRad((lat + lat0) / 2));
  const y = R * dLat;
  
  return { x, y };
}

// Suppose you want each meter to be 0.02px (just an example).
const METERS_TO_PIXELS = 0.2;//4.0;

// Offset so the reference point appears in the middle of a <div> or canvas
const offsetX = 300;  // center x on screen
const offsetY = 300;  // center y on screen

function projectToScreen(x, y) {
  const screenX = x * METERS_TO_PIXELS + offsetX;
  // Note: y typically grows downward on screen, so you might invert
  const screenY = -y * METERS_TO_PIXELS + offsetY;
  
  return { screenX, screenY };
}

window.lat0 = lat0;
window.lon0 = lon0;
window.latLonToXY = latLonToXY;
window.projectToScreen = projectToScreen;