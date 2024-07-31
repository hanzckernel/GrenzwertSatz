document.getElementById('startButton').addEventListener('click', startExperiment);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

const pinRows = 10;
const pinCols = 9;
const pinSpacing = canvas.width / (pinCols + 1);
const pinRadius = 5;
const ballRadius = 4;
const bucketHeight = 50;
const buckets = Array(pinCols + 1).fill(0);

function drawPins() {
    ctx.fillStyle = 'black';
    for (let row = 0; row < pinRows; row++) {
        for (let col = 0; col <= row; col++) {
            const x = (canvas.width / 2) - (row * pinSpacing / 2) + (col * pinSpacing);
            const y = (row + 1) * 30;
            ctx.beginPath();
            ctx.arc(x, y, pinRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBuckets() {
    const bucketWidth = canvas.width / buckets.length;
    ctx.fillStyle = 'blue';
    for (let i = 0; i < buckets.length; i++) {
        const x = i * bucketWidth;
        const y = canvas.height - bucketHeight;
        const height = (buckets[i] / Math.max(...buckets)) * bucketHeight;
        ctx.fillRect(x, y - height, bucketWidth - 2, height);
    }
}

function dropBall() {
    let x = canvas.width / 2;
    for (let row = 0; row < pinRows; row++) {
        x += Math.random() < 0.5 ? -pinSpacing / 2 : pinSpacing / 2;
    }
    const bucketIndex = Math.round((x / canvas.width) * pinCols);
    buckets[bucketIndex]++;
}

function startExperiment() {
    const numBalls = document.getElementById('numBalls').value;
    buckets.fill(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPins();
    for (let i = 0; i < numBalls; i++) {
        dropBall();
    }
    drawBuckets();
}
