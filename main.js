/*

Software 202126885 Kim Minseok

 */

let gl;
let buffer;
let currentColor = [1.0, 0.0, 0.0, 1.0]; // red

const vertexShaderSource = `

    attribute vec2 a_position; // 정점 좌표
    uniform float theta;    // 회전 각도
     
    void main() { 
        float cosTheta = cos(theta);
        float sinTheta = sin(theta);
        
        vec2 rotatePosition = vec2(
            cosTheta * a_position.x - sinTheta * a_position.y  , 
            sinTheta * a_position.x + cosTheta * a_position.y 
        ); 
        gl_Position = vec4(rotatePosition, 0.0, 1.0);     
    } 
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color; 
    }
`;

let x = -0.5;
let y = 0.0;

const verticesK = new Float32Array([

    // k
    x, y,
    x + 0.05, y,
    x, y + 0.5,

    x, y + 0.5,
    x + 0.05, y + 0.5,
    x + 0.05, y,

    x, y + 0.25,
    x + 0.3, y + 0.5,
    x + 0.35, y + 0.5,

    x, y + 0.25,
    x, y + 0.20,
    x + 0.35, y + 0.5,

    x, y + 0.25,
    x + 0.3, y,
    x + 0.35, y,

    x, y + 0.30,
    x, y + 0.25,
    x + 0.35, y,
]);

x = 0.0;
y = 0.0;

const verticesM = new Float32Array([
    // M
    x, y,
    x + 0.05, y,
    x, y + 0.5,

    x, y + 0.5,
    x + 0.05, y + 0.5,
    x + 0.05, y,

    x, y + 0.5,
    x + 0.05, y + 0.5,
    x + 0.2, y,

    x + 0.05, y + 0.5,
    x + 0.2, y + 0.1,
    x + 0.2, y,

    x + 0.2, y + 0.1,
    x + 0.2, y,
    x + 0.35, y + 0.5,

    x + 0.2, y,
    x + 0.35, y + 0.5,
    x + 0.4, y + 0.5,

    x + 0.4, y + 0.5,
    x + 0.4, y,
    x + 0.35, y,

    x + 0.35, y + 0.5,
    x + 0.4, y + 0.5,
    x + 0.35, y,
])

x = 0.5;
y = 0.0;

const verticesS = new Float32Array([

    // S
    x, y + 0.5,
    x + 0.3, y + 0.5,
    x, y + 0.45,

    x + 0.3, y + 0.5,
    x + 0.3, y + 0.45,
    x, y + 0.45,

    x, y + 0.5,
    x, y + 0.45,
    x + 0.3, y,

    x, y + 0.5,
    x + 0.3, y + 0.05,
    x + 0.3, y,

    x, y + 0.05,
    x + 0.3, y + 0.05,
    x, y,

    x + 0.3, y + 0.05,
    x + 0.3, y,
    x, y,
])

const vertices = new Float32Array([
    ...verticesK,
    ...verticesM,
    ...verticesS
])

const offset =  {
    K : {start: 0, count: verticesK.length / 2},
    M : {start: verticesK.length / 2, count: verticesM.length / 2},
    S : {start: verticesM.length / 2 + verticesK.length / 2, count: verticesS.length / 2},
}

let colorLocation, thetaLocation;

window.onload = function init() {

    // webgl init
    const canvas = document.getElementById("canvas");
    console.log("Webgl Context : ", gl);
    gl = canvas.getContext("webgl");
    if(!gl) {alert("WebGL does not support WebGL!");}

    // configuration
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1., 1., 1., 1.);

    // Shader 설정
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    // Shader 합치기
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader); // link program <-> vertexShader
    gl.attachShader(program, fragmentShader); // link program <-> fragmentShader
    gl.linkProgram(program);
    gl.useProgram(program);

    // color
    colorLocation = gl.getUniformLocation(program, "u_color");
    thetaLocation = gl.getUniformLocation(program, "theta");

    // 메모리 영역 - Buffer 생성
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 위치 계산
    const position = gl.getAttribLocation( program, "a_position" );

    gl.enableVertexAttribArray( position );
    gl.vertexAttribPointer(
        position, // 설정한 정점 속성의 위치
        2,
        gl.FLOAT, // 데이터 타입
        false, // 정규화 여부
        0, // 데이터 간격
        0 // offset
    );

    render();
}

let isRotating = false;
let alpha = 0.05;

let theta = 0.0; // 회전 각도
function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Color
    gl.uniform4fv(colorLocation, currentColor);

    // Rotation
    if(isRotating) theta += alpha;
    gl.uniform1f(thetaLocation, theta);

    gl.drawArrays(gl.TRIANGLES, offset.K.start,offset.K.count);
    gl.drawArrays(gl.TRIANGLES, offset.M.start, offset.M.count);
    gl.drawArrays(gl.TRIANGLES, offset.S.start, offset.S.count);

    // loop
    requestAnimationFrame(render);
}

// Animation and Interaction

const buttonClick = document.getElementById("button").onclick = (event) => {
    isRotating = !isRotating;

    if(!isRotating) theta = 0.0;
};

const sliderChange = document.getElementById("slider").onchange = (event) => {
    alpha = event.target.value * 0.001;
};

const colorSelect = document.getElementById("Color").onchange = (event) => {
    const selected = event.target.value;

    console.log("select :  " ,selected);
    if(selected === "red") {
        currentColor = [1.0, 0.0, 0.0, 1.0];
    } else if (selected === "green") {
        currentColor = [0.0, 1.0, 0.0, 1.0];
    } else if (selected === "blue") {
        currentColor = [0.0, 0.0, 1.0, 1.0];
    }
};

let move = { X: 0.0, Y: 0.0 }

function updateVertices(){

    for(let i = 0 ; i + 1 < vertices.length ; i += 2){
        vertices[i] += move.X; // pos x
        vertices[i+1] += move.Y; // pos y
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices);
}

window.addEventListener("keydown", function(event) {
    const moveSpeed = 0.03;
    switch (event.key) {
        case "ArrowLeft":
            move.X = -moveSpeed;
            move.Y = 0.0;
            break;

        case "ArrowRight":
            move.X = moveSpeed;
            move.Y = 0.0;
            break;

        case "ArrowUp":
            move.X = 0.0;
            move.Y = moveSpeed;
            break;

        case "ArrowDown":
            move.X = 0.0
            move.Y = -moveSpeed;
            break;
    }
    updateVertices();
});


