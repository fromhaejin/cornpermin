const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerWidth = canvas.width * 0.15;
const playerHeight = canvas.height * 0.1;
const initialPlayerSpeed = 8;
const initialObstacleSpeed = 4;
const obstacleWidth = canvas.width * 0.15;
const obstacleHeight = canvas.height * 0.1;
const obstacleInterval = 600;
const speedIncreaseInterval = 1700;
const speedIncreaseAmount = 0.5;
const gameDuration = 30000;

let obstacles = [];
let gameOver = false;
let score = 0;
let obstacleSpeed = initialObstacleSpeed;
let playerSpeed = initialPlayerSpeed;
let gameStartTime = Date.now();

const backgroundImage = new Image();
const playerImage = new Image();
const gameOverObstacleImage = new Image();
const scoreObstacleImage = new Image();
const gameOverImage = new Image();

backgroundImage.src = 'images/background.png';
playerImage.src = 'images/player.png';
gameOverObstacleImage.src = 'images/obstacle.png';
scoreObstacleImage.src = 'images/scoreObstacle.png';
gameOverImage.src = 'images/gameover.png';

// 모든 이미지 로딩이 완료된 후 게임 루프를 시작
const images = [backgroundImage, playerImage, gameOverObstacleImage, scoreObstacleImage, gameOverImage];
let imagesLoaded = 0;

images.forEach(image => {
    image.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
            gameLoop();
        }
    };
});

const player = {
    x: canvas.width / 2 - playerWidth / 2,
    y: canvas.height - playerHeight - 10,
    width: playerWidth,
    height: playerHeight
};

let moveDirection = null;

function createObstacle() {
    const x = Math.random() * (canvas.width - obstacleWidth);
    const type = Math.random() > 0.5 ? 0 : 1;
    obstacles.push({ x, y: -obstacleHeight, type });
}

function drawPlayer() {
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 1) {
            ctx.drawImage(gameOverObstacleImage, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
        } else {
            ctx.drawImage(scoreObstacleImage, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
        }
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacleSpeed;
    });
    obstacles = obstacles.filter(obstacle => obstacle.y <= canvas.height);
}

function detectCollision() {
    obstacles.forEach(obstacle => {
        const reducedPlayerWidth = playerWidth * 0.8;
        const reducedPlayerHeight = playerHeight * 0.8;
        const reducedObstacleWidth = obstacleWidth * 0.8;
        const reducedObstacleHeight = obstacleHeight * 0.8;

        if (
            player.x < obstacle.x + reducedObstacleWidth &&
            player.x + reducedPlayerWidth > obstacle.x &&
            player.y < obstacle.y + reducedObstacleHeight &&
            player.y + reducedPlayerHeight > obstacle.y
        ) {
            if (obstacle.type === 0) {
                updateScore();
            } else {
                gameOver = true;
            }
            obstacles = obstacles.filter(o => o !== obstacle);
        }
    });
}

function updateScore() {
    score++;
    scoreElement.textContent = `점수: ${score}`;
}

function increaseObstacleSpeed() {
    obstacleSpeed += speedIncreaseAmount;
}

function checkGameOver() {
    if (Date.now() - gameStartTime >= gameDuration) {
        gameOver = true;
    }
}

function updateTimer() {
    const elapsedTime = Date.now() - gameStartTime;
    const remainingTime = Math.max((gameDuration - elapsedTime) / 1000, 0).toFixed(1);
    timerElement.textContent = `시간: ${remainingTime}s`;
}

function drawDebug() {
    ctx.strokeStyle = 'red';
    ctx.strokeRect(player.x, player.y, playerWidth, playerHeight); // 플레이어 경계

    obstacles.forEach(obstacle => {
        ctx.strokeRect(obstacle.x, obstacle.y, obstacleWidth, obstacleHeight); // 장애물 경계
    });
}

function gameLoop() {
    if (gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 게임오버 이미지 출력
        ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000';
        ctx.font = `bold ${canvas.width * 0.05}px Arial`;

        const scoreYPosition = canvas.height / 2 + canvas.height * 0.18;
        ctx.fillText(`최종 점수: ${score}`, canvas.width / 2 - canvas.width * 0.2, scoreYPosition);
        
        return;
    }

    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawObstacles();
    updateObstacles();
    detectCollision();
    checkGameOver();
    updateTimer(); // 타이머 업데이트

    drawDebug();

    if (moveDirection === 'left' && player.x > 0) {
        player.x -= playerSpeed;
    } else if (moveDirection === 'right' && player.x < canvas.width - player.width) {
        player.x += playerSpeed;
    }

    requestAnimationFrame(gameLoop);
}

// 터치 입력 처리
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);
document.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(event) {
    const touchX = event.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        moveDirection = 'left';
    } else {
        moveDirection = 'right';
    }
}

function handleTouchEnd() {
    moveDirection = null;
}

function handleTouchMove(event) {
    const touchX = event.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        moveDirection = 'left';
    } else {
        moveDirection = 'right';
    }
}

setInterval(createObstacle, obstacleInterval);
setInterval(increaseObstacleSpeed, speedIncreaseInterval);
