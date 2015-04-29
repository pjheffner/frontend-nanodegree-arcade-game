// Global Variables

var NUM_ENTRIES = 3,
	ENEMY_WIDTH = 98,				// almost the full width of the visible part of image file
	ENEMY_HEIGHT = 74,
	ENEMY_INITIAL_X = 10,			// for first enemy
	ENEMY_INITIAL_Y = 60,
	ENEMY_INCR_X = 100,				// for initial placement of enemies, to space them out
	ENEMY_INCR_Y = 85,
	ENEMY_SPEED = 15,				// 1 is snails pace, 10 is beginner level, 20 is pretty darn quick
	allEnemies = [],

	PLAYER_WIDTH = 80,				// approx size of actual visible part of image file
	PLAYER_HEIGHT = 85,
	PLAYER_INITIAL_X = 200,
	PLAYER_INITIAL_Y = 415,
	PLAYER_BUFFER = 20,

	BOTTOM_BUFFER = 90,
	WATER_EDGE = 50,					// set smaller to achieve visual overlap before 'winning'
	SIDEWALK_ROW = [60, 145, 230],	// used by randomizer to randomly select sidewalk row for enemy
	
	loseSound = new Audio('sounds/scream-noooh.wav'),
	winSound = new Audio('sounds/winner.wav');

// ----------------------
// E N E M Y    S T U F F
// ----------------------

var Enemy = function(name, x, y) {
	// Enemy Constructor
	// Define enemy image
	// Set x,y coordinates and name for new Enemy each time called, name used for debugging or later enhancements
	
    this.sprite = 'images/enemy-bug.png';
	this.x = x;
	this.y = y;
	this.name = name;
	//console.log("Enemy created: ", name);
};

Enemy.prototype.update = function(dt) {
	// Update the enemy's position, required method for game
	// Parameter: dt, a time delta between ticks
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	
	var speedFactor = Math.floor(Math.random() * (30 - 1 + 1)) + 1;				// makes bugs move at varying speed
	this.x = this.x + (ENEMY_SPEED * speedFactor * dt);
	//console.log("Enemy, Position: ", name, this.x, this.y);
	
	if (this.x > ctx.canvas.clientWidth) {
	//if (this.x > clientWidth) {
		this.x = ENEMY_INITIAL_X;															// reset to starting left edge
		this.y = SIDEWALK_ROW[Math.floor(Math.random() * SIDEWALK_ROW.length)];	// this varies the row in which enemies will appear		
	}
};

Enemy.prototype.render = function() {
	// Draw the enemy on the screen
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

	this.left = this.x;
	this.right = this.x + ENEMY_WIDTH;
	this.top = this.y;
	this.bottom = this.y + ENEMY_HEIGHT;
	
	// Check for collision with player
	if (player.collided(this)) {		
		console.log("true - player collided with " + this.name);
		player.reset();
		loseSound.play();
		player.update();
		player.render();
		//console.log("---Enemy left-right-top-bottom: ", + enemy.left + " " + enemy.right + " " + enemy.top + " " + enemy.bottom);
	}
};

// ------------------------
// P L A Y E R    S T U F F
// ------------------------

var Player = function() {
	// Player Constructor
	
	this.sprite = 'images/char-princess-girl.png';
	this.x = PLAYER_INITIAL_X;
	this.y = PLAYER_INITIAL_Y;
	//console.log("Player created at starting position x,y: ", this.x, this.y);
};

Player.prototype.update = function(dt) {
	// Set fields for collided function comparisons, add/subtract extra 'hitbox' size
	// to decrease overall size so that visually they look like they are colliding instead
	// hitting on the transparent edges of the image
	//console.log ("IN player update");
	
	player.left = player.x + PLAYER_BUFFER;
	player.right = player.x + PLAYER_WIDTH - PLAYER_BUFFER;
	player.top = player.y + PLAYER_BUFFER;
	player.bottom = player.y + PLAYER_HEIGHT - PLAYER_BUFFER;
};

Player.prototype.render = function() {
	// Draw the player on the screen, if player reaches the waters edge, play appropriate sound
	//console.log ("IN player render");
	
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	if (this.y <= WATER_EDGE) {				// Did we reach the water? eg 83 is the lower edge of water
		console.log("We won");
		player.reset();
		winSound.play();
	}
};

Player.prototype.collided = function (enemy) {
	// Determine if collision occurred by comparing rectangle edges of enemy and play
	// returns a boolean value indicating whether enemy and player intersect
	// This is a "bounding box collision algorithm"
	
	//console.log ("IN player collided?", player);
	//console.log("---Enemy left-right-top-bottom: ", + enemy.left + " " + enemy.right + " " + enemy.top + " " + enemy.bottom);
	//console.log("---Player left-right-top-bottom: ", + player.left + " " + player.right + " " + player.top + " " + player.bottom);
	return !(enemy.left > player.right ||
		 enemy.right < player.left ||
		 enemy.top > player.bottom ||
		 enemy.bottom < player.top);
};

Player.prototype.reset = function() {
	// Reset player to initial x,y placement
	
	this.x = PLAYER_INITIAL_X;
	this.y = PLAYER_INITIAL_Y;
};

Player.prototype.handleInput = function(keys) {
	// Player moves via the arrow keys as defined in EventListener below
	// Player is PLAYER_WIDTH wide and PLAYER_HEIGHT tall
	// so each 'move' moves that many pixels
	// as long as it fits, o/w leave it at the edge

    switch(keys){
		case 'left' :
			//console.log("--- want to move left");
			if (this.x - PLAYER_WIDTH > 0) {			// left edge is 0 of course	
				//console.log("--- there is enough room to move left: ", this.x - PLAYER_WIDTH, " is > 0");
				this.x = this.x - PLAYER_WIDTH;
				//console.log("--- new x is: ", this.x);
			} else {
				this.x = 0;
				//console.log("--- not quite enough room, go as far as you can, new x: ", this.x);
			}
			break;
		case 'right' :
			//console.log("--- want to move right");
			if ((this.x + PLAYER_WIDTH) < (ctx.canvas.clientWidth - PLAYER_WIDTH - PLAYER_BUFFER)) {		// width is 505, but x represents the left edge, 
																				// so need to allow PLAYER_WIDTH room for full image in calc
				//console.log("--- there is enough room to move right: ", this.x + PLAYER_WIDTH, " is < ", ctx.canvas.clientWidth - PLAYER_WIDTH - 20);
				this.x = this.x + PLAYER_WIDTH;
				//console.log("---new x is: ", this.x);
			} else {														// not enough room to move fully, so move to edge
				this.x = (ctx.canvas.clientWidth - PLAYER_WIDTH - PLAYER_BUFFER);
				//console.log("--- not quite enough room, go as far as you can", this.x);
			}
			break;
		case 'up' :									// In the case of 'up', when we reach the water, we win.
			//console.log("--- want to move up");
			if (this.y - PLAYER_HEIGHT > 0) {		// Room to move up
				//console.log("--- there is enough room to move up: ", this.y - PLAYER_HEIGHT, " is > 0");
				this.y = this.y - PLAYER_HEIGHT;		// So move up
				//console.log("--- new y is: ", this.y);
			} else {
				this.y = 0;
				//console.log("--- not quite enough room, go as far as you can, new y: ", this.y);
			}
			break;
		case 'down' :
			//console.log("--- want to move down");
			if ((this.y + PLAYER_HEIGHT) < (ctx.canvas.clientHeight - PLAYER_HEIGHT - BOTTOM_BUFFER)) {	// similar to right, need to allow for img height in calc
				//console.log("--- there is enough room to move down: ", this.y + PLAYER_HEIGHT, " is < ", ctx.canvas.clientHeight - PLAYER_HEIGHT - 80);
				this.y = this.y + PLAYER_HEIGHT;
				//console.log("--- new y is: ", this.y);
			} else {
				this.y = (ctx.canvas.clientHeight - PLAYER_HEIGHT - BOTTOM_BUFFER);
				//console.log("--- not quite enough room, go as far as you can, new y: ", this.y);
			}
			break;
	}
	//console.log("calling update, then render");
	player.update();
	player.render();
	//console.log("*** Player moved to left-right-top-bottom: ", + player.left + " " + player.right + " " + player.top + " " + player.bottom);
};

// ------------------
// M A I N  
// ------------------
// Instantiate all enemy objects and the player object
// Place all enemy objects in an array called allEnemies
// which is used by Engine.js

var x = ENEMY_INITIAL_X, y = ENEMY_INITIAL_Y;				// initial coordinates for 1st Enemy
for (var i = 1; i <= NUM_ENTRIES; i++) {						// Create 3 enemies, updating x,y for each
	var enemy = new Enemy('Enemy' + i, x, y);
	allEnemies.push(enemy);
	x = x + ENEMY_INCR_X;									// to align like the sample board
	y = y + ENEMY_INCR_Y;									// to align within the rows
}

var player = new Player();								// Instantiate 1 Player
console.log("Player created: ", player);

document.addEventListener('keyup', function(e) {
// This listens for key presses and sends the keys to your
// Player.handleInput() method.

    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});
