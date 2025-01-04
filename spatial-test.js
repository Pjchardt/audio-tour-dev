'use strict';

// Cache some commonly used values.
var circle = Math.PI * 2;
var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk/i.test(navigator.userAgent);

/**
 * Main game class that runs the tick and sets up all other components.
 */
var Game = function() {
  this.lastTime = 0;

  // Setup our different game components.
  this.howlInstance = window.createSpatialSound("audio/bird-1.mp3");
  this.howlInstance.on('load', () => {
          console.log(`Spatial sound loaded`);
            });
  this.howlInstance.pos(0, 0, 0);
    // The user is at (0,0,0)
   Howler.pos(0, 0, 0);
   this.howlInstance.play();
  
  requestAnimationFrame(this.tick.bind(this));
};
Game.prototype = {
  /**
   * Main game loop that renders the full scene on each screen refresh.
   * @param  {Number} time
   */
  tick: function(time) {
    var ms = time - this.lastTime;
    this.lastTime = time;

    let x = Math.sin(time * .0001)*20;
    let z = Math.cos(time * .0001)*20;
    Howler.pos(x, 0, z);
    let userPosition = document.getElementById('listenerPos');
    if (userPosition) {
        userPosition.textContent = `Lisitner Position: x=${x.toFixed(0)}, y=0, z=${z.toFixed(0)}`;
    }
   

    // Continue the game loop.
    requestAnimationFrame(this.tick.bind(this));
  }
};

// Setup and start the new game instance.
var game = new Game();