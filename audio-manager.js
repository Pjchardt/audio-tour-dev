// audio-manager.js
// Responsible for managing spatial audio with Howler.js

function createSpatialSound(audioPath, onReady) {
    // We'll return a Howl instance
    return new Howl({
      src: [audioPath],
      loop: true,
      volume: 1.0,
      pannerAttr: {
        panningModel: 'HRTF',
        distanceModel: 'linear',
        refDistance: 1,
        maxDistance: 1000,
        rolloffFactor: 1
      },
      onload: onReady,
      onplay: () => console.log('Looped sound is playing.')
    });
  }