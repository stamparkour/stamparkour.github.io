/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let img = new ImageData(new Uint8ClampedArray([
    100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255,
    200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255,
    100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255,
    200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255
]), 4, 4);

ctx.putImageData(img, 0, 0);