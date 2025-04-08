const unicorn = document.getElementById('unicorn');
const obstaclesContainer = document.getElementById('obstacles-container');
const scoreElement = document.getElementById('score-value');
const titleScreen = document.getElementById('title-screen');
const gameContent = document.getElementById('game-content');
const gameOverScreen = document.getElementById('game-over-screen');
const winScreen = document.getElementById('win-screen');

let score = 0;
let isJumping = false;
let gameLoop;
const WINNING_SCORE = 5;
let gameStarted = false;
let gameOver = false;
let hasWon = false;

let flowers = [];
let nextFlowerId = 0;
const MIN_SPAWN_INTERVAL = 1000; // Minimum spawn time: 1 second
const MAX_SPAWN_INTERVAL = 2000; // Maximum spawn time: 2 seconds
let spawnTimeout;

const jumpSound = new Audio('assets/jump.wav');

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            hideGameOver();
            resetGame();
        } else if (!isJumping) {
            jump();
        }
    }
});

function startGame() {
    gameStarted = true;
    gameOver = false;
    titleScreen.style.display = 'none';
    gameContent.classList.remove('hidden');
    resetGame();
}

function jump() {
    isJumping = true;
    unicorn.classList.add('jump');
    jumpSound.currentTime = 0; // Reset the sound in case it was already playing
    jumpSound.play();
    
    setTimeout(() => {
        unicorn.classList.remove('jump');
        isJumping = false;
    }, 500);
}

function showGameOver(wonGame = false) {
    gameOver = true;
    hasWon = wonGame;
    gameContent.classList.add('hidden');
    
    if (wonGame) {
        winScreen.classList.add('visible');
    } else {
        gameOverScreen.classList.add('visible');
    }
    
    // Clear any remaining flowers
    flowers.forEach(flower => flower.element.remove());
    flowers = [];
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    if (spawnTimeout) {
        clearTimeout(spawnTimeout);
    }
}

function hideGameOver() {
    gameOver = false;
    hasWon = false;
    gameOverScreen.classList.remove('visible');
    winScreen.classList.remove('visible');
    gameContent.classList.remove('hidden');
}

function createFlower() {
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.id = `flower-${nextFlowerId++}`;
    flower.style.right = '0px';
    obstaclesContainer.appendChild(flower);
    return {
        element: flower,
        position: window.innerWidth,
        id: flower.id
    };
}

function moveFlowers() {
    flowers = flowers.filter(flower => {
        flower.position -= 7; //Slightly easier
        flower.element.style.right = window.innerWidth - flower.position + 'px';
        
        // Check collision first
        const unicornRect = unicorn.getBoundingClientRect();
        const flowerRect = flower.element.getBoundingClientRect();
        
        if (isCollision(unicornRect, flowerRect)) {
            showGameOver(false);
            return false;
        }

        // Update score as soon as flower moves completely off screen
        const gameContainer = document.getElementById('game-container');
        const containerRect = gameContainer.getBoundingClientRect();
        if (flowerRect.right < containerRect.left) {
            flower.element.remove();
            score++;
            scoreElement.textContent = score;
            if (score >= WINNING_SCORE) {
                showGameOver(true);
                return false;
            }
            return false;
        }
        return true;
    });
    
    if (!gameOver) {
        gameLoop = requestAnimationFrame(moveFlowers);
    }
}

function spawnFlowers() {
    if (!gameOver && gameStarted) {
        flowers.push(createFlower());
        // Schedule next spawn with random delay
        const randomDelay = Math.random() * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL) + MIN_SPAWN_INTERVAL;
        spawnTimeout = setTimeout(spawnFlowers, randomDelay);
    }
}

function isCollision(rect1, rect2) {
    // Reduce padding for more precise collision with flower sprite
    const padding = 5;
    return !(rect1.right - padding < rect2.left + padding || 
             rect1.left + padding > rect2.right - padding || 
             rect1.bottom - padding < rect2.top + padding || 
             rect1.top + padding > rect2.bottom - padding);
}

function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    flowers.forEach(flower => flower.element.remove());
    flowers = [];
    nextFlowerId = 0;
    
    if (gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    if (spawnTimeout) {
        clearTimeout(spawnTimeout);
    }
    
    // Start the game loops
    moveFlowers();
    spawnFlowers(); // This will start the recursive spawn cycle
}