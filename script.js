document.getElementById('startButton').addEventListener('click', startExperiment);
document.getElementById('stopButton').addEventListener('click', stopExperiment);

const pinCanvas = document.getElementById('pinCanvas');
const pinCtx = pinCanvas.getContext('2d');
const bucketCanvas = document.getElementById('bucketCanvas');
const bucketCtx = bucketCanvas.getContext('2d');

const pinRows = 10;
const pinCols = 9;
const pinSpacing = 800 / (pinCols + 1);
const pinRadius = 5;
const ballRadius = 20; // Increased ball size
const bucketHeight = 500; // Height of the distribution bars
const baseY = 600 - 40; // Base position of the distribution bars
const buckets = Array(pinCols + 1).fill(0);

let animationFrameId;
let droppedBalls = 0;
let isRunning = false;

function drawPins() {
    pinCanvas.width = 800;
    pinCanvas.height = 600;
    pinCtx.clearRect(0, 0, pinCanvas.width, pinCanvas.height);
    
    pinCtx.fillStyle = 'black';
    pinCtx.strokeStyle = 'gray'; // Border color for the slits
    pinCtx.lineWidth = 1; // Border width

    for (let row = 0; row < pinRows; row++) {
        for (let col = 0; col <= row; col++) {
            const x = (pinCanvas.width / 2) - (row * pinSpacing / 2) + (col * pinSpacing);
            const y = (row + 1) * 50;
            pinCtx.beginPath();
            pinCtx.arc(x, y, pinRadius, 0, Math.PI * 2);
            pinCtx.fill();
            pinCtx.stroke(); // Add border to the slits
        }
    }
}

function drawBuckets() {
    bucketCanvas.width = 800;
    bucketCanvas.height = 600;
    bucketCtx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height);
    
    const bucketWidth = bucketCanvas.width / buckets.length;
    const maxBalls = Math.max(...buckets);
    const normalizingFactor = Math.log(maxBalls);
    for (let i = 0; i < buckets.length; i++) {
        const x = i * bucketWidth;
        const y = baseY; // Base position of the distribution bars
        const height = (Math.log(buckets[i])/normalizingFactor) * bucketHeight;
        // const height = (buckets[i] / maxBalls) * bucketHeight;

        bucketCtx.fillStyle = `rgba(0, 127, 255, ${buckets[i] / maxBalls})`;
        bucketCtx.strokeStyle = 'black'; // Border color for the bars
        bucketCtx.lineWidth = 0.5; // Border width
        bucketCtx.fillRect(x, y - height, bucketWidth, height);
        // console.log(x, y- height, bucketWidth, height);
        bucketCtx.strokeRect(x, y - height, bucketWidth, height); // Add border to the bars
    }
    updateLegend(maxBalls);
}

function animateBall(x, y, row, callback, speed) {
    if (row >= pinRows || !isRunning) {
        const bucketIndex = Math.round((x / 800) * pinCols);
        buckets[bucketIndex]++;
        callback();
        return;
    }

    pinCtx.clearRect(0, 0, pinCanvas.width, pinCanvas.height);
    bucketCtx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height);
    drawPins(); // Draw pins
    drawBuckets(); // Draw buckets

    pinCtx.fillStyle = 'blue';
    pinCtx.strokeStyle = 'black'; // Border color for the balls
    pinCtx.lineWidth = 2; // Border width

    pinCtx.beginPath();
    pinCtx.arc(x, y, ballRadius, 0, Math.PI * 2);
    pinCtx.fill();
    pinCtx.stroke(); // Draw the border

    const nextX = x + (Math.random() < 0.5 ? -pinSpacing / 2 : pinSpacing / 2);
    const nextY = y + 50;
    // console.log(`ball coord:`, nextX, nextY)

    animationFrameId = requestAnimationFrame(() => animateBall(nextX, nextY, row + 1, callback, speed));
}

function startExperiment() {
    const numBalls = parseInt(document.getElementById('numBalls').value, 10);
    buckets.fill(0);
    pinCtx.clearRect(0, 0, pinCanvas.width, pinCanvas.height);
    bucketCtx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height);
    drawPins(); // Draw the slits immediately on start

    droppedBalls = 0;
    isRunning = true;
    const speed = 500 / numBalls; // Adjust speed based on the number of balls

    function dropNextBall() {
        if (droppedBalls < numBalls && isRunning) {
            droppedBalls++;
            animateBall(800 / 2, 0, 0, dropNextBall, speed);
        } else {
            alert(`Experiment beendet. Anzahl der fallenden Bälle: ${droppedBalls}`);
            drawBuckets();
            drawBestFittingCurve();
            displayStatistics();
        }
    }

    dropNextBall();
}

function stopExperiment() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    alert(`Experiment gestoppt. Anzahl der fallenden Bälle: ${droppedBalls}`);
    drawBuckets();
    drawBestFittingCurve();
    displayStatistics();
}

function updateLegend(maxBalls) {
    const legend = document.getElementById('legend');
    legend.innerHTML = `Anzahl der Bälle in den Eimern (max: ${maxBalls}): <br>`;
    buckets.forEach((count, index) => {
        legend.innerHTML += `<span style="background-color: rgba(0, 127, 255, ${count / maxBalls}); 
                             display: inline-block; width: 30px; height: 10px; margin: 2px;">
                             </span> ${index}:${count} `;
    });
}

// Compute mean and variation of the ball distribution
// function computeStatistics() {
//     const totalBalls = buckets.reduce((sum, count) => sum + count, 0);
//     const mean = totalBalls / buckets.length;

//     const variance = buckets.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / buckets.length;

//     return { mean, variance };
// }

// function computeStatistics() {
//     const totalBalls = buckets.reduce((sum, count) => sum + count, 0);
    
//     // Calculate weighted mean
//     const mean = buckets.reduce((sum, count, index) => sum + index * count, 0) / totalBalls;

//     // Calculate weighted variance
//     const variance = buckets.reduce((sum, count, index) => sum + count * Math.pow(index - mean, 2), 0) / totalBalls;

//     return { mean, variance };
// }

function computeStatistics() {
    const totalBalls = buckets.reduce((sum, count) => sum + count, 0);
    const middleIndex = (buckets.length - 1) / 2;

    // Calculate weighted mean with normalized indices
    const mean = buckets.reduce((sum, count, index) => sum + (index - middleIndex) * count, 0) / totalBalls;

    // Calculate weighted variance with normalized indices
    const variance = buckets.reduce((sum, count, index) => sum + count * Math.pow((index - middleIndex) - mean, 2), 0) / totalBalls;

    return { mean, variance };
}


// Draw the best fitting curve of the eventual ball distribution
function drawBestFittingCurve() {
    const { mean, variance } = computeStatistics();
    const stdDev = Math.sqrt(variance);
    
    const ctx = bucketCanvas.getContext('2d');
    // ctx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height); // Clear previous drawings
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;

    // const scaleFactor = bucketCanvas.height / (Math.max(...buckets) * 1.5); // Scale factor to fit the curve within the canvas height

    // const maxCount = Math.max(...buckets);
    // const offset = bucketCanvas.height - (maxCount * scaleFactor)*5 ;

    // Calculate the middle points of each bar
    const normalizingFactor = Math.log(Math.max(...buckets));
    const middlePoints = buckets.map((count, index) => {
        const x = (index + 0.5) * (bucketCanvas.width / buckets.length);
        const y = bucketCanvas.height - (Math.log(count)/normalizingFactor) * bucketHeight;
        // console.log(`middle point:`, x, y);
        return { x, y };
    });

    // Draw the curve through the middle points
    ctx.moveTo(middlePoints[0].x, middlePoints[0].y);
    // ctx.moveTo(middlePoints[0].x+offset, middlePoints[0].y+offset);
    for (let i = 1; i < middlePoints.length - 1; i++) {
        const cpX = (middlePoints[i].x + middlePoints[i + 1].x) / 2;
        const cpY = (middlePoints[i].y + middlePoints[i + 1].y) / 2;
        ctx.quadraticCurveTo(middlePoints[i].x, middlePoints[i].y, cpX, cpY);
    }
    // console.log(offset);

    ctx.stroke();
}

// Display mean and variance
function displayStatistics() {
    const { mean, variance } = computeStatistics();
    document.getElementById('statistics').innerText = `Mean: ${mean.toFixed(2)}, Variance: ${variance.toFixed(2)}`;
}
                     
// Draw pins on page load
window.onload = drawPins;



function generateData(numSamples, numBalls) {
    const data = [];
    for (let i = 0; i < numSamples; i++) {
        let sum = 0;
        for (let j = 0; j < numBalls; j++) {
            sum += Math.random(); // Assuming uniform distribution [0, 1)
        }
        data.push(sum);
    }
    return data;
}

// Example function to create histogram buckets
// function createBuckets(data, numBuckets) {
//     const min = Math.min(...data);
//     const max = Math.max(...data);
//     const bucketSize = (max - min) / numBuckets;
//     const buckets = new Array(numBuckets).fill(0);

//     data.forEach(value => {
//         const bucketIndex = Math.floor((value - min) / bucketSize);
//         buckets[Math.min(bucketIndex, numBuckets - 1)]++;
//     });

//     return buckets;
// }

// // Example function to draw the histogram and best fitting curve
// function drawHistogramAndCurve(data, numBuckets) {
//     const buckets = createBuckets(data, numBuckets);
//     drawBars(buckets);
//     drawBestFittingCurve(buckets);
// }

// Call the functions with appropriate parameters
const numSamples = 10000;
const numBalls = 10;
const numBuckets = 50;
const data = generateData(numSamples, numBalls);
// drawHistogramAndCurve(data, numBuckets);