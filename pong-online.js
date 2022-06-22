var $ = function (id) { return document.getElementById(id); };
var width = 600;
var height = 500;

var controls = { W: false, S: false} ;
var player1 = 200;
var player2 = 200;
var playerHeight = 100;
var playerWidth = 20;
var playerSideOff = 40;
var ballRadius = 10;

var ctx;
var ball;
var point1 = 0;
var point2 = 0;

var ball = {X:0,Y:0};

var AIDelayCurrent = 0;
var Wait = 0;
var socket;

function onload() {
    const canvas = $('game');
    ctx = canvas.getContext('2d', { antialias : false});
    var updateInterval = setInterval(update, 15);
    window.onkeydown = keydown;
    window.onkeyup = keyup;
}

function connect() {
    socket = new WebSocket("ws://" + $("connect-value").getAttribute("value"));
    socket.onopen = function(event) {
        console.log("socket-open");
    };
    socket.onmessage = function(event) {
        console.log(event.data);
        let gameReg = /game:(\d+)-(\d+)-(\d+)-(\d+)/;
        if(gameReg.test(event.data)) {
            let v = gameReg.exec(event.data);
            player1 = v[1];
            player2 = v[2];
            ball.X = v[3];
            ball.Y = v[4];
        }
    };
    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };
    socket.onerror = function(event) {
        console.log(`[error] ${event.data}`);
    };
}

function keydown(e) {
    if (e.code == 'KeyW' || e.code == 'ArrowUp') controls.W = true;
    if (e.code == 'KeyS' || e.code == 'ArrowDown') controls.S = true;
}

function keyup(e) {
    if (e.code == 'KeyW' || e.code == 'ArrowUp') controls.W = false;
    if (e.code == 'KeyS' || e.code == 'ArrowDown') controls.S = false;
}

function update() {

    let move = 0;
    if (controls.W) move -= 1;
    if (controls.S) move += 1;
    socket.send("move:"+move);
    clear();

    //background
    ctx.fillStyle = 'gray'
    ctx.fillRect(width / 2 - 5, 0, 10, height);

    ctx.fillStyle = 'white'
    ctx.fillRect(playerSideOff, player1, playerWidth, playerHeight);//draw player1
    ctx.fillRect(width - playerSideOff - playerWidth, player2, playerWidth, playerHeight);//draw player2
    ctx.fillRect(ball.X - ballRadius, ball.Y - ballRadius, ballRadius * 2, ballRadius * 2);//draw ball
}

function clear() {
    ctx.clearRect(0,0,width, height);
}