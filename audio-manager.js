// audio-manager.js
// Responsible for managing spatial audio with Howler.js

function createSpatialSound(audioPath, onReady) {
    // We'll return a Howl instance
    return new Howl({
      src: [audioPath],
      loop: true,
      volume: 1.0,
      html5: false, 
      pannerAttr: {
        panningModel: 'HRTF',
        distanceModel: 'exponential',
        refDistance: 1,
        maxDistance: 100,
        rolloffFactor: 1,
      },
      onload: onReady,
      onplay: () => console.log('Looped sound is playing.')
    });
  }