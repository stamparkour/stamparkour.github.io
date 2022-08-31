/**
 * 
 * @param {string} v
 */
const $ = (v) => document.getElementById(v);
var canvas;
var ctx;

var color = [
	{ c: rgb(255, 255, 0), m: rgb(150, 150, 0) },//yellow
	{ c: rgb(0, 255, 0), m: rgb(0, 150, 0) },//green
	{ c: rgb(255, 0, 0), m: rgb(150, 0, 0) },//red
	{ c: rgb(255, 0, 255), m: rgb(150, 0, 150) },//purple
	{ c: rgb(0, 0, 255), m: rgb(0, 0, 150) },//blue
	{ c: rgb(255, 127, 0), m: rgb(150, 75, 0) },//orange
	{ c: rgb(0, 255, 255), m: rgb(0, 150, 150) },//light blue
];

var map = [];

var piece = [
	[//rot 0
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[1, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[1, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
	],
	[//rot 1
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[1, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[1, 1, 0, 0],
			[1, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[1, 0, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[1, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
	[//rot 2
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[1, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 1, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[1, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 1, 0, 0],
		],
	],
	[//rot 3
		[
			[0, 0, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[1, 0, 0, 0],
			[1, 1, 0, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[1, 1, 0, 0],
			[1, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 1, 0, 0],
			[0, 1, 1, 0],
			[0, 1, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 1, 0],
			[0, 0, 1, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 1, 0],
			[1, 1, 1, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
		[
			[0, 0, 0, 0],
			[1, 1, 1, 1],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		],
	],
];

var currentKeys = {};

var mainTheme = new Audio('tetris.mp3');

function onload() {
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
	
	canvas = $('canvas');
	ctx = canvas.getContext('2d');

	resetMap();

	setInterval(update, 50);
}

var domainClicked = false;
function ondomainclick() {
	if (domainClicked) return;
	domainClicked = true;
	mainTheme.playbackRate = 1.2;
	mainTheme.addEventListener("ended", () => {

		mainTheme.play();
	})


	mainTheme.play();
}

/**
 * 
 * @param {KeyboardEvent} key
 */
function keyDown(key) {
	currentKeys[key.code] = true;
}

/**
 * 
 * @param {KeyboardEvent} key
 */
function keyUp(key) {
	delete currentKeys[key.code];
}

function resetMap() {
	map = new Array(10);
	for (let i = 0; i < map.length; i++) {
		map[i] = new Array(20);
		for (let j = 0; j < map[i].length; j++) {
			map[i][j] = -1
		}
	}
}

/**
 * 
 * @param {number} ms
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param {number} ms
 * @param {Function} task
 */
function task(ms, task) {
	setTimeout(task, ms);
}

/**
 * 
 * @param {number} v
 * @param {number} max
 */
function loop(v, max) {
	return ((v % max) + max) % max;
}


/**
 * 
 * @param {number} X
 * @param {number} Y
 * @param {number} R
 * @param {number} p
 */
function drawPiece(X, Y, R, p) {
	R = loop(R, 4);
	for (let X1 = 0; X1 < 4; X1++) {
		for (let Y1 = 0; Y1 < 4; Y1++) {
			if (piece[R][p][Y1][X1] == 1) {
				let x = X1 + X;
				let y = Y1 + Y;
				drawBox(x, y, p);
			}
		}
	}
}

/**
 * 
 * @param {number} X
 * @param {number} Y
 * @param {number} R
 * @param {number} p
 */
function isCollisionPiece(X, Y, R, p) {
	let xOff = 6;
	let yOff = 2;
	R = loop(R, 4);
	for (let X1 = 0; X1 < 4; X1++) {
		for (let Y1 = 0; Y1 < 4; Y1++) {
			if (piece[R][p][Y1][X1] == 1) {
				let x = X1 + X - xOff;
				let y = Y1 + Y - yOff;
				if (x < 0 || y < 0 || x > 9 || y > 19) {
					return false;
				}

				if (map[x][y] >= 0) {
					return false;
				}
			}
		}
	}

	return true;
}

/**
 * 
 * @param {number} x
 * @param {number} y
 * @param {number} c
 */
function drawBox(x, y, c) {
	if (c < 0) return;
	ctx.fillStyle = color[c].m;
	ctx.fillRect(x * 4, y * 4, 4, 4);
	ctx.fillStyle = color[c].c;
	ctx.fillRect(x * 4 + 1, y * 4 + 1, 2, 2);
}

function drawWorld() {
	let xOff = 6;
	let yOff = 2;
	for (let x = 0; x < map.length; x++) {
		for (let y = 0; y < map[x].length; y++) {
			let X = xOff + x;
			let Y = xOff + y;

			drawBox(X,Y, map[x][y]);
		}
	}
}

function rgb(r,g,b) {
	return `rgb(${r},${g},${b})`;
}

function clearScreen() {
	ctx.fillStyle = "black";
	ctx.fillRect(0,0, canvas.width, canvas.height);
}


var currentPiece = 0;
var curX = 4;
var curY = 0;
var tick = 0;
function update() {
	clearScreen();
	drawWorld();
	tick++;
}