//============================================
// WARIO-WARE MICRO GAME SYSTEM
// ============================================

class GameManager {
    constructor() {
        this.wins = 0;
        this.losses = 0;
        this.difficulty = 1;
        this.currentGame = null;
        this.gameRunning = false;
        this.lastGameName = null; // Track last game to prevent repeats

        this.minigames = [
            { name: 'ButtonMash', display: 'Button Mash' },
            { name: 'ImgMatch', display: 'Img Match' },
            { name: 'DoodleJump', display: 'Doodle Jump' },
            { name: 'Maze', display: 'Maze' },
            { name: 'JumpKing', display: 'Jump King' }
        ];

        this.initEvents();
    }

    initEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextRound());
        document.getElementById('restartBtn').addEventListener('click', () => this.reset());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.reset());
    }

    startGame() {
        this.wins = 0;
        this.losses = 0;
        this.difficulty = 1;
        this.lastGameName = null;
        this.nextRound();
    }

    nextRound() {
        if (this.wins >= 10) {
            this.showScreen('winScreen');
            return;
        }

        // Increase difficulty every 2 wins
        this.difficulty = Math.floor(this.wins / 2) + 1;

        // Get random minigame that's different from the last one
        let gameType;
        do {
            gameType = this.minigames[Math.floor(Math.random() * this.minigames.length)];
        } while (gameType.name === this.lastGameName && this.minigames.length > 1);

        this.lastGameName = gameType.name;

        // Update UI
        document.getElementById('winCount').textContent = this.wins;
        document.getElementById('difficulty').textContent = `Difficulty: ${this.difficulty}`;

        // Show game screen
        this.showScreen('gameScreen');

        // Create minigame instance
        this.createMinigame(gameType.name);
    }

    createMinigame(gameName) {
        const gameArea = document.getElementById('gameArea');
        gameArea.innerHTML = '';

        // Calculate time based on difficulty (shorter time = harder)
        const baseTime = 10;
        const timeLimit = Math.max(2, baseTime - (this.difficulty * 0.5));

        // Map game names to classes
        const games = {
            'ButtonMash': () => new ButtonMashGame(gameArea, timeLimit, this.difficulty),
            'ImgMatch': () => new ImgMatchGame(gameArea, timeLimit, this.difficulty),
            'DoodleJump': () => new DoodleJumpGame(gameArea, timeLimit, this.difficulty),
            'Maze': () => new MazeGame(gameArea, timeLimit, this.difficulty),
            'JumpKing': () => new JumpKingGame(gameArea, timeLimit, this.difficulty)
        };

        this.currentGame = games[gameName]();

        // Start the game
        this.currentGame.start().then(result => {
            this.handleGameResult(result);
        });
    }

    handleGameResult(won) {
        this.gameRunning = false;

        if (won) {
            this.wins++;
            this.showResult(true, 'SUCCESS!');
        } else {
            this.losses++;
            this.showResult(false, 'FAILED!');
        }
    }

    showResult(success, text) {
        const resultElement = document.getElementById('resultText');
        resultElement.textContent = text;
        resultElement.className = 'result-text ' + (success ? 'success' : 'failure');
        
        this.showScreen('resultsScreen');
    }


    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    reset() {
        this.showScreen('titleScreen');
    }
}

// ============================================
// BASE MINI GAME CLASS
// ============================================

class Minigame {
    constructor(gameArea, timeLimit, difficulty) {
        this.gameArea = gameArea;
        this.timeLimit = timeLimit;
        this.difficulty = difficulty;
        this.timeRemaining = timeLimit;
        this.won = false;
        this.timerInterval = null;
        this.gamePromise = null;
    }

    async start() {
        this.gamePromise = new Promise(resolve => {
            this.resolve = resolve;
        });

        this.startTimer();
        this.setupGame();

        return this.gamePromise;
    }

    startTimer() {
        const totalTime = this.timeLimit * 1000;
        const startTime = Date.now();

        this.timerInterval = setInterval(() => {

            const elapsed = Date.now() - startTime;
            this.timeRemaining = Math.max(0, this.timeLimit - (elapsed / 1000));

            // Update UI
            document.getElementById('timerFill').style.width = (this.timeRemaining / this.timeLimit) * 100 + '%';
            document.getElementById('timeDisplay').textContent = Math.ceil(this.timeRemaining);

            // Time's up
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }, 50);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.resolve(this.won);
    }

    setupGame() {
        // Override in subclasses
        document.getElementById('instructionText').textContent = 'Minigame started!';
    }

    success() {
        this.won = true;
        this.endGame();
    }

    fail() {
        this.won = false;
        this.endGame();
    }
}

// ============================================
// MINI GAME #1: BUTTON MASH
// ============================================

class ButtonMashGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'MASH THE BUTTON!';

        // Create container for the button game
        const gameContainer = document.createElement('div');
        gameContainer.style.textAlign = 'center';
        gameContainer.style.padding = '20px';
        this.gameArea.appendChild(gameContainer);

        // Create button
        const button = document.createElement('button');
        button.textContent = 'CLICK ME!';
        button.style.padding = '40px 60px';
        button.style.fontSize = '28px';
        button.style.fontWeight = 'bold';
        button.style.backgroundColor = 'red';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.cursor = 'pointer';
        button.style.transition = 'transform 0.1s';
        button.style.marginBottom = '20px';

        // Create click counter display
        const counterDisplay = document.createElement('div');
        counterDisplay.style.fontSize = '36px';
        counterDisplay.style.fontWeight = 'bold';
        counterDisplay.style.color = '#333';
        counterDisplay.textContent = 'Clicks: 0 / 25';

        gameContainer.appendChild(button);
        gameContainer.appendChild(counterDisplay);

        // Game variables
        let clickCount = 0;
        const targetClicks = 25;
        const gameObj = this;
        let gameActive = true;

        // Function to shake the button
        function shakeButton() {
            // Calculate shake intensity (0 to 1) based on progress
            const progress = clickCount / targetClicks;
            const intensity = Math.min(progress * 15, 15); // Max 15px shake
            const shakeCount = Math.max(4, Math.floor(progress * 12)); // More shakes as progress increases

            for (let i = 0; i < shakeCount; i++) {
                setTimeout(() => {
                    const offsetX = (Math.random() - 0.5) * intensity;
                    const offsetY = (Math.random() - 0.5) * intensity;
                    button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                }, i * 30);
            }

            // Reset position
            setTimeout(() => {
                button.style.transform = 'translate(0, 0)';
            }, shakeCount * 30);
        }

        // Button click handler
        button.addEventListener('click', () => {
            if (!gameActive) return;
            
            clickCount++;
            counterDisplay.textContent = `Clicks: ${clickCount} / ${targetClicks}`;
            
            // Shake the button with intensity based on progress
            shakeButton();

            // Check win condition
            if (clickCount >= targetClicks) {
                gameActive = false;
                button.disabled = true;
                gameObj.success();
            }
        });

        // Cleanup when game ends
        const originalEndGame = this.endGame.bind(this);
        this.endGame = () => {
            gameActive = false;
            button.disabled = true;
            originalEndGame();
        };
    }
}

// ============================================
// MINI GAME #2: Img Match
// ============================================

class ImgMatchGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'MATCH THE IMAGE!';

        // Array of image paths
        const imagePaths = [
            'angy.png',
            'war.png',
            'bleh.png'
        ];

        // Randomly select the target image
        const targetImageIndex = Math.floor(Math.random() * imagePaths.length);
        const targetImage = imagePaths[targetImageIndex];

        // Create main container
        const gameContainer = document.createElement('div');
        gameContainer.style.display = 'flex';
        gameContainer.style.flexDirection = 'column';
        gameContainer.style.alignItems = 'center';
        gameContainer.style.gap = '40px';
        gameContainer.style.padding = '40px';
        this.gameArea.appendChild(gameContainer);

        // Display target image with pointillization based on difficulty
        const targetContainer = document.createElement('div');
        targetContainer.style.textAlign = 'center';
        targetContainer.style.marginBottom = '40px';

        const targetLabel = document.createElement('p');
        targetLabel.textContent = 'Find this image:';
        targetLabel.style.fontSize = '18px';
        targetLabel.style.fontWeight = 'bold';
        targetLabel.style.color = '#333';
        targetLabel.style.margin = '0 0 10px 0';

        // Create canvas for pointillized target image
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.border = '3px solid red';
        canvas.style.borderRadius = '8px';
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');

        // Load and pointillize target image based on difficulty
        const targetImg = new Image();
        targetImg.crossOrigin = 'anonymous';
        targetImg.onload = () => {
            // Calculate pixelation size based on difficulty
            // Difficulty 1-2: small pixelation (easier)
            // Difficulty 3+: large pixelation (harder)
            const pixelSize = Math.max(2, Math.ceil(this.difficulty * 5));

            // Draw pixelated image
            ctx.drawImage(targetImg, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Pixelate by sampling every pixelSize pixels
            for (let i = 0; i < canvas.width; i += pixelSize) {
                for (let j = 0; j < canvas.height; j += pixelSize) {
                    // Get color at this position
                    const pixelIndex = (j * canvas.width + i) * 4;
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];
                    const a = data[pixelIndex + 3];

                    // Fill square with this color
                    for (let x = i; x < i + pixelSize && x < canvas.width; x++) {
                        for (let y = j; y < j + pixelSize && y < canvas.height; y++) {
                            const index = (y * canvas.width + x) * 4;
                            data[index] = r;
                            data[index + 1] = g;
                            data[index + 2] = b;
                            data[index + 3] = a;
                        }
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };

        targetImg.src = targetImage;

        targetContainer.appendChild(targetLabel);
        targetContainer.appendChild(canvas);
        gameContainer.appendChild(targetContainer);

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '15px';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.flexWrap = 'wrap';

        const gameObj = this;
        let gameActive = true;

        // Create button for each image
        imagePaths.forEach((imagePath, index) => {
            const button = document.createElement('button');
            button.style.padding = '10px';
            button.style.border = '2px solid #333';
            button.style.borderRadius = '8px';
            button.style.cursor = 'pointer';
            button.style.backgroundColor = '#fff';
            button.style.transition = 'transform 0.2s';

            // Create image for button
            const img = document.createElement('img');
            img.src = imagePath;
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            img.style.display = 'block';

            button.appendChild(img);

            // Hover effect
            button.addEventListener('mouseover', () => {
                button.style.transform = 'scale(1.05)';
            });

            button.addEventListener('mouseout', () => {
                button.style.transform = 'scale(1)';
            });

            // Click handler
            button.addEventListener('click', () => {
                if (!gameActive) return;

                gameActive = false;
                button.disabled = true;

                // Check if correct image was selected
                if (index === targetImageIndex) {
                    // Correct! Highlight button in green
                    button.style.border = '3px solid #00aa00';
                    button.style.backgroundColor = '#e8f5e9';
                    gameObj.success();
                } else {
                    // Wrong! Highlight button in red
                    button.style.border = '3px solid #ff0000';
                    button.style.backgroundColor = '#ffebee';
                    gameObj.fail();
                }
            });

            buttonsContainer.appendChild(button);
        });

        gameContainer.appendChild(buttonsContainer);

        // Cleanup when game ends
        const originalEndGame = this.endGame.bind(this);
        this.endGame = () => {
            gameActive = false;
            originalEndGame();
        };
    }
}

// ============================================
// MINI GAME #3: Doodle Jump
// ============================================

class DoodleJumpGame extends Minigame {
    setupGame() { 
        document.getElementById('instructionText').textContent = 'SURVIVE!';
        
        // Store original height and make game area thinner
        const originalHeight = this.gameArea.style.height;
        this.gameArea.style.height = '250px';
        
        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = this.gameArea.clientWidth;
        canvas.height = this.gameArea.clientHeight;
        this.gameArea.appendChild(canvas);
        const context = canvas.getContext('2d');
        
        // width and height of each platform and where platforms start
const platformWidth = 100;
const platformHeight = 20;
const platformStart = canvas.height - 100;

// player physics
const gravity = 0.11;
const drag = 0.3;
const bounceVelocity = -12.5;

// minimum and maximum vertical space between each platform
let minPlatformSpace = 15;
let maxPlatformSpace = 20;

// information about each platform. the first platform starts in the
// bottom middle of the screen
let platforms = [
  {
    x: canvas.width / 2 - platformWidth / 2,
    y: platformStart,
  },
];

// get a random number between the min (inclusive) and max (exclusive)
function random(min, max) {
  return Math.random() * (max - min) + min;
}

const gameObj = this;

// fill the initial screen with platforms
let y = platformStart;
while (y > 0) {
  // the next platform can be placed above the previous one with a space
  // somewhere between the min and max space
  y -= platformHeight + random(minPlatformSpace, maxPlatformSpace);

  // a platform can be placed anywhere 25px from the left edge of the canvas
  // and 25px from the right edge of the canvas (taking into account platform
  // width).
  // however the first few platforms cannot be placed in the center so
  // that the player will bounce up and down without going up the screen
  // until they are ready to move
  let x;
  do {
    x = random(25, canvas.width - 25 - platformWidth);
  } while (
    y > canvas.height / 2 &&
    x > canvas.width / 2 - platformWidth * 1.5 &&
    x < canvas.width / 2 + platformWidth / 2
  );

  platforms.push({ x, y });
}

// the doodle jumper
const doodle = {
  width: 40,
  height: 60,
  x: canvas.width / 2 - 20,
  y: platformStart - 60,

  // velocity
  dx: 0,
  dy: 0.5,
};

// keep track of player direction and actions
let playerDir = 0;
let keydown = false;
let prevDoodleY = doodle.y;
let gameActive = true;

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Check if doodle fell off the bottom (lose condition)
  if (doodle.y > canvas.height) {
    gameActive = false;
    cancelAnimationFrame(animationId);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    gameObj.fail();
    return;
  }

  // apply gravity to doodle
  doodle.dy += gravity;

  // if doodle reaches the middle of the screen, move the platforms down
  // instead of doodle up to make it look like doodle is going up
  if (doodle.y < canvas.height / 2 && doodle.dy < 0) {
    platforms.forEach(function (platform) {
      platform.y += -doodle.dy;
    });

    // add more platforms to the top of the screen as doodle moves up
    while (platforms[platforms.length - 1].y > 0) {
      platforms.push({
        x: random(25, canvas.width - 25 - platformWidth),
        y:
          platforms[platforms.length - 1].y -
          (platformHeight + random(minPlatformSpace, maxPlatformSpace)),
      });

      // add a bit to the min/max platform space as the player goes up
      minPlatformSpace += 0.5;
      maxPlatformSpace += 0.5;

      // cap max space
      maxPlatformSpace = Math.min(maxPlatformSpace, canvas.height / 2);
    }
  } else {
    doodle.y += doodle.dy;
  }

  // only apply drag to horizontal movement if key is not pressed
  if (!keydown) {
    if (playerDir < 0) {
      doodle.dx += drag;

      // don't let dx go above 0
      if (doodle.dx > 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    } else if (playerDir > 0) {
      doodle.dx -= drag;

      if (doodle.dx < 0) {
        doodle.dx = 0;
        playerDir = 0;
      }
    }
  }

  doodle.x += doodle.dx;

  // make doodle wrap the screen
  if (doodle.x + doodle.width < 0) {
    doodle.x = canvas.width;
  } else if (doodle.x > canvas.width) {
    doodle.x = -doodle.width;
  }

  // draw platforms
  context.fillStyle = "green";
  platforms.forEach(function (platform) {
    context.fillRect(platform.x, platform.y, platformWidth, platformHeight);

    // make doodle jump if it collides with a platform from above
    if (
      // doodle is falling
      doodle.dy > 0 &&
      // doodle was previous above the platform
      prevDoodleY + doodle.height <= platform.y &&
      // doodle collides with platform
      // (Axis Aligned Bounding Box [AABB] collision check)
      doodle.x < platform.x + platformWidth &&
      doodle.x + doodle.width > platform.x &&
      doodle.y < platform.y + platformHeight &&
      doodle.y + doodle.height > platform.y
    ) {
      // reset doodle position so it's on top of the platform
      doodle.y = platform.y - doodle.height;
      doodle.dy = bounceVelocity;
    }
  });

  // draw doodle
  context.fillStyle = "yellow";
  context.fillRect(doodle.x, doodle.y, doodle.width, doodle.height);

  prevDoodleY = doodle.y;

  // remove any platforms that have gone offscreen
  platforms = platforms.filter(function (platform) {
    return platform.y < canvas.height;
  });
}

// listen to keyboard events to move doodle
const handleKeyDown = (e) => {
  const key = e.key.toLowerCase();
  // A key - move left
  if (key === 'a') {
    keydown = true;
    playerDir = -1;
    doodle.dx = -3;
  }
  // D key - move right
  else if (key === 'd') {
    keydown = true;
    playerDir = 1;
    doodle.dx = 3;
  }
};

const handleKeyUp = (e) => {
  keydown = false;
};

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// start the game
const animationId = requestAnimationFrame(loop);

// Clean up when game ends
const originalEndGame = this.endGame.bind(this);
this.endGame = () => {
  if (gameActive) {
    gameActive = false;
    cancelAnimationFrame(animationId);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("keyup", handleKeyUp);
    gameObj.success();
  }
  gameObj.gameArea.style.height = originalHeight;
  originalEndGame();
};
}}


// ============================================
// MINI GAME #4: Maze
// ============================================

class MazeGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'NAVIGATE THE MAZE!';

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = this.gameArea.clientWidth;
        canvas.height = this.gameArea.clientHeight;
        this.gameArea.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Player object
        const player = {
            x: 20,
            y: canvas.height / 2,
            size: 20,
            speed: 4
        };

        // Goal
        const goal = {
            x: canvas.width - 40,
            y: canvas.height / 2,
            size: 30
        };

        // Maze walls as rectangles
        // Helper function to generate random obstacles
        function generateRandomObstacles(canvasWidth, canvasHeight, count) {
            const obstacles = [];
            const minSize = 30;
            const maxSize = 150;
            const padding = 50; // Keep obstacles away from start and goal
            
            for (let i = 0; i < count; i++) {
                let x, y, w, h, overlaps;
                
                // Keep trying until we find a non-overlapping position
                do {
                    overlaps = false;
                    // Randomly decide if horizontal or vertical
                    const isHorizontal = Math.random() > 0.5;
                    
                    if (isHorizontal) {
                        w = Math.random() * (maxSize - minSize) + minSize;
                        h = 12;
                    } else {
                        w = 12;
                        h = Math.random() * (maxSize - minSize) + minSize;
                    }
                    
                    x = Math.random() * (canvasWidth - 30 - w - padding) + padding;
                    y = Math.random() * (canvasHeight - 20 - h - padding) + 10;
                    
                    // Check for overlaps with existing obstacles
                    for (let obstacle of obstacles) {
                        if (x < obstacle.x + obstacle.w && x + w > obstacle.x &&
                            y < obstacle.y + obstacle.h && y + h > obstacle.y) {
                            overlaps = true;
                            break;
                        }
                    }
                } while (overlaps);
                
                obstacles.push({ x, y, w, h });
            }
            
            return obstacles;
        }
        
        // Calculate obstacle count based on difficulty
        const difficultyFactor = this.difficulty;
        const obstacleCount = 8 + (difficultyFactor - 1) * 4; // 8 obstacles at difficulty 1, +4 for each level
        
        const walls = [
            // Outer walls
            { x: 0, y: 0, w: canvas.width, h: 10 },
            { x: 0, y: canvas.height - 10, w: canvas.width, h: 10 },
            { x: 0, y: 0, w: 10, h: canvas.height },
            { x: canvas.width - 10, y: 0, w: 10, h: canvas.height },
            
            // Random generated obstacles based on difficulty
            ...generateRandomObstacles(canvas.width, canvas.height, obstacleCount)
        ];

        const gameObj = this;
        let gameActive = true;

        // Track which keys are pressed
        const keys = {};
        const handleKeyDown = (e) => {
            keys[e.key] = true;
        };

        const handleKeyUp = (e) => {
            keys[e.key] = false;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Check collision with walls
        function checkWallCollision(x, y, size) {
            for (let wall of walls) {
                if (x < wall.x + wall.w && x + size > wall.x &&
                    y < wall.y + wall.h && y + size > wall.y) {
                    return true;
                }
            }
            return false;
        }

        // Game loop
        const gameLoop = setInterval(() => {
            // Update player position based on keys pressed
            let newX = player.x;
            let newY = player.y;

            if (keys['ArrowUp'] || keys['w']) newY -= player.speed;
            if (keys['ArrowDown'] || keys['s']) newY += player.speed;
            if (keys['ArrowLeft'] || keys['a']) newX -= player.speed;
            if (keys['ArrowRight'] || keys['d']) newX += player.speed;

            // Check collision before moving
            if (!checkWallCollision(newX, newY, player.size)) {
                player.x = newX;
                player.y = newY;
            }

            // Clear canvas
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw walls
            ctx.fillStyle = '#333';
            walls.forEach(wall => {
                ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
            });

            // Draw goal
            ctx.fillStyle = '#00aa00';
            ctx.fillRect(goal.x, goal.y, goal.size, goal.size);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('GOAL', goal.x + 4, goal.y + 20);

            // Draw player
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(player.x, player.y, player.size, player.size);

            // Check if player reached goal
            if (player.x < goal.x + goal.size && 
                player.x + player.size > goal.x &&
                player.y < goal.y + goal.size && 
                player.y + player.size > goal.y) {
                
                if (gameActive) {
                    gameActive = false;
                    clearInterval(gameLoop);
                    document.removeEventListener('keydown', handleKeyDown);
                    document.removeEventListener('keyup', handleKeyUp);
                    gameObj.success();
                }
            }
        }, 30);

        // Cleanup when game ends
        const originalEndGame = this.endGame.bind(this);
        this.endGame = () => {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            originalEndGame();
        };
    }
}

// ============================================
// MINI GAME #5: Jump King
// ============================================

class JumpKingGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'JUMP!';

       
}}

// ============================================
// INITIALIZE GAME
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    new GameManager();
})
