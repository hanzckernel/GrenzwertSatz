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
    for (let i = 0; i < buckets.length; i++) {
        const x = i * bucketWidth;
        const y = baseY; // Base position of the distribution bars
        const height = (buckets[i] / maxBalls) * bucketHeight;

        bucketCtx.fillStyle = `rgba(0, 127, 255, ${buckets[i] / maxBalls})`;
        bucketCtx.strokeStyle = 'black'; // Border color for the bars
        bucketCtx.lineWidth = 0.5; // Border width
        bucketCtx.fillRect(x, y - height, bucketWidth, height);
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
            drawBuckets();
        }
    }

    dropNextBall();
}

function stopExperiment() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    alert(`Experiment gestoppt. Anzahl der fallenden Bälle: ${droppedBalls}`);
}

function updateLegend(maxBalls) {
    const legend = document.getElementById('legend');
    legend.innerHTML = `Anzahl der Bälle in den Eimern (max: ${maxBalls}): <br>`;
    buckets.forEach((count, index) => {
        legend.innerHTML += `<span style="background-color: rgba(0, 127, 255, ${count / maxBalls}); 
                             display: inline-block; width: 30px; height: 10px; margin: 2px;">
                             </span> ${count} `;
    });
}

                     
// Draw pins on page load
window.onload = drawPins;