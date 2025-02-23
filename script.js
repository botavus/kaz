const symbols = {
    '7': { image: 'images/7.png', weight: 0.1 },
    'bar': { image: 'images/bar.png', weight: 0.2 },
    'cherry': { image: 'images/cherry.png', weight: 0.4 },
    'lemon': { image: 'images/lemon.png', weight: 0.3 }
};

let credits = 1000;
let currentBet = 10;
let isSpinning = false;
let autoSpin = false;
let autoSpinInterval;
let level = 1;
let xp = 0;
let maxXp = 100;

// Sound Elements
const sounds = {
    spin: document.getElementById('spinSound'),
    win: document.getElementById('winSound'),
    levelUp: document.getElementById('levelUpSound')
};

// Level Bonuses
const levelBonuses = {
    5: { credits: 500, multiplier: 2 },
    10: { credits: 2000, multiplier: 3 }
};

function updateDisplay() {
    document.getElementById('credits').textContent = credits;
    document.getElementById('currentBet').textContent = currentBet;
}

function changeBet(amount) {
    const newBet = currentBet + amount;
    if (newBet >= 10 && newBet <= 100) {
        currentBet = newBet;
        updateDisplay();
    }
}

function getRandomSymbol() {
    const total = Object.values(symbols).reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * total;
    
    for (const [key, symbol] of Object.entries(symbols)) {
        if (random < symbol.weight) return key;
        random -= symbol.weight;
    }
}

function createCoinAnimation(x, y) {
    const coin = document.createElement('div');
    coin.className = 'coin-animation';
    coin.textContent = '💰';
    coin.style.left = `${x}px`;
    coin.style.top = `${y}px`;
    document.body.appendChild(coin);
    setTimeout(() => coin.remove(), 1000);
}

function addXp(amount) {
    xp += amount;
    if(xp >= maxXp) {
        level++;
        xp -= maxXp;
        maxXp = Math.floor(maxXp * 1.5);
        playSound(sounds.levelUp);
        applyLevelBonus();
        document.querySelector('.level-box').classList.add('win-animation');
        setTimeout(() => {
            document.querySelector('.level-box').classList.remove('win-animation');
        }, 1500);
    }
    updateXpDisplay();
}

function applyLevelBonus() {
    if(levelBonuses[level]) {
        credits += levelBonuses[level].credits;
        const bonus = levelBonuses[level];
        alert(`LEVEL ${level} BONUS! +${bonus.credits} CREDITS${bonus.multiplier ? ` & ${bonus.multiplier}x MULTIPLIER!` : ''}`);
    }
}

function updateXpDisplay() {
    document.getElementById('level').textContent = level;
    document.querySelector('.progress-fill').style.width = `${(xp / maxXp) * 100}%`;
}

function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

async function spin() {
    if ((!autoSpin && isSpinning) || credits < currentBet) return;
    
    isSpinning = true;
    credits -= currentBet;
    updateDisplay();
    playSound(sounds.spin);
    
    const reels = document.querySelectorAll('.reel');
    const results = [];
    
    for (const reel of reels) {
        const symbol = getRandomSymbol();
        const img = reel.querySelector('.symbol');
        
        // Анимация вращения
        img.style.transform = 'translateY(-100%)';
        await new Promise(resolve => setTimeout(resolve, 300));
        img.src = symbols[symbol].image;
        img.style.transform = 'translateY(0)';
        
        results.push(symbol);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const winAmount = calculateWin(results);
    if(winAmount > 0) handleWin(winAmount);
    
    addXp(currentBet);
    isSpinning = false;
    
    if(autoSpin && credits >= currentBet) {
        setTimeout(spin, 1000);
    }
}

function calculateWin(results) {
    const combination = results.join(' ').toLowerCase();
    
    // Проверка трёх одинаковых символов
    if (results[0] === results[1] && results[1] === results[2]) {
        switch(results[0]) {
            case '7': return currentBet * 500;
            case 'bar': return currentBet * 100;
            case 'cherry': return currentBet * 50;
            case 'lemon': return currentBet * 20;
        }
    }
    
    // Проверка одиночных символов
    if (results.includes('7')) return currentBet * 2;
    if (results.includes('bar')) return currentBet * 1.5;
    
    return 0;
}
const paytableRules = {
    '777': { multiplier: 500, description: 'Three Sevens' },
    'bar bar bar': { multiplier: 100, description: 'Three Bars' },
    'cherry cherry cherry': { multiplier: 50, description: 'Three Cherries' },
    'lemon lemon lemon': { multiplier: 20, description: 'Three Lemons' },
    'any 7': { multiplier: 2, description: 'Any Single Seven' },
    'any bar': { multiplier: 1.5, description: 'Any Single Bar' }
};
function handleWin(winAmount) {
    credits += winAmount;
    playSound(sounds.win);
    
    // Анимация выплат
    const firstReel = document.querySelector('.reel').getBoundingClientRect();
    for(let i = 0; i < 10; i++) {
        setTimeout(() => {
            createCoinAnimation(
                firstReel.left + 75,
                firstReel.top + 75
            );
        }, i * 100);
    }
    
    document.querySelector('.slot-machine').classList.add('win-animation');
    setTimeout(() => {
        document.querySelector('.slot-machine').classList.remove('win-animation');
    }, 1500);
    
    updateDisplay();
}

function toggleAutoSpin() {
    autoSpin = !autoSpin;
    const btn = document.getElementById('autoSpinBtn');
    btn.textContent = `AUTO: ${autoSpin ? 'ON' : 'OFF'}`;
    btn.style.background = autoSpin ? '#4CAF50' : '#ffd700';
    if(autoSpin) spin();
}

// Инициализация
document.querySelectorAll('.symbol').forEach(img => {
    img.style.transition = 'transform 0.5s ease-in-out';
});
updateDisplay();
updateXpDisplay();
