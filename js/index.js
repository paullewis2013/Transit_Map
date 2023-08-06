// --------------------------------------------
// canvas setup

var canvas = document.getElementById("canvas")

canvas.style.width = window.innerWidth - 40 + "px";
canvas.style.height = window.innerHeight - 40 + "px";  

var ctx = canvas.getContext('2d')

// Set actual size in memory (scaled to account for extra pixel density).
var scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
canvas.width = Math.floor((window.innerWidth - 40) * scale);
canvas.height = Math.floor((window.innerHeight - 40) * scale);

// --------------------------------------------

document.addEventListener('DOMContentLoaded', main);

// fields
var points = [];
var paths = [];
centralStation = null;

// --------------------------------------------

async function main(){
    clearCanvas();
    points = generateNPoints(40);
    drawPoints(points);

    await sleep(1000);
    points = quantizePoints(points);
    drawPoints(points, '#ff0000');

    await sleep(1000);
    
    setInterval(draw, 1000/60);
    centralStation = getCenterStation();

    await sleep(1000);

    findStationDistances(points);
    findMinimumSpanningTree(points);
    paths = generatePaths();
    drawPaths(paths);

}

// --------------------------------------------
// utility functions
// --------------------------------------------

function generateNPoints(n) {
    let points = [];
    for (let i = 0; i < n; i++) {
        points.push({
            id: "#" + i,
            x: Math.random() * (canvas.width * 0.95) + (canvas.width * 0.025),
            y: Math.random() * (canvas.height * 0.95) + (canvas.height * 0.025),
            neighbors: []
        });
    }
    return points;
}

function drawPoints(points, color = '#000000') {
    ctx.fillStyle = color;
    points.forEach((point) => {
        ctx.beginPath();

        if(point.id == centralStation?.id){
            ctx.fillStyle = '#00ff00';
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        }else{
            ctx.fillStyle = color;
            ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        }        
        ctx.fill();
    });
}

function quantizePoints(points){
    
    let quantizedPoints = [];
    let rounding = 100

    //round each point to the nearest multiple of <rounding>
    points.forEach((point) => {
        let x = Math.round(point.x / rounding) * rounding;
        let y = Math.round(point.y / rounding) * rounding;

        let found = false;

        // if the point is already in the list, don't add it again
        for(let i = 0; i < quantizedPoints.length; i++){
            if(quantizedPoints[i].x == x && quantizedPoints[i].y == y){
                found = true;
            }
        }

        if(!found){
            quantizedPoints.push({
                id: point.id,
                x: x,
                y: y,
                neighbors: point.neighbors
            });
        }

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

    // const controlX = Math.random() > 0.5 ? ((x1 + x2) / 2) : x1;
    // const controlY = Math.random() > 0.5 ? ((y1 + y2) / 2) : y1;

    // ctx.quadraticCurveTo(controlX, controlY, x2, y2);

    ctx.lineTo(x2,y2);
    ctx.stroke();
}

// make a path between each point and its neighbors
function generatePaths(){
    
    let paths = [];

    for(let i = 0; i < points.length; i++){
        
        for (const neighbor of points[i].neighbors) {

            // check if path is vertical, horizontal, or diagonal
            if (points[i].x == getStationByID(neighbor).x || points[i].y == getStationByID(neighbor).y || Math.abs(points[i].x - getStationByID(neighbor).x) == Math.abs(points[i].y - getStationByID(neighbor).y)){
                paths.push([points[i], getStationByID(neighbor)]);
            }

            // otherwise make 1 path along a 45 degree angle and 1 path from there to the neighbor
            else{

                // if difference in x is greater than difference in y
                if(Math.abs(points[i].x - getStationByID(neighbor).x) > Math.abs(points[i].y - getStationByID(neighbor).y)){
                    
                    if(points[i].x < getStationByID(neighbor).x){

                        paths.push([
                            points[i], 
                            {x: points[i].x + Math.abs(points[i].y - getStationByID(neighbor).y), y: getStationByID(neighbor).y}
                        ]);
                        paths.push([
                            {x: points[i].x + Math.abs(points[i].y - getStationByID(neighbor).y), y: getStationByID(neighbor).y},
                            getStationByID(neighbor)
                        ]);
                    }
                }else{

                    if (points[i].y < getStationByID(neighbor).y){

                        paths.push([
                            points[i], 
                            {y: points[i].y + Math.abs(points[i].x - getStationByID(neighbor).x), x: getStationByID(neighbor).x}
                        ]);
                        paths.push([
                            {y: points[i].y + Math.abs(points[i].x - getStationByID(neighbor).x), x: getStationByID(neighbor).x},
                            getStationByID(neighbor)
                        ]);

                    }
                }
            }
        }
    }

    return paths;
}

function findClosestNeighbor(point, points){
    let closest = points[0];
    let closestDistance = distance(point, points[0]);

    for(let i = 1; i < points.length; i++){

        let dist = distance(point, points[i]);

        if(dist < closestDistance && dist != 0 && closest.neighbors.includes(points[i].id) == false){
            closest = points[i];
            closestDistance = dist;
        }
    }
    return closest;
}

function findStationDistances(points){

    for(let i = 0; i < points.length; i++){

        points[i].stationDistances = [];

        for (j = 0; j < points.length; j++){
            if (i == j){
                continue;
            }
            let dist = distance(points[i], points[j]);
            
            points[i].stationDistances.push({node:points[j].id, length: dist});
        }   

        points[i].stationDistances.sort((a, b) => a.length - b.length);
    }
    console.log(points);
}

// distance between two points
function distance(p1, p2){
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) +
                        Math.pow(p1.y - p2.y, 2));    
}

function drawPaths(paths){

    paths.forEach((path) => {
        drawLine(path[0].x, path[0].y, path[1].x, path[1].y);
    });
}

function getCenterStation(){

    // calculate center of mass
    let center = {
        x: 0, y: 0
    };
    points.forEach((point) => {
        center.x += point.x;
        center.y += point.y;
    });
    center.x /= points.length;
    center.y /= points.length;

    // find closest station to center of mass
    let closest = points[0];
    let closestDistance = distance(center, points[0]);

    points.forEach((point) => {
        let new_distance = distance(center, point);
        if (new_distance < closestDistance){
            closest = point;
            closestDistance = new_distance;
        }
    });

    return closest;
}

// use prim's algorithm to construct a spanning tree
function findMinimumSpanningTree(points) {
    const mst = [];
    const nonMST = [...points];
    const startNode = centralStation;
  
    mst.push(startNode);
    let index = nonMST.indexOf(startNode);
    nonMST.splice(index, 1);
  
    while (nonMST.length > 0) {
        let minEdge = null;
        let fromNode = null;
        let toNode = null;
    
        for (const mstNode of mst) {

            // console.log("checking neighbors of " + JSON.stringify(mstNode, null, 2))

            // console.log(mstNode.stationDistances)

            for (const neighbor of mstNode.stationDistances) { 

                // console.log("checking neighbor" + JSON.stringify(neighbor, null, 2))

                // console.log("checking if neighbor is in nonMST: " + checkForID(neighbor.node, nonMST))

                if (checkForID(neighbor.node, nonMST)) {
                    const edgeLength = neighbor.length;
                    // console.log("edge length: " + edgeLength)

                    if (!minEdge || edgeLength < minEdge) {
                        minEdge = edgeLength;
                        fromNode = getStationByID(mstNode.id);
                        toNode = getStationByID(neighbor.node);
                    }
                }
            }
        }
  
        mst.push(toNode);
        nonMST.splice(nonMST.indexOf(toNode), 1);

        console.log(fromNode.id + " -> " + toNode.id + " : " + minEdge);
    
        // Update stationDistances to remove the 'toNode'
        fromNode.neighbors.push(toNode.id);
        toNode.neighbors.push(fromNode.id);
    }
  
    return mst;
}
  
function checkForID(id, array){
    for(let i = 0; i < array.length; i++){
        if(array[i].id == id){
            return true;
        }
    }
    return false;
}

function getStationByID(id){
    for(let i = 0; i < points.length; i++){
        if(points[i].id == id){
            return points[i];
        }
    }
    return null;
}
  



// --------------------------------------------