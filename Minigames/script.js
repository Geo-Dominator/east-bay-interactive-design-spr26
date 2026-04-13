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
        this.nextRound();
    }

    nextRound() {
        if (this.wins >= 4) {
            this.showScreen('winScreen');
            return;
        }

        // Increase difficulty every 2 wins
        this.difficulty = Math.floor(this.wins / 2) + 1;

        // Get random minigame
        const gameType = this.minigames[Math.floor(Math.random() * this.minigames.length)];

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

       
}}

// ============================================
// MINI GAME #2: Img Match
// ============================================

class ImgMatchGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'MATCH THE IMAGES!';

       
}}

// ============================================
// MINI GAME #3: Doodle Jump
// ============================================

class DoodleJumpGame extends Minigame {
    setupGame() { document.getElementById('instructionText').textContent = 'SURVIVE!';
        
}
}

// ============================================
// MINI GAME #4: Maze
// ============================================

class MazeGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'SOLVE THE MAZE!';

       
}
}

// ============================================
// MINI GAME #5: Jump King
// ============================================

class JumpKingGame extends Minigame {
    setupGame() {
        document.getElementById('instructionText').textContent = 'JUMP!';

       
}
}

// ============================================
// INITIALIZE GAME
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    new GameManager();
})
