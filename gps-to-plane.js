// Earth’s radius in meters (approx)
const R = 6378137;

// Choose reference lat/lon
const lat0 = 38.048954;
const lon0 = -84.500638;

// Convert degrees to radians
function degToRad(deg) {
  return deg * Math.PI / 180;
}


function radToDeg(rad) {
  return rad * 180 / Math.PI;
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

function xyToLatLon(x, y) {
  
  // Step 1: Approximate lat using y
  // --------------------------------
  // dLat = y / R, so lat = lat0 + radToDeg(dLat)
  const lat = lat0 + radToDeg(y / R);

  // Step 2: Recompute "average latitude" in radians
  // since lat is now known (approximately)
  // --------------------------------
  const latMidRad = degToRad((lat0 + lat) / 2);

  // Step 3: Solve for lon using x and cos(latMid)
  // --------------------------------
  // x = R * dLon * cos(latMid)  =>  dLon = x / (R * cos(latMid))
  // lon = lon0 + radToDeg(dLon)
  const dLon = x / (R * Math.cos(latMidRad));
  const lon = lon0 + radToDeg(dLon);

  return { lat, lon };
}

// Suppose you want each meter to be 0.02px (just an example).
const METERS_TO_PIXELS = 6.0;

// Offset so the reference point appears in the middle of a <div> or canvas
const offsetX = 1280/2;  // center x on screen
const offsetY = 720/2;  // center y on screen

function projectToScreen(x, y) {

  const rx = -y; 
  const ry = x;

   const screenX = rx * METERS_TO_PIXELS + offsetX;
  const screenY = -ry * METERS_TO_PIXELS + offsetY; // inverted for typical screen-y down
  
  return { screenX, screenY };
}

function projectScreenToLocal(screenX, screenY) {

  const rx = (screenX - offsetX) / METERS_TO_PIXELS;
  const ry = -(screenY - offsetY) / METERS_TO_PIXELS;

  const x = ry;
  const y = -rx;
  
  return { x, y };
}

function screenToLatLon(screenX, screenY) {
  const { x, y } = projectScreenToLocal(screenX, screenY); // ← undo canvas math
  return xyToLatLon(x, y);                                 // ← undo map projection
}

window.lat0 = lat0;
window.lon0 = lon0;
window.latLonToXY = latLonToXY;
window.projectToScreen = projectToScreen;