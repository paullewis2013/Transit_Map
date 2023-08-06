function init_canvas() {
    canvas = document.getElementById('canvas');
    canvas.width = 500;
    canvas.height = 500;
    ctx = canvas.getContext('2d');

    ctx.fillStyle = '#F9F9FB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
init_canvas();

var points = [];

async function main(){
    clearCanvas();
    points = generateNPoints(50);
    drawPoints(points);
    console.log(points);

    await sleep(1000);

    let quantizedPoints = quantizePoints(points);
    drawPoints(quantizedPoints, '#FF0000');
    console.log(quantizedPoints);
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
        ctx.arc(point[0], point[1], 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

function quantizePoints(points){
    
    let quantizedPoints = [];
    let rounding = 25

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