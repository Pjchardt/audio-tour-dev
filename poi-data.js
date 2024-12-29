// poi-data.js
// Holds pointsOfInterest array and any data definitions
const pointsOfInterest = [
    {
      name: "701 Sherwood Drive",
      lat: 38.003132968634944,
      lng: -84.50344141802317,
      radius: 500,
      audioPath: "audio/bird-1.mp3",
      textContent: "This is a test location. Here is a variable to save text content.",
    },
    {
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
    },
    // ... more POIs ...
  ];
  
window.pointsOfInterest = pointsOfInterest;

  function getPointsOfInterest() {
    return pointsOfInterest;
  }