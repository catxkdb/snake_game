const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const restartButton = document.getElementById('restartButton');
const gameContainer = document.querySelector('.game-container');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

// Game state
let snake = [{ x: 10, y: 10 }];
let food = null;
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let gameSpeed = 300;
let gameRunning = true;
let gameStarted = false;
let lastRenderTime = 0;
let nextDirection = { dx: 0, dy: 0 };

// Initialize high score display
highScoreElement.textContent = `High Score: ${highScore}`;

// Event listeners
document.addEventListener('keydown', handleKeyPress);
restartButton.addEventListener('click', restartGame);

function handleKeyPress(e) {
    if (!gameRunning) return;
    
    // Prevent default arrow key scrolling
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    const currentDirection = { dx, dy };
    
    switch(e.key) {
        case 'ArrowUp':
            // Can't move up if moving down
            if (currentDirection.dy !== 1) {
                nextDirection = { dx: 0, dy: -1 };
                if (!gameStarted) startGame();
            }
            break;
        case 'ArrowDown':
            // Can't move down if moving up
            if (currentDirection.dy !== -1) {
                nextDirection = { dx: 0, dy: 1 };
                if (!gameStarted) startGame();
            }
            break;
        case 'ArrowLeft':
            // Can't move left if moving right
            if (currentDirection.dx !== 1) {
                nextDirection = { dx: -1, dy: 0 };
                if (!gameStarted) startGame();
            }
            break;
        case 'ArrowRight':
            // Can't move right if moving left
            if (currentDirection.dx !== -1) {
                nextDirection = { dx: 1, dy: 0 };
                if (!gameStarted) startGame();
            }
            break;
    }
}

function startGame() {
    gameStarted = true;
    generateFood(); // Generate initial food
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (tileCount - 2)) + 1,
            y: Math.floor(Math.random() * (tileCount - 2)) + 1
        };
    } while (isCollisionWithSnake(newFood));
    food = newFood;
}

function isCollisionWithSnake(position) {
    return snake.some(segment => segment.x === position.x && segment.y === position.y);
}

function gameLoop() {
    if (!gameRunning || !gameStarted) return;

    // Update snake direction
    dx = nextDirection.dx;
    dy = nextDirection.dy;

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check if snake ate food
    if (food && head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
        
        generateFood();
    } else {
        snake.pop();
    }

    // Check for game over
    if (checkGameOver()) {
        gameOver();
        return;
    }

    // Draw game
    draw();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ff6b6b' : '#e94560';
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Draw food
    if (food) {
        ctx.fillStyle = '#4ecca3';
        ctx.beginPath();
        const centerX = food.x * gridSize + gridSize / 2;
        const centerY = food.y * gridSize + gridSize / 2;
        ctx.arc(centerX, centerY, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw start message
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#e94560';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press any arrow key to start', canvas.width / 2, canvas.height / 2);
    }
}

function checkGameOver() {
    const head = snake[0];
    
    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // Self collision (check from second segment)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

function gameOver() {
    gameRunning = false;
    gameStarted = false;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e94560';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = '20px Arial';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    restartButton.classList.remove('hidden');
}

function restartGame() {
    // Reset game state
    snake = [{ x: 10, y: 10 }];
    nextDirection = { dx: 0, dy: 0 };
    dx = 0;
    dy = 0;
    score = 0;
    gameSpeed = 300;
    gameRunning = true;
    gameStarted = false;
    
    // Reset UI
    scoreElement.textContent = 'Score: 0';
    restartButton.classList.add('hidden');
    food = null;
    
    // Start game loop
    if (!gameLoop) {
        setInterval(gameLoop, gameSpeed);
    }
    
    // Initial draw
    draw();
}

// Start initial game loop
setInterval(gameLoop, gameSpeed);

// Initial draw
draw();
