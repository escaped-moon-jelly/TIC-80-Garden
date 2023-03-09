/** @format */

// title:   game title
// author:  game developer, email, etc.
// desc:    short description
// site:    website link
// license: MIT License (change this to your license of choice)
// version: 0.1
// script:  js

/* Defining what sprite flags mean
spriteFlags: {
	0: "Do not flip or rotate",
	1: "",
	2: "",
	3: "",
	4: "",
	5: "",
	6: "",
	7: "",
}
*/

// global constants
const SCREEN_SIZE_X = 240
const SCREEN_SIZE_Y = 136

// Global state management object
var state = {
	/*
	any number of nested objects ultimately
	containing an array of entities
	has a method to update and/or draw each stored entity
	*/
	entitiesStore: {
		plants: {
			row1: [],
			row2: [],
			row3: [],
		},
		critters: {
			squirrels: [],
			crows: [],
			pets: {
				cats: [],
				dogs: [],
			},
		},
		weeds: [],
		// a recursive method for updating and drawing all the entities
		updateAndDraw: function (context, noDraw) {
			// default object to look through is the entitiesStore itself
			var objectContext = context || this
			// check every value in the object and if it's an array
			// then update and/or draw everything in it
			for (var property in objectContext) {
				if (Array.isArray(objectContext[property])) {
					var entitiesArray = objectContext[property]
					entitiesArray.forEach(function (entity) {
						entity.update()
						if (!noDraw) {
							entity.draw()
						}
					})
					// and if it's an object, then do the same within it
				} else if (typeof objectContext === 'object') {
					// keep the same this context to keep access to .updateAndDraw
					// but give it the next object to iterate through
					this.updateAndDraw.call(
						this,
						objectContext[property],
						noDraw
					)
				}
			}
			return 1
		},
	},
	frame: 0,
	frameTimes: [],
	lastFrameEndTime: 0,
	totalFrameEndTimes: [],
}

// Classes (well as close as possible in ES5)
/**
 * Represents an entity with a sprite.
 * @constructor
 * @param {Object} config - The configuration object
 * @param {Number} [config.x=0] - X coordinate
 * @param {Number} [config.y=0] - Y coordinate
 * @param {Number} [config.spriteID=255] - index of the sprite to draw
 * @param {Number} [config.colorKey=0] - index of the palette color to be transparent
 * @param {Number} [config.spriteRotation=0] - [0,1,2,3] rotates sprite by n*90 degrees
 * @param {Number} [config.spriteFlip=0] - [0,1,2,3] flips sprite along x and/or y axis
 * @param {Boolean} [config.gcExempt=false] - allows object to avoid garbage collection if necessary
 * @param {Number} [config.compositeWidth=1] - width of the composite sprite (in 8x8px areas)
 * @param {Number} [config.compositeHeight=1] - height of the composite sprite (in 8x8px areas)
 */
function Entity(config) {
	this.className = 'Entity'
	// Position Info
	this.x = config.x !== undefined ? config.x : 0
	this.y = config.y !== undefined ? config.y : 0
	// Sprite Appearance Info
	this.spriteID = config.spriteID !== undefined ? config.spriteID : 255
	this.colorKey = config.colorKey !== undefined ? config.colorKey : 0
	this.spriteRotation =
		config.spriteRotation !== undefined ? config.spriteRotation : 0
	this.spriteFlip = config.spriteFlip !== undefined ? config.spriteFlip : 0
	/* Sprite Size Info
	0 values not allowed so any falsy values should become 1
	*/
	this.spriteScale = config.spriteScale || 1
	this.compositeWidth = config.compositeWidth || 1
	this.compositeHeight = config.compositeHeight || 1
	// composite width and height are in 8x8px rectangular areas
	this.spriteSizeX = 8 * this.compositeWidth * this.spriteScale
	this.spriteSizeY = 8 * this.compositeHeight * this.spriteScale

	this.gcExempt = config.gcExempt !== undefined ? config.gcExempt : false
}
// Entity prototype methods
Entity.prototype.getPosition = function () {
	return [this.x, this.y]
}
Entity.prototype.getIsOnscreen = function () {
	var minXY = 0 - this.spriteSize
	var xOnscreen = minXY <= this.x && this.x <= SCREEN_SIZE_X
	var yOnscreen = minXY <= this.y && this.y <= SCREEN_SIZE_Y
	/*if (!xOnscreen || !yOnscreen) {
		trace("entity not onscreen: " + this.x +"," + this.y)
	}*/
	return xOnscreen && yOnscreen
}
Entity.prototype.draw = function () {
	if (!fget(this.spriteID, 0)) {
		spr(
			this.spriteID,
			this.x,
			this.y,
			this.colorKey,
			this.spriteScale,
			this.spriteFlip,
			this.spriteRotation
		)
	} else {
		// if the sprite has the noFlip flag set, ignore any rotation or flip config
		spr(
			this.spriteID,
			this.x,
			this.y,
			this.colorKey,
			this.spriteScale,
			0,
			0
		)
	}
}
Entity.prototype.update = function () {
	trace(
		'Base Entity.update() was called. Ensure all subclasses have their own update function on their prototypes.'
	)
}
/**
 * Represents the plants
 * @constructor
 * @param {Object} config - See {@link Entity}
 */
function Plant(config) {
	Entity.call(this, config)
}
// Plant Prototypes and Inheritance
Plant.prototype.update = function () {}
Object.setPrototypeOf(Plant.prototype, Entity.prototype)

// Functions ---------------------------------------------------------
/**
 * Get a random int between 0 and max (inclusive)
 * @param {Number} max -- the maximum integer
 */
function randInt(max) {
	return Math.round(Math.random() * max)
}

// Game Code ---------------------------------------------------------
/**
 * TIC-80 BOOT function, runs once on boot for initialization
 */
function BOOT() {
	state.entitiesStore.plants.row1.push(new Plant({spriteID:0}))
}
function TIC() {
	cls(13)
	print('HELLO WORLD!', 84, 84)
	state.entitiesStore.updateAndDraw()
}

// <TILES>
// 000:0677777006700670677006700000067000000670700677706767706767670670
// 255:cccccccccc0000ccc000000cc00cc00cc00cc00cc000000ccc0000cccccccccc
// </TILES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// </PALETTE>

