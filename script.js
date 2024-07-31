document.getElementById('startButton').addEventListener('click', startExperiment);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const pinRows = 10;
const pinCols = 9;
const pinSpacing = canvas.width / (pinCols + 1);
const pinRadius = 5;
const ballRadius = 50; // Increased ball size
const bucketHeight = 150; // Increased height to move the distribution lower
const buckets = Array(pinCols + 1).fill(0);

function drawPins() {
    ctx.fillStyle = 'black';
    for (let row = 0; row < pinRows; row++) {
        for (let col = 0; col <= row; col++) {
            const x = (canvas.width / 2) - (row * pinSpacing / 2) + (col * pinSpacing);
            const y = (row + 1) * 50;
            ctx.beginPath();
            ctx.arc(x, y, pinRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawBuckets() {
    const bucketWidth = canvas.width / buckets.length;
    const maxBalls = Math.max(...buckets);
    for (let i = 0; i < buckets.length; i++) {
        const x = i * bucketWidth;
        const y = canvas.height - 50; // Lowered the base of the distribution
        const height = (buckets[i] / maxBalls) * bucketHeight;

        const heatmapColor = `rgba(0, 127, 255, ${buckets[i] / maxBalls})`;
        ctx.fillStyle = heatmapColor;
        ctx.fillRect(x, y - height, bucketWidth - 2, height);
    }
    updateLegend(maxBalls);
}

function animateBall(x, y, row, callback, speed) {
    if (row >= pinRows) {
        const bucketIndex = Math.round((x / canvas.width) * pinCols);
        buckets[bucketIndex]++;
        callback();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPins();
    drawBuckets();

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fill();

    const nextX = x + (Math.random() < 0.5 ? -pinSpacing / 2 : pinSpacing / 2);
    const nextY = y + 50;

    requestAnimationFrame(() => animateBall(nextX, nextY, row + 1, callback, speed));
}

function startExperiment() {
    const numBalls = parseInt(document.getElementById('numBalls').value, 10);
    buckets.fill(0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPins();

    let droppedBalls = 0;
    const speed = 500 / numBalls; // Adjust speed based on the number of balls
    const delay = 10; // Reduced delay for smoother animation

    function dropNextBall() {
        if (droppedBalls < numBalls) {
            droppedBalls++;
            animateBall(canvas.width / 2, 0, 0, dropNextBall, speed);
        } else {
            drawBuckets();
        }
    }

    dropNextBall();
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
