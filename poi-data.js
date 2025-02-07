// poi-data.js
// Holds pointsOfInterest array and any data definitions
const pointsOfInterest = [
    {
      name: "Point 1",
      lat: 38.048985,
      lng: -84.500100,
      radius: 50,
      audioPath: "audio/bird-1.mp3",
      textContent: "Point 1 (intersection of Main and Broadway).",
    },
    {
      name: "Point 2",
      lat: 38.049557,
      lng: -84.500829,
      radius: 50,
      audioPath: "audio/cafe-speaking.mp3",
      textContent: "Point 2 (near taco spot).",
    },
    {
      name: "Point 3",
      lat: 38.048969,
      lng: -84.500916,
      radius: 100,
      audioPath: "audio/christmas-sounds.mp3",
      textContent: "Point 3 (next to plaque along fountain steps).",
    },
    {
      name: "Point 4",
      lat: 38.048497,
      lng: -84.500737,
      radius: 500,
      audioPath: "audio/bird-1.mp3",
      textContent: "Point 4. (intersection of Vine and Broadway)",
    },
   /* {
        name: "798 Sherwood Drive",
        lat: 38.00204631316116,
        lng: -84.49941692585523,
        radius: 500,
        audioPath: "audio/cafe-speaking.mp3",
        textContent: "You've arrived at Town Square, the heart of the city...",
    },
    {
        name: "3135 Breckenwood",
        lat: 38.002851122912084, 
        lng: -84.4993407358142,
        radius: 500,
        audioPath: "audio/robin-calls.mp3",
        textContent: "You've arrived at Town Square, the heart of the city...",
    },
    {
        name: "701 Robin Rd",
        lat: 38.00406040858161, 
        lng: -84.50295974685902,
        radius: 500,
        audioPath: "audio/christmas-sounds.mp3",
        textContent: "You've arrived at Town Square, the heart of the city...",
    },*/
    // ... more POIs ...
  ];
  
window.pointsOfInterest = pointsOfInterest;

  function getPointsOfInterest() {
    return pointsOfInterest;
  }