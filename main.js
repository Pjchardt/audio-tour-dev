// main.js
window.debug = true;  

(function () {
    // Global/state variables
    // Real GPS data (updated by geolocation)
    let baseLat = 0;   // fallback defaults
    let baseLng = 0;
    let baseAlt = 0;
  
    // Offsets added via arrow keys or mouse/touch press
    let offsetLat = 0;
    let offsetLng = 0;
    let offsetAlt = 0; // if you want altitude offsets
  
    let activePoiMap = {};
    let audioUnlocked = false;

    var ctx, canvas;
    var rings;
    const RING_DURATION = 3.0;

    // Initialization
    function init() {
      document.getElementById('start-experience-btn').addEventListener('click', onStartBtnClick);
      document.getElementById('gps-continue-btn').addEventListener('click', onGPSBtnClick);
      document.getElementById('headphones-continue-btn').addEventListener('click', onHeadphonesBtnClick);

      // Listen for arrow keys to adjust offset, not the base lat/lng, if in debug mode
      if (debug === true) {
        document.addEventListener('keydown', onArrowKeyPress);
      }
  
      // Get references to elements
      const infoButton = document.getElementById('infoButton');
      const infoModal = document.getElementById('infoModal');
      const closeModalButton = document.getElementById('closeModalButton');

      // SHOW the modal when the info button is clicked
      infoButton.addEventListener('click', () => {
        infoModal.classList.add('show');
      });

      // HIDE the modal when the close button is clicked
      closeModalButton.addEventListener('click', () => {
        infoModal.classList.remove('show');
      });

      // (Optional) Hide modal when clicking outside the .modal-content
      infoModal.addEventListener('click', (event) => {
        if (event.target === infoModal) {
          infoModal.classList.remove('show');
        }
      });

      // Update the UI initially
      updateLatLngDisplay();

      // Grab canvas
      canvas = document.getElementById('myMap');

      // Only register click events if debug mode is enabled
      if (debug === true) {
        canvas.addEventListener('touchstart', (evt) => {
          const rect = canvas.getBoundingClientRect();
          // touches[0] for a single-finger touch
          const screenX = (evt.touches[0].clientX - rect.left) * (canvas.width  / rect.width);
          const screenY = (evt.touches[0].clientY - rect.top)  * (canvas.height / rect.height);

          // 1. convert to geographic coordinates
          const { lat: clickLat, lon: clickLon } = screenToLatLon(screenX, screenY);

          // 2. figure out what the *new* offsets should be
          const newOffsetLat = clickLat - baseLat;
          const newOffsetLng = clickLon - baseLng;

          // 3. smoothly animate to them
          cancelTween();                    // stop any existing motion
          tweenOffsets(newOffsetLat, newOffsetLng);
        });
  
        canvas.addEventListener('click', (evt) => {
          const rect = canvas.getBoundingClientRect();
          const screenX = (evt.clientX - rect.left) * (canvas.width  / rect.width);
          const screenY = (evt.clientY - rect.top)  * (canvas.height / rect.height);

          // 1. convert to geographic coordinates
          const { lat: clickLat, lon: clickLon } = screenToLatLon(screenX, screenY);

          // 2. figure out what the *new* offsets should be
          const newOffsetLat = clickLat - baseLat;
          const newOffsetLng = clickLon - baseLng;

          // 3. smoothly animate to them
          cancelTween();                    // stop any existing motion
          tweenOffsets(newOffsetLat, newOffsetLng);
        });
      }

      ctx = canvas.getContext('2d');

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 70;

      clearBackground();
      drawPOI();

      ctx.strokeStyle = 'rgb(200, 200, 200)';      // outline color
      ctx.lineWidth = 5;            // thickness of outline

      // Example dash pattern (4px dash, 2px gap, etc.)
      ctx.setLineDash([20, 20]);

      ctx.setLineDash([]);  // empty array = no dash
      ctx.restore(); // back to normal

      // We'll store "rings" in an array
      rings = [];
      // Every second, spawn a new ring at each point of interest
      setInterval(() => {
        const effectiveLat = baseLat + offsetLat;
        const effectiveLng = baseLng + offsetLng;
        const local = window.latLonToXY(effectiveLat, effectiveLng);
        const screen = window.projectToScreen(local.x, local.y);
        rings.push({
          x: screen.screenX,
          y: screen.screenY,
          startTime: performance.now(),
        });
      }, 3000);

      // Main animation loop
      function animate() {
        requestAnimationFrame(animate);

        clearBackground();
        drawPOI();

        // 1) Draw the dotted circles (your existing code)
        ctx.setLineDash([4, 2]); // 4px dash, 2px gap
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000'; 

        window.pointsOfInterest.forEach((poi) => {
          const local = window.latLonToXY(poi.lat, poi.lng);
          const screen = window.projectToScreen(local.x, local.y);
          ctx.beginPath();
          ctx.arc(screen.screenX, screen.screenY, 50, 0, 2 * Math.PI);
          ctx.stroke();
        });

        drawPlayer();

        /*
        // Draw and update the pulsing rings
        ctx.setLineDash([]); // Use solid stroke for pulses (or keep dashed if desired)

        const now = performance.now();
        const newRings = [];

        for (let i = 0; i < rings.length; i++) {
          const ring = rings[i];
          const elapsed = (now - ring.startTime) / 1000; // seconds since spawn

          if (elapsed < RING_DURATION) {
            // Progress from 0 -> 1 over the ring's lifetime
            const t = elapsed / RING_DURATION;

            // Radius can go from 0 to e.g. 80 px
            const radius = 80 * t;

            // Alpha goes from 1 -> 0
            const alpha = 1 - t;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.restore();

            newRings.push(ring); // Keep the ring until its lifetime ends
          }
        }
        rings = newRings; // Discard old rings */
      }

      animate();
    }
  
    function clearBackground() {
      // Set the fill color
      ctx.fillStyle = '#323232';
      // Fill the entire canvas with the color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (debug === true) {
        // Draw our anchor point
        ctx.beginPath();
        const local = window.latLonToXY(window.lat0, window.lon0);
        const screen = window.projectToScreen(local.x, local.y);
        ctx.arc(screen.screenX, screen.screenY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
      }
    }

    function drawPOI() {
      // Convert to XY and then to screen coordinates
      window.pointsOfInterest.forEach((poi) => {
        const local = window.latLonToXY(poi.lat, poi.lng);
        const screen = window.projectToScreen(local.x, local.y);
        ctx.strokeStyle = (poi.isFocusable === true) ? 'rgb(200, 200, 200)' : 'rgb(182, 138, 102)';      // outline color
        ctx.beginPath();
        ctx.arc(screen.screenX, screen.screenY, 50, 0, 2 * Math.PI);
        ctx.stroke();
      });
    }

    function drawPlayer() {
      const effectiveLat = baseLat + offsetLat;
      const effectiveLng = baseLng + offsetLng;
      const effectiveAlt = baseAlt + offsetAlt; // if you use altitude offsets

      // Convert to XY and then to screen coordinates
      const local = window.latLonToXY(effectiveLat, effectiveLng);
      const screen = window.projectToScreen(local.x, local.y);
      ctx.beginPath();
      ctx.arc(screen.screenX, screen.screenY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'purple';
      ctx.fill();

      // 2) Draw and update the pulsing rings
      ctx.setLineDash([]); // Use solid stroke for pulses (or keep dashed if desired)

      const now = performance.now();
      const newRings = [];

      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];
        const elapsed = (now - ring.startTime) / 1000; // seconds since spawn

        if (elapsed < RING_DURATION) {
          // Progress from 0 -> 1 over the ring's lifetime
          const t = elapsed / RING_DURATION;

          // Radius can go from 0 to e.g. 80 px
          const radius = 80 * t;

          // Alpha goes from 1 -> 0
          const alpha = 1 - t;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = 'purple';
          ctx.beginPath();
          ctx.arc(screen.screenX, screen.screenY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.restore();

          newRings.push(ring); // Keep the ring until its lifetime ends
        }
      }
      rings = newRings; // Discard old rings
    }

    function onStartBtnClick() {
      audioUnlocked = true;
      document.getElementById('overlay-title').style.display = 'none';
      document.getElementById('overlay-gps-info').style.display = 'flex';
    }

    function onGPSBtnClick() {
      document.getElementById('overlay-gps-info').style.display = 'none';
      document.getElementById('overlay-headphones-info').style.display = 'flex';
      window.pointsOfInterest.forEach((poi) => {
        activatePoi(poi.lat, poi.lng, poi.altitude, poi);
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

    function onHeadphonesBtnClick() {
      document.getElementById('overlay-headphones-info').style.display = 'none';
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
          case 'p':
            // Set offset so that lat/long matches anchor position
            offsetLat = lat0 - baseLat;
            offsetLng = lon0 - baseLng;
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
  
      /*console.log(
        `Effective lat/lng/alt: ${effectiveLat}, ${effectiveLng}, ${effectiveAlt}`
      );*/
  
      updateLatLngDisplay(effectiveLat, effectiveLng, effectiveAlt);
      handleLocationUpdate(effectiveLat, effectiveLng, effectiveAlt);

      const local = window.latLonToXY(effectiveLat, effectiveLng);
      const screen = window.projectToScreen(local.x, local.y);

      Howler.pos(local.x, 0, local.y);
    }
  
    // Activate/Deactivate POIs
    function handleLocationUpdate(latUser, lngUser, altUser) {
      // TOD: If 12 simult audio tracks is too much, enable/disable here based off of distance
      updateActivePoiList();
    }
  
    function activatePoi(latUser, lngUser, altUser, poi) {
      let howlInstance = null;
      if (audioUnlocked) {
        howlInstance = window.createSpatialSound(poi.audioPath);
        howlInstance.on('load', () => {
          const local = window.latLonToXY(poi.lat, poi.lng);
          howlInstance.pos(local.x, 0, local.y);
          howlInstance.play();
        });
      }
      activePoiMap[poi.name] = { poi, howlInstance };
    }
  
    function deactivatePoi(poi) {
      if (!activePoiMap[poi.name]) return;
      //console.log(`Deactivating POI: ${poi.name}`);
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
      
        // Let's assume these are your HTML elements:
        const poiTitleElem = document.getElementById('poi-title');
        const poiImageElem = document.getElementById('poi-image');
        const poiTextElem = document.getElementById('poi-text');

        // Track the closest POI
        let closestPoi = null;
        let minDist = Infinity;

        // For each active POI, create an <li> element
        Object.keys(activePoiMap).forEach((poiName) => {
          const { poi } = activePoiMap[poiName];
      
          // 1) Compute distance from user to this POI:
          const effectiveLat = baseLat + offsetLat;
          const effectiveLng = baseLng + offsetLng;
          const effectiveAlt = baseAlt + offsetAlt; // if you use altitude offsets
          const distance = haversineDistance(effectiveLat, effectiveLng, poi.lat, poi.lng);

          // -- Update the closest POI logic --
          if (distance < minDist && poi.isFocusable === true) {
            minDist = distance;
            closestPoi = poi; // store the entire POI object
          }

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

        // After iterating through all POIs, use the closest one
        if (closestPoi) {
          poiTitleElem.textContent = `POI Title: ${closestPoi.name}`;
          poiImageElem.src = closestPoi.imagePath;
          poiTextElem.textContent = closestPoi.textContent;
        }
      }

      // ---------------------------------------------
// simple tween engine for offsetLat / offsetLng
// ---------------------------------------------
const DURATION_MS = 3000;                // total time of the move
const easeInOut = t => t < 0.5          // nice smooth S‑curve
  ? 2*t*t
  : 1 - Math.pow(-2*t + 2, 2) / 2;

let tweenActive = false;

function tweenOffsets(toLat, toLng) {
  const startLat = offsetLat;
  const startLng = offsetLng;
  const deltaLat = toLat - startLat;
  const deltaLng = toLng - startLng;

  const startTime = performance.now();
  tweenActive = true;

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / DURATION_MS);
    const k = easeInOut(t);

    offsetLat = startLat + deltaLat * k;
  offsetLng = startLng + deltaLng * k;

    handlePositionChange();   // redraw / update Howler, etc.

    if (t < 1 && tweenActive) {
      requestAnimationFrame(step);
    } else {
      tweenActive = false;    // finished
    }
  }

  requestAnimationFrame(step);
}

/* Optional: stop any current tween immediately */
function cancelTween() { tweenActive = false; }
  
    // 8) Start
    document.addEventListener('DOMContentLoaded', init);
  })();