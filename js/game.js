// Game variables
let selectedCharacter = null;
let currentScreen = 'start';
let currentHole = 1;
let currentStrokes = 0;
let totalScore = 0;
let powerLevel = 0;
let isPowerIncreasing = true;
let powerInterval = null;
let ball = { x: 0, y: 0 };
let hole = { x: 0, y: 0 };
let ballInMotion = false;
let canvas, ctx;

// Course data
const course = [
    { par: 3, holeX: 700, holeY: 100, ballX: 100, ballY: 350 },
    { par: 4, holeX: 650, holeY: 200, ballX: 100, ballY: 300 },
    { par: 3, holeX: 600, holeY: 150, ballX: 150, ballY: 350 },
    { par: 5, holeX: 700, holeY: 100, ballX: 100, ballY: 250 },
    { par: 4, holeX: 650, holeY: 300, ballX: 100, ballY: 100 },
    { par: 3, holeX: 500, holeY: 200, ballX: 200, ballY: 350 },
    { par: 4, holeX: 600, holeY: 100, ballX: 150, ballY: 300 },
    { par: 5, holeX: 700, holeY: 250, ballX: 100, ballY: 100 },
    { par: 3, holeX: 400, holeY: 200, ballX: 200, ballY: 200 }
];

// DOM elements
const screens = {
    start: document.getElementById('start-screen'),
    characterSelect: document.getElementById('character-select'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
};

const startButton = document.getElementById('start-button');
const brianCharacter = document.getElementById('brian');
const braydenCharacter = document.getElementById('brayden');
const playerAvatar = document.getElementById('player-avatar');
const playerName = document.getElementById('player-name');
const currentHoleElement = document.getElementById('current-hole');
const currentParElement = document.getElementById('current-par');
const currentStrokesElement = document.getElementById('current-strokes');
const totalScoreElement = document.getElementById('total-score');
const powerLevelElement = document.getElementById('power-level');
const swingButton = document.getElementById('swing-button');
const finalScoreElement = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-button');

// Initialize the game
function init() {
    // Set up event listeners
    startButton.addEventListener('click', showCharacterSelect);
    brianCharacter.addEventListener('click', () => selectCharacter('brian'));
    braydenCharacter.addEventListener('click', () => selectCharacter('brayden'));
    swingButton.addEventListener('click', swing);
    playAgainButton.addEventListener('click', resetGame);
    
    // Set up canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 450;
    
    // Show start screen
    showScreen('start');
}

// Screen management
function showScreen(screenName) {
    currentScreen = screenName;
    Object.keys(screens).forEach(key => {
        if (key === screenName) {
            screens[key].classList.remove('hidden');
        } else {
            screens[key].classList.add('hidden');
        }
    });
    
    if (screenName === 'game') {
        setupHole();
    }
}

function showCharacterSelect() {
    showScreen('characterSelect');
}

function selectCharacter(character) {
    selectedCharacter = character;
    playerAvatar.src = `assets/${character}.png`;
    playerName.textContent = character === 'brian' ? 'Brian' : 'Brayden';
    showScreen('game');
}

// Game setup and mechanics
function setupHole() {
    const holeData = course[currentHole - 1];
    currentParElement.textContent = holeData.par;
    currentHoleElement.textContent = currentHole;
    currentStrokesElement.textContent = currentStrokes;
    totalScoreElement.textContent = totalScore;
    
    // Set ball and hole positions
    ball.x = holeData.ballX;
    ball.y = holeData.ballY;
    hole.x = holeData.holeX;
    hole.y = holeData.holeY;
    
    // Draw the course
    drawCourse();
}

function drawCourse() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grass
    ctx.fillStyle = '#8fbc8f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw hole
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw flag
    ctx.fillStyle = '#f00';
    ctx.fillRect(hole.x, hole.y - 30, 20, 15);
    ctx.fillStyle = '#fff';
    ctx.fillRect(hole.x, hole.y - 30, 2, 30);
    
    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw aiming line when not in motion
    if (!ballInMotion) {
        const dx = hole.x - ball.x;
        const dy = hole.y - ball.y;
        const angle = Math.atan2(dy, dx);
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x + Math.cos(angle) * 50, ball.y + Math.sin(angle) * 50);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function startPowerMeter() {
    powerLevel = 0;
    isPowerIncreasing = true;
    
    powerInterval = setInterval(() => {
        if (isPowerIncreasing) {
            powerLevel += 2;
            if (powerLevel >= 100) {
                isPowerIncreasing = false;
            }
        } else {
            powerLevel -= 2;
            if (powerLevel <= 0) {
                isPowerIncreasing = true;
            }
        }
        
        powerLevelElement.style.width = powerLevel + '%';
    }, 20);
}

function swing() {
    if (ballInMotion) return;
    
    if (!powerInterval) {
        // Start power meter
        startPowerMeter();
        swingButton.textContent = 'Stop!';
    } else {
        // Stop power meter and swing
        clearInterval(powerInterval);
        powerInterval = null;
        swingButton.textContent = 'Swing!';
        
        // Increment stroke count
        currentStrokes++;
        currentStrokesElement.textContent = currentStrokes;
        
        // Calculate direction to hole
        const dx = hole.x - ball.x;
        const dy = hole.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Add some randomness based on power level
        const accuracy = 1 - (Math.abs(powerLevel - 50) / 50) * 0.5;
        const randomAngle = angle + (Math.random() - 0.5) * (1 - accuracy) * 0.5;
        
        // Set ball velocity
        const power = powerLevel / 100 * 10;
        const vx = Math.cos(randomAngle) * power;
        const vy = Math.sin(randomAngle) * power;
        
        // Animate ball movement
        ballInMotion = true;
        animateBall(vx, vy);
    }
}

function animateBall(vx, vy) {
    let friction = 0.98;
    let animationId;
    
    function update() {
        // Apply friction
        vx *= friction;
        vy *= friction;
        
        // Update position
        ball.x += vx;
        ball.y += vy;
        
        // Check if ball is very slow (stopped)
        if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
            ballInMotion = false;
            cancelAnimationFrame(animationId);
            
            // Check if ball is in hole
            const dx = hole.x - ball.x;
            const dy = hole.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                // Ball in hole!
                setTimeout(() => {
                    completeHole();
                }, 500);
            }
        } else {
            // Check boundaries
            if (ball.x < 6 || ball.x > canvas.width - 6) {
                vx = -vx * 0.8;
                ball.x = ball.x < 6 ? 6 : canvas.width - 6;
            }
            
            if (ball.y < 6 || ball.y > canvas.height - 6) {
                vy = -vy * 0.8;
                ball.y = ball.y < 6 ? 6 : canvas.height - 6;
            }
            
            animationId = requestAnimationFrame(update);
        }
        
        // Draw updated course
        drawCourse();
    }
    
    animationId = requestAnimationFrame(update);
}

function completeHole() {
    // Calculate score for the hole
    const par = course[currentHole - 1].par;
    const holeScore = currentStrokes - par;
    totalScore += holeScore;
    totalScoreElement.textContent = totalScore;
    
    // Move to next hole or end game
    if (currentHole < course.length) {
        currentHole++;
        currentStrokes = 0;
        setupHole();
    } else {
        endGame();
    }
}

function endGame() {
    // Display final score
    let scoreText = `Final Score: ${totalScore}`;
    if (totalScore > 0) {
        scoreText += ` (+${totalScore})`;
    } else if (totalScore < 0) {
        scoreText = `Final Score: ${totalScore}`;
    } else {
        scoreText += ' (Even Par)';
    }
    
    // Add character-specific message
    if (selectedCharacter === 'brian') {
        scoreText += '<br><br>Brian says: "Not bad, but I could do better!"';
    } else {
        scoreText += '<br><br>Brayden says: "That was awesome!"';
    }
    
    finalScoreElement.innerHTML = scoreText;
    showScreen('end');
}

function resetGame() {
    currentHole = 1;
    currentStrokes = 0;
    totalScore = 0;
    showScreen('characterSelect');
}

// Initialize the game when the page loads
window.addEventListener('load', init);
