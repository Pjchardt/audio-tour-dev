// main.js
(function () {
    // 1) Global/state variables
  
    const sound = new Howl({
      src: ['audio/bird-1.mp3'], // Replace with your actual audio URL
      volume: 1.0,
      loop: true,
      pannerAttr: {
        panningModel: 'HRTF',
        distanceModel: 'linear',
        refDistance: 1,
        maxDistance: 100,
        rolloffFactor: 1,
    });

    // Real GPS data (updated by geolocation)
    let baseLat = 0;   // fallback defaults
    let baseLng = 0;
    let baseAlt = 0;
  
    // Offsets added via arrow keys
    let offsetLat = 0;
    let offsetLng = 0;
    let offsetAlt = 0; // if you want altitude offsets
  
    // For multiple POIs: activePoiMap = { [poi.name]: { poi, howlInstance } }
    let activePoiMap = {};
    let audioUnlocked = false;
  
    // 2) Initialization
    function init() {
      document
        .getElementById('start-button')
        .addEventListener('click', onBeginClick);
  
      // Listen for arrow keys to adjust offset, not the base lat/lng
      document.addEventListener('keydown', onArrowKeyPress);
  
      // Update the UI initially
      updateLatLngDisplay();
    }
  
    // 3) Begin + Real Geolocation
    function onBeginClick() {
      audioUnlocked = true;
      console.log('Begin clicked; audio unlocked');
  
      sound.pos(0, 0, 10);
  
      // The user is at (0,0,0)
      Howler.pos(0, 0, 0);
  
      sound.play();
      
      window.pointsOfInterest.forEach((poi) => {
      activatePoi(latUser, lngUser, altUser, poi);
      });
      updateActivePoiList();

      if ('geolocation' in navigator) {
        // Get one initial position
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            baseLat = pos.coords.latitude;
            baseLng = pos.coords.longitude;
            baseAlt = pos.coords.altitude || 0;
            // Re-run update with real + offset
            handlePositionChange();
          },
          (err) => {
            console.error('Error with geolocation:', err);
          }
        );
  
        // Watch for updates
        navigator.geolocation.watchPosition(
          (pos) => {
            baseLat = pos.coords.latitude;
            baseLng = pos.coords.longitude;
            baseAlt = pos.coords.altitude || 0;
            // Each time real GPS changes, combine with offset
            handlePositionChange();
          },
          (err) => console.error('Error watching geo:', err),
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          }
        );
      } else {
        console.error('Geolocation not supported by this browser.');
      }
  
      // If no geolocation, we just rely on fallback + offsets
      handlePositionChange();
    }
  
    // 4) Arrow Keys => Adjust Offsets
    function onArrowKeyPress(e) {
      // 1° of latitude ~111 km. We'll pick ~0.00005 for ~5.5 m/press
      const step = 0.00005;
  
      switch (e.key) {
        case 'ArrowUp':
          // Move north => increment offsetLat
          offsetLat += step;
          break;
        case 'ArrowDown':
          // Move south => decrement offsetLat
          offsetLat -= step;
          break;
        case 'ArrowLeft':
          // Move west => decrement offsetLng
          offsetLng -= step;
          break;
        case 'ArrowRight':
          // Move east => increment offsetLng
          offsetLng += step;
          break;
        default:
          return;
      }
      handlePositionChange();
    }
  
    // 5) Combine base + offset => call handleLocationUpdate
    function handlePositionChange() {
      const effectiveLat = baseLat + offsetLat;
      const effectiveLng = baseLng + offsetLng;
      const effectiveAlt = baseAlt + offsetAlt; // if you use altitude offsets
  
      console.log(
        `Effective lat/lng/alt: ${effectiveLat}, ${effectiveLng}, ${effectiveAlt}`
      );
  
      updateLatLngDisplay(effectiveLat, effectiveLng, effectiveAlt);
      handleLocationUpdate(effectiveLat, effectiveLng, effectiveAlt);
    }
  
    // 6) Activate/Deactivate POIs
    function handleLocationUpdate(latUser, lngUser, altUser) {
      window.pointsOfInterest.forEach((poi) => {
        const dist = window.haversineDistance(latUser, lngUser, poi.lat, poi.lng);
        if (dist <= poi.radius) {
          activatePoi(latUser, lngUser, altUser, poi);
        } else {
          deactivatePoi(poi);
        }
      });
      updateActivePoiList();
    }
  
    function activatePoi(latUser, lngUser, altUser, poi) {
      if (activePoiMap[poi.name]) {
        // Already active => just update position
        const { howlInstance } = activePoiMap[poi.name];
        if (howlInstance) {
          const { x, y, z } = window.localCoordsYUp(
            latUser,
            lngUser,
            altUser,
            poi.lat,
            poi.lng,
            poi.altitude
          );
          howlInstance.pos(x, y, z);
        }
        return;
      }
  
      console.log(`Activating POI: ${poi.name}`);
      let howlInstance = null;
  
      if (audioUnlocked) {
        howlInstance = window.createSpatialSound(poi.audioPath);
        howlInstance.on('load', () => {
          console.log(`Loaded sound for ${poi.name}`);
          const { x, y, z } = window.localCoordsYUp(
            latUser,
            lngUser,
            altUser,
            poi.lat,
            poi.lng,
            poi.altitude
          );
          howlInstance.pos(x, y, z);
  
          // The user is at (0,0,0)
          Howler.pos(0, 0, 0);
  
          howlInstance.play();
        });
      }
  
      activePoiMap[poi.name] = { poi, howlInstance };
    }
  
    function deactivatePoi(poi) {
      if (!activePoiMap[poi.name]) return;
      console.log(`Deactivating POI: ${poi.name}`);
      const { howlInstance } = activePoiMap[poi.name];
      if (howlInstance) {
        howlInstance.stop();
      }
      delete activePoiMap[poi.name];
    }
  
    // 7) UI Helpers
    function updateLatLngDisplay(lat, lng, alt) {
      // If not passed in, use base + offset
      const effectiveLat = lat !== undefined ? lat : baseLat + offsetLat;
      const effectiveLng = lng !== undefined ? lng : baseLng + offsetLng;
      const effectiveAlt = alt !== undefined ? alt : baseAlt + offsetAlt;
  
      const coordsElem = document.getElementById('userCoords');
      if (coordsElem) {
        coordsElem.textContent = `lat=${effectiveLat.toFixed(6)}, lng=${effectiveLng.toFixed(
          6
        )}, alt=${effectiveAlt.toFixed(2)}`;
      }
    }
  
    function updateActivePoiList() {
        const listElem = document.getElementById('active-pois-list');
        listElem.innerHTML = '';
      
        // For each active POI, create an <li> element
        Object.keys(activePoiMap).forEach((poiName) => {
          const { poi } = activePoiMap[poiName];
      
        // 1) Compute distance from user to this POI:
        const effectiveLat = baseLat + offsetLat;
        const effectiveLng = baseLng + offsetLng;
        const effectiveAlt = baseAlt + offsetAlt; // if you use altitude offsets
        const distance = haversineDistance(effectiveLat, effectiveLng, poi.lat, poi.lng);

          // Create a list item
          const li = document.createElement('li');
      
          // Show name, lat, and lng in the text
          li.textContent = `${poi.name} 
            (lat=${poi.lat.toFixed(5)}, lng=${poi.lng.toFixed(5)}) 
            - Dist=${distance.toFixed(2)}m`;
          // Optionally, format to fewer decimals:
          // li.textContent = `${poi.name} (lat=${poi.lat.toFixed(6)}, lng=${poi.lng.toFixed(6)})`;
      
          listElem.appendChild(li);
        });
      }
  
    // 8) Start
    document.addEventListener('DOMContentLoaded', init);
  })();