const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // Size of one grid square
const canvasSize = 400;
const rows = canvasSize / box;
const cols = canvasSize / box;

let snake, direction, food, score, gameInterval, gameStarted = false;
const gameOverMsg = document.getElementById('gameOverMsg');
let gameOverTimeout;
const scoreHistoryList = document.getElementById('scoreHistory');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const countdownDiv = document.getElementById('countdown');

// Load score history from localStorage or initialize
let scoreHistory = JSON.parse(localStorage.getItem('snakeScoreHistory') || '[]');
renderScoreHistory();

gameOverMsg.classList.add('hidden');

function randomFood() {
    return {
        x: Math.floor(Math.random() * cols) * box,
        y: Math.floor(Math.random() * rows) * box
    };
}

function resetGame() {
    snake = [ { x: 9 * box, y: 9 * box } ];
    direction = 'RIGHT';
    food = randomFood();
    score = 0;
    draw();
    document.getElementById('score').textContent = 'Score: 0';
    gameOverMsg.classList.add('hidden');
    gameOverMsg.classList.remove('fade-out');
    if (gameOverTimeout) clearTimeout(gameOverTimeout);
}

function draw() {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? '#0f0' : '#fff';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Draw food
    ctx.fillStyle = '#f00';
    ctx.fillRect(food.x, food.y, box, box);

    // Draw score
    document.getElementById('score').textContent = 'Score: ' + score;
}

function update() {
    let head = { ...snake[0] };

    switch (direction) {
        case 'LEFT': head.x -= box; break;
        case 'UP': head.y -= box; break;
        case 'RIGHT': head.x += box; break;
        case 'DOWN': head.y += box; break;
    }

    // Game over conditions
    if (
        head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        clearInterval(gameInterval);
        gameStarted = false;
        gameOverMsg.textContent = `Game Over!\nFinal Score: ${score}`;
        gameOverMsg.classList.remove('hidden', 'fade-out');
        // Save score to history
        addScoreToHistory(score);
        // Fade out after 2 seconds, then hide
        if (gameOverTimeout) clearTimeout(gameOverTimeout);
        gameOverTimeout = setTimeout(() => {
            gameOverMsg.classList.add('fade-out');
            setTimeout(() => {
                gameOverMsg.classList.add('hidden');
                gameOverMsg.classList.remove('fade-out');
            }, 700); // match transition duration
        }, 2000);
        return;
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        food = randomFood();
    } else {
        snake.pop();
    }

    draw();
}

function addScoreToHistory(newScore) {
    if (newScore > 0) {
        scoreHistory.unshift(newScore);
        if (scoreHistory.length > 5) scoreHistory = scoreHistory.slice(0, 5);
        localStorage.setItem('snakeScoreHistory', JSON.stringify(scoreHistory));
        renderScoreHistory();
    }
}

function renderScoreHistory() {
    scoreHistoryList.innerHTML = '';
    if (scoreHistory.length === 0) {
        scoreHistoryList.innerHTML = '<li>No games played yet.</li>';
    } else {
        scoreHistory.forEach((s, i) => {
            const li = document.createElement('li');
            li.textContent = s;
            scoreHistoryList.appendChild(li);
        });
    }
}

clearHistoryBtn.addEventListener('click', (e) => {
    scoreHistory = [];
    localStorage.removeItem('snakeScoreHistory');
    renderScoreHistory();
    e.target.blur(); // Remove focus after click
});

document.addEventListener('keydown', e => {
    if (!gameStarted) return;
    let moved = false;
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && direction !== 'RIGHT') {
        direction = 'LEFT';
        moved = true;
    } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && direction !== 'DOWN') {
        direction = 'UP';
        moved = true;
    } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && direction !== 'LEFT') {
        direction = 'RIGHT';
        moved = true;
    } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && direction !== 'UP') {
        direction = 'DOWN';
        moved = true;
    }
    if (moved) e.preventDefault(); // Prevent scrolling
});

function showCountdownAndStartGame() {
    let count = 3;
    countdownDiv.textContent = count;
    countdownDiv.classList.remove('hidden');
    let countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDiv.textContent = count;
        } else {
            clearInterval(countdownInterval);
            countdownDiv.classList.add('hidden');
            // Actually start the game
            gameStarted = true;
            gameInterval = setInterval(update, 100);
        }
    }, 1000);
}

document.getElementById('startBtn').addEventListener('click', (e) => {
    clearInterval(gameInterval);
    resetGame();
    e.target.blur(); // Remove focus after click
    showCountdownAndStartGame();
});

document.querySelector('#touchControls .up').addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameStarted && direction !== 'DOWN') direction = 'UP';
});
document.querySelector('#touchControls .down').addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameStarted && direction !== 'UP') direction = 'DOWN';
});
document.querySelector('#touchControls .left').addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameStarted && direction !== 'RIGHT') direction = 'LEFT';
});
document.querySelector('#touchControls .right').addEventListener('touchstart', e => {
    e.preventDefault();
    if (gameStarted && direction !== 'LEFT') direction = 'RIGHT';
});

// Draw initial state
resetGame(); 