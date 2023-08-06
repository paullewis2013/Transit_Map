// --------------------------------------------
// canvas setup

var canvas = document.getElementById("canvas")

canvas.style.width = window.innerWidth - 10 + "px";
canvas.style.height = window.innerHeight - 10 + "px";  

var ctx = canvas.getContext('2d')

// Set actual size in memory (scaled to account for extra pixel density).
var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
canvas.width = Math.floor(window.innerWidth * scale);
canvas.height = Math.floor(window.innerHeight * scale);

// --------------------------------------------

document.addEventListener('DOMContentLoaded', main);

// fields
var points = [];
var paths = [];

async function main(){
    clearCanvas();
    points = generateNPoints(100);
    drawPoints(points);

    await sleep(1000);
    points = quantizePoints(points);
    drawPoints(points, '#ff0000');

    await sleep(1000);
    paths = generatePaths();
    drawPaths(paths);

    setInterval(draw, 1000/60);
}

// --------------------------------------------
// utility functions
// --------------------------------------------

function generateNPoints(n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        points.push([Math.random() * canvas.width, Math.random() * canvas.height]);
    }
    return points;
}

function drawPoints(points, color = '#000000') {
    ctx.fillStyle = color;
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function quantizePoints(points){
    
    let quantizedPoints = [];
    let rounding = 50

    //round each point to the nearest multiple of <rounding>
    points.forEach((point) => {
        let x = Math.round(point[0] / rounding) * rounding;
        let y = Math.round(point[1] / rounding) * rounding;
        quantizedPoints.push([x, y]);
    });

    return quantizedPoints;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearCanvas(){
    ctx.fillStyle = '#F9F9FB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(){
    clearCanvas();
    drawPaths(paths);
    drawPoints(points);
}

function drawLine(x1, y1, x2, y2){
    
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.moveTo(x1,y1);

    const controlX = Math.random() > 0.5 ? ((x1 + x2) / 2) : x1;
    const controlY = Math.random() > 0.5 ? ((y1 + y2) / 2) : y1;

    ctx.quadraticCurveTo(controlX, controlY, x2, y2);
    ctx.stroke();
}

// make a path between each point and it's closest neighbor
function generatePaths(){
    let paths = [];
    for(let i = 0; i < points.length; i++){
        let closest = findClosestNeighbor(points[i], points);
        paths.push([points[i], closest]);
    }
    return paths;
}

function findClosestNeighbor(point, points){
    let closest = points[0];
    let closestDistance = distance(point, points[0]);
    for(let i = 1; i < points.length; i++){
        let dist = distance(point, points[i]);
        if(dist < closestDistance && dist != 0){
            closest = points[i];
            closestDistance = dist;
        }
    }
    return closest;
}

// distance between two points
function distance(p1, p2){
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
                        Math.pow(p1[1] - p2[1], 2));    
}

function drawPaths(paths){

    paths.forEach((path) => {
        drawLine(path[0][0], path[0][1], path[1][0], path[1][1]);
    });
}