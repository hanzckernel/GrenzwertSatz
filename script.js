document.getElementById('startButton').addEventListener('click', startExperiment);
document.getElementById('stopButton').addEventListener('click', stopExperiment);

const pinCanvas = document.getElementById('pinCanvas');
const pinCtx = pinCanvas.getContext('2d');
const bucketCanvas = document.getElementById('bucketCanvas');
const bucketCtx = bucketCanvas.getContext('2d');

const pinRows = 11;
const pinCols = pinRows;
const pinSpacing = 800 / (pinCols + 1);
const pinRadius = 5;
const ballRadius = 20; // Increased ball size
const buckets = Array(pinCols + 1).fill(0);

let animationFrameId;
let droppedBalls = 0;
let isRunning = false;

const bucketChart = new Chart(bucketCanvas, {
    type: 'bar',
    data: {
        labels: Array.from({ length: buckets.length }, (_, i) => i + 1),
        datasets: [{
            label: 'Ball Count',
            data: buckets,
            backgroundColor: 'rgba(0, 127, 255, 0.7)',
            borderColor: 'black',
            borderWidth: 0.5
        },
    ]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Bucket-Nummer'
                },
                ticks: {
                    autoSkip: true,
                    callback: function(value, index, values) {
                        const tickSpacing = Math.max(1, Math.floor(values.length / 10)); // Show at most 10 ticks
                        return index % tickSpacing === 0 ? value : '';
                    }
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Anzahl der Bälle'
                },
                type: 'linear',
                ticks: {
                    callback: function(value) {
                        return value.toFixed(0); // Optional: Format y-axis ticks to 0 decimal places
                    }
                }
            },
        }
    }
});

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

function animateBall(x, y, row, callback, speed) {
    if (row >= pinRows || !isRunning) {
        const bucketIndex = Math.round((x / 800) * pinCols);
        buckets[bucketIndex]++;
        bucketChart.data.datasets[0].data = buckets; // Update chart data
        bucketChart.update(); // Refresh the chart
        callback();
        return;
    }

    pinCtx.clearRect(0, 0, pinCanvas.width, pinCanvas.height);
    drawPins(); // Draw pins

    pinCtx.fillStyle = 'blue';
    pinCtx.strokeStyle = 'black'; // Border color for the balls
    pinCtx.lineWidth = 2; // Border width

    pinCtx.beginPath();
    pinCtx.arc(x, y, ballRadius, 0, Math.PI * 2);
    pinCtx.fill();
    pinCtx.stroke(); // Draw the border

    const nextX = x + (Math.random() <= 0.5 ? -pinSpacing / 2 : pinSpacing / 2);
    console.log(nextX, row);
    const nextY = y + 50;

    animationFrameId = requestAnimationFrame(() => animateBall(nextX, nextY, row + 1, callback, speed));
}

function startExperiment() {
    const numBalls = parseInt(document.getElementById('numBalls').value, 10);
    buckets.fill(0);
    pinCtx.clearRect(0, 0, pinCanvas.width, pinCanvas.height);
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
            bucketChart.data.datasets[0].data = buckets; // Update chart data
            bucketChart.update(); // Refresh the chart
            // drawBestFittingCurve();
            displayStatistics();
        }
    }

    dropNextBall();
}

function stopExperiment() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    alert(`Experiment gestoppt. Anzahl der fallenden Bälle: ${droppedBalls}`);
    bucketChart.data.datasets[0].data = buckets; // Update chart data
    bucketChart.update(); // Refresh the chart
    // drawBestFittingCurve();
    displayStatistics();
}

// function drawBestFittingCurve() {
//     const { mean, variance } = computeStatistics();
//     const stdDev = Math.sqrt(variance);

//     // Create a normal distribution for fitting
//     const scale = bucketCanvas.width / buckets.length;
//     const normalDist = Array.from({ length: buckets.length }, (_, i) => {
//         const x = i * scale;
//         const meanAdjusted = (x - (bucketCanvas.width / 2)) / (scale / 6);
//         const exponent = -0.5 * Math.pow(meanAdjusted / stdDev, 2);
//         return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
//     });

//     // Normalize to fit the canvas height
//     const maxDist = Math.max(...normalDist);
//     const heightScale = bucketCanvas.height / maxDist;
//     const normalizedDist = normalDist.map(value => value * heightScale);

//     // Create a new dataset for the normal distribution curve
//     const normalDistDataset = {
//         label: 'Best Fitting Curve',
//         data: normalizedDist,
//         borderColor: 'red',
//         borderWidth: 2,
//         fill: false,
//         type: 'line',
//         yAxisID: 'y-axis-1'
//     };

//     // Add the new dataset to the chart and update it
//     bucketChart.data.datasets.push(normalDistDataset);
//     bucketChart.update();
// }

// function drawBestFittingCurve() {
//     const { mean, variance } = computeStatistics();
//     const stdDev = Math.sqrt(variance);
    
//     const ctx = bucketCanvas.getContext('2d');
//     ctx.clearRect(0, 0, bucketCanvas.width, bucketCanvas.height); // Clear previous drawings
//     ctx.beginPath();
//     ctx.strokeStyle = 'red';
//     ctx.lineWidth = 2;

//     // Create a normal distribution for fitting
//     const scale = bucketCanvas.width / buckets.length;
//     const normalDist = Array.from({ length: buckets.length }, (_, i) => {
//         const x = i * scale;
//         const meanAdjusted = (x - (bucketCanvas.width / 2)) / (scale / 6);
//         const exponent = -0.5 * Math.pow(meanAdjusted / stdDev, 2);
//         return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
//     });

//     // Normalize to fit the canvas height
//     const maxDist = Math.max(...normalDist);
//     const heightScale = bucketCanvas.height / maxDist;

//     // Draw the normal distribution curve
//     ctx.moveTo(0, bucketCanvas.height - (normalDist[0] * heightScale));
//     for (let i = 1; i < normalDist.length; i++) {
//         const x = i * scale;
//         const y = bucketCanvas.height - (normalDist[i] * heightScale);
//         ctx.lineTo(x, y);
//     }
//     ctx.stroke();
// }

function computeStatistics() {
    const totalBalls = buckets.reduce((sum, count) => sum + count, 0);
    const middleIndex = (buckets.length - 1) / 2;

    // Calculate weighted mean with normalized indices
    const mean = buckets.reduce((sum, count, index) => sum + (index) * count, 0) / totalBalls;
    const trueMean = buckets.reduce((sum, count, index) => sum + (index- middleIndex ) * count, 0) / totalBalls;
    // Calculate weighted variance with normalized indices
    const variance = buckets.reduce((sum, count, index) => sum + count * Math.pow((index - middleIndex) - trueMean, 2), 0) / totalBalls;

    return { mean, variance };
}

function displayStatistics() {
    const { mean, variance } = computeStatistics();
    document.getElementById('statistics').innerText = `Mean: Bucket ${mean.toFixed(2)}, Variance: ${variance.toFixed(2)}`;
}

// Draw pins on page load
window.onload = drawPins;


document.getElementById('generate').addEventListener('click', function() {
    const probabilities = document.getElementById('dice-probabilities').value.split(',').map(p => eval(p.trim()));
    const numConvolutions = parseInt(document.getElementById('num-convolutions').value, 10);

    // Validation
    if (probabilities.length !== 6 || probabilities.some(isNaN)) {
        alert('Please enter exactly six valid probabilities.');
        return;
    }

    if (numConvolutions < 1 || numConvolutions > 50) {
        alert('Number of convolutions must be between 1 and 50.');
        return;
    }

    animationRunning = true;
    // Perform convolutions and animate
    animateConvolution(probabilities, numConvolutions);
});

document.getElementById('stop').addEventListener('click', function() {
    animationRunning = false;
});

function animateConvolution(initialProbs, numConvolutions) {
    const animationContainer = document.getElementById('animation-container');
    animationContainer.innerHTML = ''; // Clear previous content

    const canvas = document.createElement('canvas');
    animationContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 400;

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [], // Labels for the x-axis
            datasets: [{
                label: 'Probability',
                data: [], // Data for the bars
                backgroundColor: 'green'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Summe der Würfelseiten'
                    },
                    ticks: {
                        autoSkip: false,
                        callback: function(value, index, values) {
                            // Adjust tick spacing
                            const tickSpacing = Math.max(1, Math.floor(values.length / 10)); // Show at most 10 ticks
                            return index % tickSpacing === 0 ? value + 1 : '';
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Wahrscheinlichkeit'
                    }
                }
            }
        }
    });

    function convolve(a, b) {
        const result = Array(a.length + b.length - 1).fill(0);
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b.length; j++) {
                result[i + j] += a[i] * b[j];
            }
        }
        return result;
    }

    let currentDistribution = initialProbs.slice();
    let step = 0;

    function updateChart() {
        if (step > numConvolutions || !animationRunning) return;
        if (step > 0) {
            currentDistribution = convolve(currentDistribution, initialProbs);
        }

        const labels = Array.from({ length: currentDistribution.length }, (_, i) => i + 1);
        const maxProbability = Math.max(...currentDistribution);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = currentDistribution;
        chart.options.scales.y.max = maxProbability * 1.1; // Adjust y-axis scale
        chart.update();

        step++;
        setTimeout(updateChart, 1000);
    }

    updateChart();
}