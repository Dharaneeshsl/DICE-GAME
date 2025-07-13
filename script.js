// Game state
let gameState = {
    player1Score: 0,
    player2Score: 0,
    totalRolls: 0,
    totalTies: 0,
    isRolling: false
};

// DOM elements
const elements = {
    dice1: document.getElementById('dice1'),
    dice2: document.getElementById('dice2'),
    value1: document.getElementById('value1'),
    value2: document.getElementById('value2'),
    result: document.getElementById('result'),
    winner: document.getElementById('winner'),
    score1: document.getElementById('score1'),
    score2: document.getElementById('score2'),
    totalRolls: document.getElementById('totalRolls'),
    totalTies: document.getElementById('totalTies'),
    rollBtn: document.getElementById('rollBtn'),
    resetBtn: document.getElementById('resetBtn'),
    confetti: document.getElementById('confetti')
};

// Dice images mapping
const diceImages = {
    1: 'images/dice1.png',
    2: 'images/dice2.png',
    3: 'images/dice3.png',
    4: 'images/dice4.png',
    5: 'images/dice5.png',
    6: 'images/dice6.png'
};

// Sound effects (using Web Audio API)
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }

    playDiceRoll() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playWinSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Play a victory melody
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C
        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.1);
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + index * 0.1 + 0.1);
            
            osc.start(this.audioContext.currentTime + index * 0.1);
            osc.stop(this.audioContext.currentTime + index * 0.1 + 0.1);
        });
    }
}

const soundManager = new SoundManager();

// Utility functions
function getRandomDiceValue() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateDiceImage(diceElement, value) {
    const img = diceElement.querySelector('.dice-img');
    img.src = diceImages[value];
}

function addRollingAnimation(diceElement) {
    diceElement.classList.add('rolling');
    setTimeout(() => {
        diceElement.classList.remove('rolling');
    }, 600);
}

function createConfetti() {
    const colors = ['#ffd700', '#ff6b6b', '#74b9ff', '#a29bfe', '#fd79a8'];
    const confettiContainer = elements.confetti;
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        confettiContainer.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

function updateUI() {
    elements.score1.textContent = gameState.player1Score;
    elements.score2.textContent = gameState.player2Score;
    elements.totalRolls.textContent = gameState.totalRolls;
    elements.totalTies.textContent = gameState.totalTies;
}

function showResult(result, winner = '') {
    elements.result.textContent = result;
    elements.winner.textContent = winner;
    
    if (winner) {
        elements.winner.style.display = 'block';
        createConfetti();
        soundManager.playWinSound();
    } else {
        elements.winner.style.display = 'none';
    }
}

// Main game function
async function rollDice() {
    if (gameState.isRolling) return;
    
    gameState.isRolling = true;
    elements.rollBtn.disabled = true;
    
    // Play roll sound
    soundManager.playDiceRoll();
    
    // Add rolling animations
    addRollingAnimation(elements.dice1);
    addRollingAnimation(elements.dice2);
    
    // Simulate rolling delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Generate random values
    const value1 = getRandomDiceValue();
    const value2 = getRandomDiceValue();
    
    // Update dice images and values
    updateDiceImage(elements.dice1, value1);
    updateDiceImage(elements.dice2, value2);
    elements.value1.textContent = value1;
    elements.value2.textContent = value2;
    
    // Update game state
    gameState.totalRolls++;
    
    // Determine winner
    let result, winner;
    if (value1 === value2) {
        result = "It's a Tie! 🤝";
        winner = "Both players rolled the same!";
        gameState.totalTies++;
    } else if (value1 > value2) {
        result = "Player 1 Wins! 🎉";
        winner = `Player 1 rolled ${value1} vs Player 2's ${value2}`;
        gameState.player1Score++;
    } else {
        result = "Player 2 Wins! 🎉";
        winner = `Player 2 rolled ${value2} vs Player 1's ${value1}`;
        gameState.player2Score++;
    }
    
    // Show result
    showResult(result, winner);
    
    // Update UI
    updateUI();
    
    // Re-enable roll button
    gameState.isRolling = false;
    elements.rollBtn.disabled = false;
}

function resetGame() {
    gameState = {
        player1Score: 0,
        player2Score: 0,
        totalRolls: 0,
        totalTies: 0,
        isRolling: false
    };
    
    // Reset dice to initial state
    updateDiceImage(elements.dice1, 1);
    updateDiceImage(elements.dice2, 1);
    elements.value1.textContent = '1';
    elements.value2.textContent = '1';
    
    // Reset result
    showResult('Click Roll to Start!', '');
    
    // Update UI
    updateUI();
    
    // Re-enable roll button
    elements.rollBtn.disabled = false;
}

// Keyboard shortcuts
function handleKeyPress(event) {
    if (event.code === 'Space' && !gameState.isRolling) {
        event.preventDefault();
        rollDice();
    } else if (event.code === 'KeyR') {
        event.preventDefault();
        resetGame();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game
    resetGame();
    
    // Add event listeners
    elements.rollBtn.addEventListener('click', rollDice);
    elements.resetBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Add hover effects for dice
    elements.dice1.addEventListener('mouseenter', () => {
        if (!gameState.isRolling) {
            elements.dice1.style.transform = 'scale(1.05)';
        }
    });
    
    elements.dice1.addEventListener('mouseleave', () => {
        elements.dice1.style.transform = 'scale(1)';
    });
    
    elements.dice2.addEventListener('mouseenter', () => {
        if (!gameState.isRolling) {
            elements.dice2.style.transform = 'scale(1.05)';
        }
    });
    
    elements.dice2.addEventListener('mouseleave', () => {
        elements.dice2.style.transform = 'scale(1)';
    });
    
    // Add click to roll functionality for dice
    elements.dice1.addEventListener('click', () => {
        if (!gameState.isRolling) {
            rollDice();
        }
    });
    
    elements.dice2.addEventListener('click', () => {
        if (!gameState.isRolling) {
            rollDice();
        }
    });
    
    // Add tooltips
    elements.rollBtn.title = 'Press SPACE to roll';
    elements.resetBtn.title = 'Press R to reset';
    
    console.log('🎲 Dice Battle Game loaded successfully!');
    console.log('Controls:');
    console.log('- Click "Roll Dice" button or press SPACE to roll');
    console.log('- Click "Reset Game" button or press R to reset');
    console.log('- Click on dice to roll');
});