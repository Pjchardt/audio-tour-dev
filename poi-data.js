// poi-data.js
// Holds pointsOfInterest array and any data definitions
const pointsOfInterest = [
    {
      name: "Point of Interest 1 Name",
      lat: 38.048985,
      lng: -84.500100,
      radius: 50,
      audioPath: "audio/jfk_64kb.mp3",
      imagePath: "images/image-1.jpg",
      textContent: "Point 1 (intersection of Main and Broadway). Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
        Vestibulum sagittis ac orci sit amet sagittis. Maecenas cursus, sem at volutpat finibus, magna dui cursus velit, \
        in pharetra turpis tellus ac nunc. Curabitur sit amet tortor sodales, tincidunt lectus id, sodales ante. Maecenas \
        ligula arcu, aliquet eget nulla sit amet, mollis feugiat quam. Mauris ullamcorper ipsum ac orci lacinia aliquet. ",
    },
    {
      name: "Point of Interest 2 Name",
      lat: 38.049557,
      lng: -84.500829,
      radius: 50,
      audioPath: "audio/crowd.mp3",
      imagePath: "images/image-2.jpg",
      textContent: "Point 2 (near taco spot).",
    },
    {
      name: "Point 3",
      lat: 38.049264,
      lng: -84.500485,
      radius: 100,
      audioPath: "audio/basketball_game.mp3",
      imagePath: "images/image-3.jpg",
      textContent: "Point 3 (next to plaque along fountain steps).",
    },
    {
      name: "Point 4",
      lat: 38.048944444444444,
      lng: -84.50058333333334,
      radius: 500,
      audioPath: "audio/playground.mp3",
      imagePath: "images/image-4.jpg",
      textContent: "Point 4. (intersection of Vine and Broadway)",
    },
    {
      name: "Point 5",
      lat: 38.0489,
      lng: -84.5009,
      radius: 100,
      audioPath: "audio/violin.mp3",
      imagePath: "images/image-3.jpg",
      textContent: "Point 3 (next to plaque along fountain steps).",
    },
    {
      name: "Point 6",
      lat: 38.048497,
      lng: -84.500737,
      radius: 500,
      audioPath: "audio/clarinet.mp3",
      imagePath: "images/image-4.jpg",
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