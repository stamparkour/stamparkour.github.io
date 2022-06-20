var $ = function (id) { return document.getElementById(id); };
var width = 500;
var height = 500;

var controls = { W: false, S: false, Up: false, Down: false } ;
var player1 = 200;
var player2 = 200;
var playerHeight = 100;
var playerWidth = 20;
var playerSpeed = 3;
var playerSideOff = 40;
var ballRadius = 10;

var ctx;
var worldIdentity;
var ball;
var ballStartVel = 8;
var point1 = 0;
var point2 = 0;

var AI = "defensive";
var AIError = 800;
var AIDelay = 550;

var AIDelayCurrent = 0;
var Wait = 0;
function onload() {
    settingsToGame();
    const canvas = $('game');
    ctx = canvas.getContext('2d', { antialias : false});
    width = canvas.width;
    height = canvas.height;
    var updateInterval = setInterval(update, 15);
    window.onkeydown = keydown;
    window.onkeyup = keyup;

    worldIdentity = { X: 0, Y: 0, W: width, H: height };

    player1 = height / 2 - playerHeight / 2;
    player2 = height / 2 - playerHeight / 2;

    reset();

    if(AI != "none") {
        $("controls").innerText = "W/S OR Up/Down - Player";
    }
}

function onclose() {
    gameToCookie();
}

function parseURL(str) {
    let a = str.split('?');
    if (a.length > 1) {
        console.log(a[1].split('&'));
        console.log(a[1].split('&').map(v => v.split('=')));
        return a[1].split('&').map(v => v.split('=')).reduce((acc, v) => {
            console.log(v);
            acc[v[0]] = v[1].trim();
            return acc;
        }, {});
    }

    return null;
}

function settingsToGame() {
    let v = parseURL(document.URL);
    console.log(v);
    if (v != null) {
        if ('playerHeight' in v) playerHeight = parseFloat(v.playerHeight);
        if ('playerSpeed' in v) playerSpeed = parseFloat(v.playerSpeed);
        if ('ballRadius' in v) ballRadius = parseFloat(v.ballRadius);
        if ('ballStartVel' in v) ballStartVel = parseFloat(v.ballStartVel);
        if ('AI' in v) AI = v.AI;
        if ('AIError' in v) AIError = parseFloat(v.AIError);
        if ('AIDelay' in v) AIDelay = parseFloat(v.AIDelay);
    }
}

function toSettings() {
    let a = document.URL.split('?');
    if (a.length > 1) {
        let l = $("settings-link").getAttribute("href");
        $("settings-link").setAttribute("href", l + '?' + a[1]);
    }
}

function reset() {
    ball = { X: width / 2, Y: height / 2, vX: ballStartVel, vY: 0 };

    $('score').innerHTML = point1 + ":" + point2;

    Wait = Date.now() + 500;
}

function keydown(e) {
    if (e.code == 'KeyW') controls.W = true;
    if (e.code == 'KeyS') controls.S = true;
    if (e.code == 'ArrowUp') controls.Up = true;
    if (e.code == 'ArrowDown') controls.Down = true;
}

function keyup(e) {
    if (e.code == 'KeyW') controls.W = false;
    if (e.code == 'KeyS') controls.S = false;
    if (e.code == 'ArrowUp') controls.Up = false;
    if (e.code == 'ArrowDown') controls.Down = false;
}

function update() {

    var player1Prev = player1;
    var player2Prev = player2;

    //player logic
    if (AI == "none") {
        if (controls.Up) player2 -= 5;
        if (controls.Down) player2 += 5; 


        if (controls.W) player1 -= 5;
        if (controls.S) player1 += 5;
    }
    //ai logic
    else {
        if (AIDelayCurrent < Date.now()) {
            if (AI == "defensive") {
                MoveToTarget(aiPredict(AIError), 20);
            }
            if (AI == "follow") {
                MoveToTarget(ball.Y - playerHeight / 2, 20);
            }
            if (AI == "bounce") {
                MoveToTarget(aiPredict(AIError) + Math.pi, 20);
            }
            else if (AI == "offensive") {
                if (ball.X > width - playerSideOff - playerWidth - 50) {
                    MoveToTarget(aiPredict(AIError), 10);
                }
                else {
                    MoveToTarget(aiPredict(AIError), 50);
                }
            }
        }


        if (controls.Up || controls.W) player1 -= 5;
        if (controls.Down || controls.S) player1 += 5;
    }

    player1 = clamp(player1, 0, height - playerHeight);
    player2 = clamp(player2, 0, height - playerHeight);

    //ball logic
    if (Wait < Date.now()) {
        ball.X += ball.vX;
        ball.Y += ball.vY;
    }

    if (ball.Y < ballRadius) {
        ball.Y = ballRadius;
        ball.vY = -ball.vY;
    }

    if (ball.Y > height - ballRadius) {
        ball.Y = height - ballRadius;
        ball.vY = -ball.vY;
    }

    if (ball.X > width) {
        point1++;
        reset();
    }

    if (ball.X < 0) {
        point2++;
        reset();
    }

    if (collide(ballBound(), { X: playerSideOff, Y: player1, W: playerWidth, H: playerHeight })) {
        ball.vX = Math.abs(ball.vX);

        let offset = ball.Y - (player1 + playerHeight / 2);
        ball.vY = player1 - player1Prev + offset / playerHeight * 3;

        AIDelayCurrent = AIDelay + Date.now();
    }

    if (collide(ballBound(), { X: width - playerSideOff - playerWidth, Y: player2, W: playerWidth, H: playerHeight })) {
        ball.vX = - Math.abs(ball.vX);

        let offset = ball.Y - (player2 + playerHeight / 2);
        ball.vY = player2 - player2Prev + offset / playerHeight * 3;
    }

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

function clamp(x, min, max) {
    if (x < min) return min;
    if (x > max) return max;
    return x;
}

function collide(A, B) {
    return (A.X < B.X + B.W) && (A.X + A.W > B.X) && (A.Y < B.Y + B.H) && (A.H + A.Y > B.Y);
}

function ballBound() {
    return { X: ball.X - ballRadius, Y: ball.Y - ballRadius, W: ballRadius * 2, H: ballRadius * 2 };
}

function aiPredict(error) {
    var pos = (width - playerSideOff - playerWidth);
    var slope = ball.vY / ball.vX;
    var current = (pos - ball.X) * slope + ball.Y;

    while (current > height + error || current < - error) {
        if (current > height + error) {
            current = (height + error) * 2 - current;
        }
        if (current < 0) {
            current = -error * 2 - current;
        }
    }

    return current - playerHeight / 2;
}

function MoveToTarget(target, thresh) {
    if (ball.vX > 0 && Math.abs(target - player2) > thresh) {
        if (target < player2) player2 -= 5;
        if (target > player2) player2 += 5;
    }
}