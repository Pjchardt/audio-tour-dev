// location.js

// Convert degrees to radians
function toRad(deg) {
    return (deg * Math.PI) / 180;
  }
  
  // Haversine formula to get ground distance in meters
  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Bearing from user to POI in degrees (0° = north, 90° = east)
  function initialBearing(lat1, lng1, lat2, lng2) {
    const φ1 = toRad(lat1),
      φ2 = toRad(lat2);
    const λ1 = toRad(lng1),
      λ2 = toRad(lng2);
  
    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  
    let bearing = Math.atan2(y, x);
    bearing = ((bearing * 180) / Math.PI + 360) % 360; // [0..360)
    return bearing;
  }
  
  /**
   * localCoordsYUp:
   *   Convert lat/lng/alt (user & POI) into a local (x, y, z)
   *   Y = altitude (up)
   *   X-Z plane = ground
   *   0° bearing = north => +Z
   *   90° bearing = east  => +X
   */
  function localCoordsYUp(latUser, lngUser, altUser, latPoi, lngPoi, altPoi) {
    altUser = altUser || 0;
    altPoi = altPoi || 0;
  
    // 1) Compute ground distance & bearing
    const dist = haversineDistance(latUser, lngUser, latPoi, lngPoi);
    const bearDeg = initialBearing(latUser, lngUser, latPoi, lngPoi);
    const bearRad = toRad(bearDeg);
  
    // 2) X-Z in the ground plane
    //   0° => +Z
    //   90° => +X
    const x = dist * Math.sin(bearRad);
    const z = dist * Math.cos(bearRad);
  
    // 3) Y = altitude difference
    const y = altPoi - altUser;
  
    return { x, y, z };
  }
  
  // Attach functions to window for global usage
  window.haversineDistance = haversineDistance;
  window.localCoordsYUp = localCoordsYUp;