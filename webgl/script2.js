"use strict";
import { mat4, vec3, vec2, quat } from "./modules/index.js";

/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl2");

gl.clearColor(0,0.3,0.4,1);
gl.clearDepth(1);
gl.cullFace(gl.FRONT);
gl.depthFunc(gl.LESS);
//gl.drawBuffers([gl.BACK]);
gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);

function clearScreen() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

class Shader {
    prog;
    constructor(vertSource,fragSource) {
        let vert = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vert, vertSource);
        gl.compileShader(vert);
        if(!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vert))
        }

        let frag = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(frag, fragSource);
        gl.compileShader(frag);
        if(!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(frag));
        }

        let prog = gl.createProgram();
        gl.attachShader(prog, vert);
        gl.attachShader(prog, frag);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(prog));
        }

        gl.detachShader(prog,vert);
        gl.detachShader(prog,frag);
        gl.deleteShader(vert);
        gl.deleteShader(frag);

        this.prog = prog;
    }

    getAttrib(name) {
        return gl.getAttribLocation(this.prog, name);
    }

    bind() {
        gl.useProgram(this.prog);
    }
}

class Vertex {
    pos; uv; normal;
    /**
     * 
     * @param {vec3} pos 
     * @param {vec2} uv
     * @param {vec3} normal
     */
    constructor(pos, uv, normal) {
        this.pos = pos?pos:[];
        this.uv = uv?uv:[];
        this.normal = normal?normal:[];
    }

    toArr() {
        return [this.pos[0],this.pos[1],this.pos[2],this.uv[0], this.uv[1], this.normal[0], this.normal[1], this.normal[2]];
    }
}

class Mesh {
    vertArrObj;
    vertArr;
    elmArr;
    #length;
    constructor() {
        this.vertArr = gl.createBuffer();
        this.elmArr = gl.createBuffer();
        this.vertArrObj = gl.createVertexArray();
        this.#initialize();
    }

    #initialize() {
        this.bind();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertArr);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertAelmArrrr);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8*4, 0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 8*4, 3*4);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 8*4, 5*4);
    }

    setData(verts, elm) {
        let data = new Float32Array(verts.flatMap((e) => {return e.toArr();}));
        let e = new Uint16Array(elm);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertArr);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elmArr);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, e, gl.STATIC_DRAW);
        this.#length = elm.length;
    }

    bind() {
        gl.bindVertexArray(this.vertArrObj);
    }

    draw() {
        this.bind();
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.drawElements(gl.TRIANGLES, this.#length, gl.UNSIGNED_SHORT, 0)
    }
    drawInstanced(count) {
        this.bind();
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.drawElementsInstanced(gl.TRIANGLES, this.#length, gl.UNSIGNED_SHORT, 0, count);
    }
}

class Texture {
    tex;
    constructor(img) {
        this.tex = gl.createTexture();
        if(typeof img == "string") {
            let t = new Image();
            t.src = img;
            t.onload = () => {
                this.loadImage(t);
            }
        }
        else if(img.complete == undefined || img.complete == true) {
            this.loadImage(img);
        }
        else {
            img.onload = () => {
                this.loadImage(img);
            }
        }
    }

    loadImage(img) {
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    pixelateSettings() {
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    destroy() {
        gl.deleteTexture(this.tex);
    }
    
    bind(index, uniformLocaiton) {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.uniform1i(uniformLocaiton, index);
    }
}

class Material {
    textures; uniformPara;

    constructor(uniformPara,textureArr) {
        this.textures = textureArr;
        this.uniformPara = uniformPara;
    }

    bind(shader) {
        shader.bind();
        for(let i of this.uniformPara) {
            let loc = gl.getUniformLocation(shader.prog, i.name);
            if(i.isTexture) {
                this.textures[i.value].bind(i.value, loc);
            }
            else if(i.isMatrix) {
                gl["uniformMatrix"+i.func](loc, i.transpose?true:false, i.value);
            }
            else {
                gl["uniform"+i.func](loc, i.value);
            }
        }
    }
}

class MeshRenderer {
    mesh; material; shader;
    constructor(mesh,material, shader) {
        this.mesh = mesh;
        this.material = material;
        this.shader = shader;
    }

    draw() {
        this.shader.bind();
        this.material.bind(this.shader);
        this.mesh.draw();
    }
}

class Transform {
    position;scale;rotation;
    constructor() {
        this.position = vec3.create();
        this.scale = vec3.fromValues(1,1,1);
        this.rotation = quat.fromEuler(quat.create(),0,0,0);
    }

    rotate(euler) {
        quat.mul(this.rotation, this.rotation, quat.fromEuler(quat.create(), euler[0], euler[1], euler[2], "zxy"));
        quat.normalize(this.rotation, this.rotation);
    }

    getMatrix() {
        return mat4.mul(mat4.create(),
            mat4.fromTranslation(mat4.create(), this.position),
            mat4.mul(mat4.create(),
                mat4.fromScaling(mat4.create(), this.scale),
                mat4.fromQuat(mat4.create(), this.rotation)
            )
        );
    }

    forward() {
        return vec3.transformQuat(vec3.create(), vec3.fromValues(0,0,1), this.rotation);
    }
}


class InstancedMeshRenderer {
    mesh; material; shader; buffer;
    constructor(mesh,material, shader) {
        this.mesh = mesh;
        this.material = material;
        this.shader = shader;
        this.buffer = gl.createBuffer();
    }

    draw(transformArr, count) {
        this.shader.bind();
        let v = this.shader.getAttrib("transform");
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transformArr), gl.STREAM_DRAW);
        gl.vertexAttribPointer(v,4,gl.FLOAT, false, 16*4, 0);
        gl.vertexAttribPointer(v+1,4,gl.FLOAT, false, 16*4, 4*4);
        gl.vertexAttribPointer(v+2,4,gl.FLOAT, false, 16*4, 8*4);
        gl.vertexAttribPointer(v+3,4,gl.FLOAT, false, 16*4, 12*4);
        gl.enableVertexAttribArray(v);
        gl.enableVertexAttribArray(v+1);
        gl.enableVertexAttribArray(v+2);
        gl.enableVertexAttribArray(v+3);
        gl.vertexAttribDivisor(v,1);
        gl.vertexAttribDivisor(v+1,1);
        gl.vertexAttribDivisor(v+2,1);
        gl.vertexAttribDivisor(v+3,1);
        this.material.bind(this.shader);
        this.mesh.drawInstanced(count);
    }
}

class Camera {
    
}


let shader = new Shader(`#version 300 es
precision highp float;
layout(location=0) in vec3 pos;
layout(location=1) in vec2 uv_pos;
layout(location=2) in vec3 norm;
layout(location=3) in mat4 transform;
uniform mat4 projection;
out vec2 uv;
out vec3 worldPos;
out vec3 normalPos;
void main() {
    vec4 v = transform*vec4(pos,1);
    gl_Position = projection*v;
    worldPos = v.xyz;
    uv = uv_pos;
    normalPos = mat3(transform)*norm;
}`,
`#version 300 es
precision highp float;
layout(location=0) out vec4 color;
in vec2 uv;
in vec3 worldPos;
in vec3 normalPos;
uniform sampler2D tex;
void main() {
    float brightness = 0.2+(dot(normalPos,vec3(0,1,0))/2.0+0.5)*.9;
    color = texture(tex,uv)*brightness;
    color.a = 1.0;
}`);

let myMesh = new Mesh();
myMesh.setData([
    new Vertex(vec3.fromValues(-1,-1,1), vec2.fromValues(0,0),vec3.fromValues(0,0,1)),
    new Vertex(vec3.fromValues(-1,1,1), vec2.fromValues(0,1),vec3.fromValues(0,0,1)),
    new Vertex(vec3.fromValues(1,1,1), vec2.fromValues(1,1),vec3.fromValues(0,0,1)),
    new Vertex(vec3.fromValues(1,-1,1), vec2.fromValues(1,0),vec3.fromValues(0,0,1)),
    new Vertex(vec3.fromValues(-1,1,-1), vec2.fromValues(0,0),vec3.fromValues(0,1,0)),
    new Vertex(vec3.fromValues(1,1,-1), vec2.fromValues(1,0),vec3.fromValues(0,1,0)),
    new Vertex(vec3.fromValues(1,1,1), vec2.fromValues(1,1),vec3.fromValues(0,1,0)),
    new Vertex(vec3.fromValues(-1,1,1), vec2.fromValues(0,1),vec3.fromValues(0,1,0)),
    new Vertex(vec3.fromValues(-1,-1,-1), vec2.fromValues(0,0),vec3.fromValues(0,-1,0)),
    new Vertex(vec3.fromValues(-1,-1,1), vec2.fromValues(0,1),vec3.fromValues(0,-1,0)),
    new Vertex(vec3.fromValues(1,-1,1), vec2.fromValues(1,1),vec3.fromValues(0,-1,0)),
    new Vertex(vec3.fromValues(1,-1,-1), vec2.fromValues(1,0),vec3.fromValues(0,-1,0)),
    new Vertex(vec3.fromValues(-1,-1,-1), vec2.fromValues(0,0),vec3.fromValues(0,0,-1)),
    new Vertex(vec3.fromValues(1,-1,-1), vec2.fromValues(1,0),vec3.fromValues(0,0,-1)),
    new Vertex(vec3.fromValues(1,1,-1), vec2.fromValues(1,1),vec3.fromValues(0,0,-1)),
    new Vertex(vec3.fromValues(-1,1,-1), vec2.fromValues(0,1),vec3.fromValues(0,0,-1)),
    new Vertex(vec3.fromValues(1,-1,-1), vec2.fromValues(0,0),vec3.fromValues(1,0,0)),
    new Vertex(vec3.fromValues(1,-1,1), vec2.fromValues(0,1),vec3.fromValues(1,0,0)),
    new Vertex(vec3.fromValues(1,1,1), vec2.fromValues(1,1),vec3.fromValues(1,0,0)),
    new Vertex(vec3.fromValues(1,1,-1), vec2.fromValues(1,0),vec3.fromValues(1,0,0)),
    new Vertex(vec3.fromValues(-1,-1,-1), vec2.fromValues(0,0),vec3.fromValues(-1,0,0)),
    new Vertex(vec3.fromValues(-1,1,-1), vec2.fromValues(1,0),vec3.fromValues(-1,0,0)),
    new Vertex(vec3.fromValues(-1,1,1), vec2.fromValues(1,1),vec3.fromValues(-1,0,0)),
    new Vertex(vec3.fromValues(-1,-1,1), vec2.fromValues(0,1),vec3.fromValues(-1,0,0))
], [0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]);

let tex = new Texture(new ImageData(new Uint8ClampedArray([
    100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255,
    200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255,
    100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255,
    200, 200, 200, 255, 100, 100, 100, 255, 200, 200, 200, 255, 100, 100, 100, 255
]), 4, 4));
let tex2 = new Texture("resources/danny.jfif");
tex.pixelateSettings();

let theDanny = new Material([
    {
        name: "projection",
        value:mat4.identity(mat4.create()),
        func: "4fv",
        isMatrix: true,
    },
    {
        name: "tex",
        value: 0,
        isTexture: true
    },
], [tex2]);

let meshRenderDanny = new InstancedMeshRenderer(myMesh, theDanny, shader);

let time = 0;
let projection = mat4.perspective(mat4.create(), 45, canvas.width/canvas.height, 0.1,250);

function getRandomTrans() {
    let v = new Transform();
    v.position = vec3.fromValues(Math.random()*200-100, Math.random()*200-100, Math.random()*-250);
    v.rotate(vec3.fromValues(Math.random()*360, Math.random()*360, Math.random()*360));
    v.rate = vec3.fromValues(Math.random()*6.29-3.14, Math.random()*6.29-3.14, Math.random()*6.29-3.14);
    return v;
}

let positionTransform = [];
for(let i = 0; i < 100; i++) {
    positionTransform.push(getRandomTrans());    
}

document.onkeydown = (ev) => {
    if(ev.code == "Space") {
        positionTransform.push(getRandomTrans()); 
    }
}

setInterval(() => {
    theDanny.uniformPara[0].value = projection;

    let arr = [];
    for(let v of positionTransform) {
        v.rotate(v.rate);
        vec3.add(v.position, v.position, vec3.scale(vec3.create(), v.forward(), 0.1));
        arr = arr.concat([...v.getMatrix()]);
    }
    clearScreen();
    meshRenderDanny.draw(arr, positionTransform.length);
    time += 1/60;
}, 1000/60);