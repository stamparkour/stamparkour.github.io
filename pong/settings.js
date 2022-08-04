var $ = function (id) { return document.getElementById(id); };

var playerHeight;
var playerSpeed;
var playerSideOff;
var ballRadius;
var ballStartVel;
var AI;
var AIError;
var AIDelay;
var mobile;

function resetValues() {
    playerHeight = 100;
    playerSpeed = 3;
    playerSideOff = 40;
    ballRadius = 10;
    ballStartVel = 8;
    AI = "defensive";
    AIError = 800;
    AIDelay = 550;
    mobile = false;
    reloadValues();
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
        if ('mobile' in v) mobile = v.mobile == "true";
    }
}

function onload() {
    resetValues();
    settingsToGame();
    reloadValues();
}

function reloadValues() {

    $('playerHeight').setAttribute("value", playerHeight);
    $('playerSpeed').setAttribute("value", playerSpeed);
    $('ballRadius').setAttribute("value", ballRadius);
    $('ballStartVel').setAttribute("value", ballStartVel);
    document.querySelector("#ai").value = AI;
    $('AIError').setAttribute("value", AIError);
    $('AIDelay').setAttribute("value", AIDelay);
    if (mobile) {
        $('mobile').setAttribute("checked", true);
    }

}