const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('scoreVal');
const livesEl = document.getElementById('livesContainer');

let GAME_MODE = 'classic';
let CONTROL_MODE = 'swipe';
let DIFFICULTY = 'medium';

const speeds = {
    slow: { pacman: 0.06, ghosts: 0.05 },
    medium: { pacman: 0.1, ghosts: 0.08 },
    fast: { pacman: 0.14, ghosts: 0.12 }
};

let score = 0;
let lives = 3;
let level = 1;
let gameOver = false;
let gamePaused = true;
let reqAnimationId;

const levelEl = document.getElementById('levelVal');

const TILE_SIZE = 20;
const MAP_COLS = 19;
const MAP_ROWS = 21;

// 0: Dot, 1: Wall, 2: Empty, 3: Power Pellet
const initialMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,3,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let map = [];
let dotsLeft = 0;

let pacman = { x: 9, y: 15, dirX: 0, dirY: 0, nextDirX: 0, nextDirY: 0, speed: 0.1, px: 9, py: 15, open: 0 };
let ghosts = [];

const dirs = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

function resizeCanvas() {
    canvas.width = MAP_COLS * TILE_SIZE;
    canvas.height = MAP_ROWS * TILE_SIZE;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function generateMap() {
    let newMap = [];
    for(let r=0; r<MAP_ROWS; r++) {
        let row = [];
        for(let c=0; c<MAP_COLS; c++) { row.push(0); }
        newMap.push(row);
    }
    
    // Zidovi po rubovima
    for(let r=0; r<MAP_ROWS; r++) {
        newMap[r][0] = 1; newMap[r][MAP_COLS-1] = 1;
    }
    for(let c=0; c<MAP_COLS; c++) {
        newMap[0][c] = 1; newMap[MAP_ROWS-1][c] = 1;
    }
    
    // Tunel
    newMap[9][0] = 2; newMap[9][MAP_COLS-1] = 2;
    
    // Ghost house (centar)
    for(let r=8; r<=11; r++) {
        for(let c=7; c<=11; c++) {
            if(r===8 || r===11 || c===7 || c===11) {
                if(r===8 && c===9) newMap[r][c] = 2; // izlaz
                else newMap[r][c] = 1;
            } else {
                newMap[r][c] = 2;
            }
        }
    }
    newMap[15][9] = 2; // Pacman spawn
    
    // Generiranje nasumičnih zidova (samo parni indeksi za izbjegavanje slijepih ulica)
    for(let r=2; r<=18; r+=2) {
        for(let c=2; c<=8; c+=2) {
            // Preskoči središnji dio oko kućice
            if (r >= 6 && r <= 13 && c >= 5) continue;
            if (r >= 14 && r <= 16 && c >= 7) continue;
            
            if (Math.random() < 0.7) {
                newMap[r][c] = 1;
                let dir = Math.random();
                if (dir < 0.4 && c+1 <= 8) newMap[r][c+1] = 1; // Produži desno
                else if (dir < 0.8 && r+1 <= 18) newMap[r+1][c] = 1; // Produži dolje
            }
        }
    }
    
    // Zrcaljenje na desnu stranu
    for(let r=0; r<MAP_ROWS; r++) {
        for(let c=0; c<=8; c++) {
            newMap[r][MAP_COLS - 1 - c] = newMap[r][c];
        }
    }
    
    // Power Pellets
    let ppLocs = [[2,2], [2,16], [18,2], [18,16]];
    ppLocs.forEach(loc => {
        newMap[loc[0]][loc[1]] = 3;
        // Oslobodi jedan blok ispod da power pellet nikad nije blokiran
        if(newMap[loc[0]+1][loc[1]] === 1) newMap[loc[0]+1][loc[1]] = 0;
    });

    return newMap;
}

function resetGame(keepScore = false) {
    if (keepScore) {
        map = generateMap();
    } else {
        level = 1;
        levelEl.innerText = level;
        // Vraćanje brzina na zadane
        speeds.slow = { pacman: 0.06, ghosts: 0.05 };
        speeds.medium = { pacman: 0.1, ghosts: 0.08 };
        speeds.fast = { pacman: 0.14, ghosts: 0.12 };
        
        map = JSON.parse(JSON.stringify(initialMap));
        score = 0;
        lives = 3;
    }
    
    dotsLeft = 0;
    for(let r=0; r<MAP_ROWS; r++) {
        for(let c=0; c<MAP_COLS; c++) {
            if(map[r][c] === 0 || map[r][c] === 3) dotsLeft++;
        }
    }
    
    scoreEl.innerText = score;
    updateLivesUI();
    
    resetPositions();
}

function resetPositions() {
    let s = speeds[DIFFICULTY];
    
    pacman.x = 9; pacman.y = 15;
    pacman.px = 9; pacman.py = 15;
    pacman.dirX = 0; pacman.dirY = 0;
    pacman.nextDirX = 0; pacman.nextDirY = 0;
    pacman.speed = s.pacman;
    pacman.lastNodeX = 9; pacman.lastNodeY = 15;
    
    ghosts = [
        { x: 9, y: 7, px: 9, py: 7, dirX: 1, dirY: 0, color: '#ef4444', speed: s.ghosts, scared: 0, lastNodeX: 9, lastNodeY: 7 },
        { x: 8, y: 9, px: 8, py: 9, dirX: -1, dirY: 0, color: '#ec4899', speed: s.ghosts, scared: 0, lastNodeX: 8, lastNodeY: 9 },
        { x: 9, y: 9, px: 9, py: 9, dirX: 0, dirY: -1, color: '#06b6d4', speed: s.ghosts, scared: 0, lastNodeX: 9, lastNodeY: 9 },
        { x: 10, y: 9, px: 10, py: 9, dirX: 1, dirY: 0, color: '#f59e0b', speed: s.ghosts, scared: 0, lastNodeX: 10, lastNodeY: 9 }
    ];
}

function updateLivesUI() {
    let str = '';
    for(let i=0; i<lives; i++) str += '💛';
    livesEl.innerHTML = str;
}

// UI POSTAVKE
document.querySelectorAll('#mode-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#mode-selector button').forEach(b => b.classList.remove('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400'));
        document.querySelectorAll('#mode-selector button').forEach(b => b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300'));
        e.target.classList.add('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400');
        e.target.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');
        GAME_MODE = e.target.dataset.val;
    });
});

document.querySelectorAll('#difficulty-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#difficulty-selector button').forEach(b => b.classList.remove('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400'));
        document.querySelectorAll('#difficulty-selector button').forEach(b => b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300'));
        e.target.classList.add('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400');
        e.target.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');
        DIFFICULTY = e.target.dataset.val;
    });
});

document.querySelectorAll('#control-selector button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('#control-selector button').forEach(b => b.classList.remove('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400'));
        document.querySelectorAll('#control-selector button').forEach(b => b.classList.add('bg-white/5', 'border-white/10', 'text-slate-300'));
        e.target.classList.add('active', 'bg-yellow-500/20', 'border-yellow-500/50', 'text-yellow-400');
        e.target.classList.remove('bg-white/5', 'border-white/10', 'text-slate-300');
        CONTROL_MODE = e.target.dataset.val;
        
        if (CONTROL_MODE === 'dpad') {
            document.getElementById('dpad').classList.remove('hidden');
        } else {
            document.getElementById('dpad').classList.add('hidden');
        }
    });
});

function showSettings() {
    gamePaused = true;
    document.getElementById('settings-modal').classList.remove('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');
}

function hideSettings() {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('settings-modal').classList.remove('flex');
    gamePaused = false;
    
    if (CONTROL_MODE === 'dpad') {
        document.getElementById('dpad').classList.remove('hidden');
    } else {
        document.getElementById('dpad').classList.add('hidden');
    }
}

function startGame() {
    document.getElementById('settings-modal').classList.add('hidden');
    document.getElementById('gameover-modal').classList.add('hidden');
    
    if (gameOver || lives <= 0 || dotsLeft === 0) {
        resetGame();
    }
    
    if (CONTROL_MODE === 'dpad') {
        document.getElementById('dpad').classList.remove('hidden');
    } else {
        document.getElementById('dpad').classList.add('hidden');
    }
    
    // Ulazak u Fullscreen mode (skriva Android navigacijsku traku)
    try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.log(e));
        }
    } catch (e) {}
    
    gameOver = false;
    gamePaused = false;
    if (reqAnimationId) cancelAnimationFrame(reqAnimationId);
    loop();
}

// KONTROLE
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'w') { pacman.nextDirX = 0; pacman.nextDirY = -1; }
    if (e.key === 'ArrowDown' || e.key === 's') { pacman.nextDirX = 0; pacman.nextDirY = 1; }
    if (e.key === 'ArrowLeft' || e.key === 'a') { pacman.nextDirX = -1; pacman.nextDirY = 0; }
    if (e.key === 'ArrowRight' || e.key === 'd') { pacman.nextDirX = 1; pacman.nextDirY = 0; }
});

// D-Pad
document.querySelectorAll('.dpad-btn').forEach(btn => {
    const attachPress = (e) => {
        e.preventDefault();
        const dir = dirs[btn.dataset.dir];
        pacman.nextDirX = dir.x;
        pacman.nextDirY = dir.y;
    };
    btn.addEventListener('mousedown', attachPress);
    btn.addEventListener('touchstart', attachPress, {passive: false});
});

// Swipe
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    if(CONTROL_MODE !== 'swipe') return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

canvas.addEventListener('touchend', e => {
    if(CONTROL_MODE !== 'swipe') return;
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}, {passive: true});

function handleSwipe(startX, startY, endX, endY) {
    let dx = endX - startX;
    let dy = endY - startY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) { pacman.nextDirX = 1; pacman.nextDirY = 0; }
        else if (dx < -30) { pacman.nextDirX = -1; pacman.nextDirY = 0; }
    } else {
        if (dy > 30) { pacman.nextDirX = 0; pacman.nextDirY = 1; }
        else if (dy < -30) { pacman.nextDirX = 0; pacman.nextDirY = -1; }
    }
}

// LOGIKA
function canMove(x, y, dx, dy) {
    let nx = Math.round(x + dx);
    let ny = Math.round(y + dy);
    // Tunel
    if(nx < 0 || nx >= MAP_COLS) return true;
    
    if (ny >= 0 && ny < MAP_ROWS && nx >= 0 && nx < MAP_COLS) {
        return map[ny][nx] !== 1; // 1 je zid
    }
    return false;
}

function updatePacman() {
    // 1. Instant polukružno okretanje (U-Turn)
    if (pacman.nextDirX === -pacman.dirX && pacman.nextDirX !== 0) {
        pacman.dirX = pacman.nextDirX; pacman.dirY = 0;
    }
    if (pacman.nextDirY === -pacman.dirY && pacman.nextDirY !== 0) {
        pacman.dirX = 0; pacman.dirY = pacman.nextDirY;
    }

    let cx = Math.round(pacman.px);
    let cy = Math.round(pacman.py);

    // 2. Skretanje točno u centru pločice
    if (Math.abs(pacman.px - cx) <= pacman.speed/2 && Math.abs(pacman.py - cy) <= pacman.speed/2) {
        if (pacman.nextDirX !== 0 || pacman.nextDirY !== 0) {
            if (canMove(cx, cy, pacman.nextDirX, pacman.nextDirY)) {
                pacman.px = cx;
                pacman.py = cy;
                pacman.dirX = pacman.nextDirX;
                pacman.dirY = pacman.nextDirY;
            }
        }
        
        // Zaustavi se ako udaraš u zid
        if (!canMove(cx, cy, pacman.dirX, pacman.dirY)) {
            pacman.px = cx;
            pacman.py = cy;
            pacman.dirX = 0;
            pacman.dirY = 0;
        }
    }
    
    pacman.px += pacman.dirX * pacman.speed;
    pacman.py += pacman.dirY * pacman.speed;
    
    // Tunel na rubovima ekrana
    if (pacman.px < -0.5) pacman.px = MAP_COLS - 0.5;
    if (pacman.px > MAP_COLS - 0.5) pacman.px = -0.5;
    
    cx = Math.round(pacman.px);
    cy = Math.round(pacman.py);
    
    if (cx >= 0 && cx < MAP_COLS && cy >= 0 && cy < MAP_ROWS) {
        if (map[cy][cx] === 0) {
            map[cy][cx] = 2;
            score += 10;
            dotsLeft--;
        } else if (map[cy][cx] === 3) {
            map[cy][cx] = 2;
            score += 50;
            dotsLeft--;
            ghosts.forEach(g => g.scared = 300); // 300 frameova ranjivosti
        }
        scoreEl.innerText = score;
    }
    
    if (dotsLeft === 0) {
        levelUp();
    }
}

function updateGhosts() {
    ghosts.forEach(g => {
        if (g.scared > 0) g.scared--;
        
        let cx = Math.round(g.px);
        let cy = Math.round(g.py);
        
        if (Math.abs(g.px - cx) <= g.speed/2 && Math.abs(g.py - cy) <= g.speed/2) {
            if (g.lastNodeX !== cx || g.lastNodeY !== cy) {
                g.lastNodeX = cx;
                g.lastNodeY = cy;
                g.px = cx;
                g.py = cy;
                
                let possible = [];
                let options = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
                options.forEach(d => {
                    // Duhovi se ne smiju vraćati unazad
                    if(d.x === -g.dirX && d.y === -g.dirY) return;
                    if(canMove(cx, cy, d.x, d.y)) {
                        possible.push(d);
                    }
                });
                
                // Ako je slijepa ulica, vrati se
                if (possible.length === 0) {
                    possible.push({x: -g.dirX, y: -g.dirY});
                }
                
                // Jednostavan nasumični odabir za sada
                let chosen = possible[Math.floor(Math.random() * possible.length)];
                g.dirX = chosen.x;
                g.dirY = chosen.y;
            }
        }
        
        let currentSpeed = g.scared > 0 ? g.speed * 0.6 : g.speed;
        g.px += g.dirX * currentSpeed;
        g.py += g.dirY * currentSpeed;
        
        // Tunel
        if (g.px < -0.5) g.px = MAP_COLS - 0.5;
        if (g.px > MAP_COLS - 0.5) g.px = -0.5;
        
        // Sudar s pacmanom
        let dist = Math.hypot(pacman.px - g.px, pacman.py - g.py);
        if (dist < 0.8) {
            if (g.scared > 0) {
                // Pacman pojede duha
                score += 200;
                scoreEl.innerText = score;
                g.px = 9; g.py = 9; // Reset pozicije
                g.lastNodeX = 9; g.lastNodeY = 9;
                g.dirX = 0; g.dirY = -1; // Izlazak iz kućice
                g.scared = 0;
            } else {
                // Pacman umre
                die();
            }
        }
    });
}

function die() {
    gamePaused = true;
    lives--;
    updateLivesUI();
    
    if (lives > 0) {
        if (GAME_MODE === 'edu') {
            triggerEduQuestion();
        } else {
            // Klasični mod, samo resetiraj pozicije
            setTimeout(() => {
                resetPositions();
                gamePaused = false;
            }, 1000);
        }
    } else {
        endGame(false);
    }
}

function levelUp() {
    gamePaused = true;
    level++;
    levelEl.innerText = level;
    
    const modal = document.getElementById('levelup-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        
        // Povećaj težinu blago svakim nivoom
        let s = speeds[DIFFICULTY];
        s.pacman = Math.min(0.22, s.pacman + 0.01);
        s.ghosts = Math.min(0.20, s.ghosts + 0.015); // Duhovi rastu mrvicu brže
        
        resetGame(true);
        gamePaused = false;
    }, 2500);
}

function endGame(win) {
    gameOver = true;
    document.getElementById('gameover-modal').classList.remove('hidden');
    document.getElementById('gameover-modal').classList.add('flex');
    document.getElementById('end-title').innerText = win ? 'Pobjeda!' : 'Game Over';
    document.getElementById('end-title').className = win ? 'text-2xl font-black text-green-400 mb-2' : 'text-2xl font-black text-red-400 mb-2';
    document.getElementById('finalScore').innerText = score;
}

// EDUKATIVNI MOD - Dummy podaci
const questions = [
    { q: "Koliko je 5 + 7?", a: ["11", "12", "13", "14"], correct: 1 },
    { q: "Glavni grad Hrvatske?", a: ["Split", "Osijek", "Zagreb", "Zadar"], correct: 2 },
    { q: "Koliko je 3 x 8?", a: ["24", "21", "27", "18"], correct: 0 }
];

function triggerEduQuestion() {
    const modal = document.getElementById('edu-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    let q = questions[Math.floor(Math.random() * questions.length)];
    document.getElementById('edu-question').innerText = q.q;
    
    let answersHtml = '';
    q.a.forEach((ans, idx) => {
        answersHtml += `<button onclick="answerEdu(${idx === q.correct})" class="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all">${ans}</button>`;
    });
    document.getElementById('edu-answers').innerHTML = answersHtml;
}

window.answerEdu = function(correct) {
    const modal = document.getElementById('edu-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    if (correct) {
        // Spasio se, vrati pozicije
        resetPositions();
        gamePaused = false;
    } else {
        // Krivo, gubi taj život i ide dalje
        resetPositions();
        gamePaused = false;
        
        // Ako je pao na 0 života tijekom ovog procesa, kraj (već je smanjen)
        if (lives === 0) endGame(false);
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw map
    for (let r=0; r<MAP_ROWS; r++) {
        for (let c=0; c<MAP_COLS; c++) {
            if (map[r][c] === 1) {
                ctx.fillStyle = 'rgba(6, 182, 212, 0.4)'; // Neon cyan zidovi
                ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#06b6d4';
                ctx.strokeRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (map[r][c] === 0) {
                ctx.fillStyle = '#fef08a';
                ctx.beginPath();
                ctx.arc(c*TILE_SIZE + TILE_SIZE/2, r*TILE_SIZE + TILE_SIZE/2, 3, 0, Math.PI*2);
                ctx.fill();
            } else if (map[r][c] === 3) {
                ctx.fillStyle = '#facc15';
                ctx.beginPath();
                // Blinking effect
                if (Date.now() % 500 > 250) {
                    ctx.arc(c*TILE_SIZE + TILE_SIZE/2, r*TILE_SIZE + TILE_SIZE/2, 7, 0, Math.PI*2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Draw Pac-Man
    ctx.save();
    ctx.translate(pacman.px * TILE_SIZE + TILE_SIZE/2, pacman.py * TILE_SIZE + TILE_SIZE/2);
    
    let angle = 0;
    if (pacman.dirX === 1) angle = 0;
    if (pacman.dirX === -1) angle = Math.PI;
    if (pacman.dirY === 1) angle = Math.PI / 2;
    if (pacman.dirY === -1) angle = -Math.PI / 2;
    ctx.rotate(angle);
    
    // Animirana usta
    pacman.open += 0.15;
    let mouth = (Math.sin(pacman.open) + 1) / 2 * 0.25 * Math.PI; // 0 to 0.25 PI
    if (pacman.dirX === 0 && pacman.dirY === 0) mouth = 0.2 * Math.PI;
    
    ctx.fillStyle = '#eab308'; // yellow-500
    ctx.beginPath();
    ctx.arc(0, 0, TILE_SIZE/2 * 0.8, mouth, Math.PI * 2 - mouth);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();
    
    // Draw Ghosts
    ghosts.forEach(g => {
        ctx.save();
        ctx.translate(g.px * TILE_SIZE + TILE_SIZE/2, g.py * TILE_SIZE + TILE_SIZE/2);
        
        ctx.fillStyle = g.scared > 0 ? '#1d4ed8' : g.color;
        
        // Tijelo duha
        ctx.beginPath();
        let ghW = TILE_SIZE * 0.8;
        ctx.arc(0, -ghW/4, ghW/2, Math.PI, 0);
        ctx.lineTo(ghW/2, ghW/2);
        
        // Nogice (valoviti uzorak)
        ctx.lineTo(ghW/4, ghW/4);
        ctx.lineTo(0, ghW/2);
        ctx.lineTo(-ghW/4, ghW/4);
        ctx.lineTo(-ghW/2, ghW/2);
        ctx.closePath();
        ctx.fill();
        
        // Oči
        if (g.scared === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath(); ctx.arc(-ghW/4, -ghW/4, ghW/6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghW/4, -ghW/4, ghW/6, 0, Math.PI*2); ctx.fill();
            
            // Zjenice prate smjer
            ctx.fillStyle = 'blue';
            let ex = g.dirX * 2, ey = g.dirY * 2;
            ctx.beginPath(); ctx.arc(-ghW/4 + ex, -ghW/4 + ey, ghW/12, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghW/4 + ex, -ghW/4 + ey, ghW/12, 0, Math.PI*2); ctx.fill();
        } else {
            // Uplašen lice
            ctx.fillStyle = (g.scared < 60 && Date.now()%400 > 200) ? 'white' : '#fba919';
            ctx.beginPath(); ctx.arc(-ghW/4, -ghW/4, ghW/8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(ghW/4, -ghW/4, ghW/8, 0, Math.PI*2); ctx.fill();
            // Usta
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-ghW/3, ghW/8);
            ctx.lineTo(-ghW/6, 0);
            ctx.lineTo(0, ghW/8);
            ctx.lineTo(ghW/6, 0);
            ctx.lineTo(ghW/3, ghW/8);
            ctx.stroke();
        }
        
        ctx.restore();
    });
}

let lastTime = 0;
const FPS = 60;
const frameDelay = 1000 / FPS;

function loop(timestamp) {
    reqAnimationId = requestAnimationFrame(loop);
    
    if (!lastTime) lastTime = timestamp;
    let dt = timestamp - lastTime;
    
    // Ograničavanje na maksimalno 60 FPS
    if (dt >= frameDelay) {
        lastTime = timestamp - (dt % frameDelay);
        
        if (!gamePaused) {
            updatePacman();
            updateGhosts();
        }
        draw();
    }
}

// Inicijalizacija pri učitavanju
showSettings();
resetGame();
draw();
