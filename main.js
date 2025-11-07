  const startScreen = document.getElementById('startScreen');
  const mapSelect = document.getElementById('mapSelect');
  const gameScreen = document.getElementById('gameScreen');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const sideTitle = document.getElementById('sideTitle');
  const sideContent = document.getElementById('sideContent');
  const nextWaveBtn = document.getElementById('nextWaveBtn');
  const speedToggleBtn = document.getElementById('speedToggleBtn');
  const moneyDisplay = document.getElementById('moneyDisplay');
  const waveDisplay = document.getElementById('waveDisplay');
  const deckBuilderScreen = document.getElementById('deckBuilder');
  const cardsPool = document.getElementById('cardsPool');
  const deckSlots = document.getElementById('deckSlots');
  const deckCountEl = document.getElementById('deckCount');
  const deckStartBtn = document.getElementById('deckStartBtn');
  const deckClearBtn = document.getElementById('deckClearBtn');
  const autoWaveBtn = document.getElementById('autoWaveBtn');

  let activeMap = null;
  let towers = [];
  let buildMode = false;
  let buildTowerType = null;
  let buildPreviewPos = {x:0, y:0};
  let gameSpeed = 1;
  let gameSpeedStates = [1,2,4];
  let gameSpeedIndex = 0;
  let waveNumber = 0;
  let money = 100;
  let activeWaves = [];
  let enemies = [];
  let waveReadyCountdown = 0;
  let waveReadyTimeRemaining = 0;
  let waveReadyTimer = null;
  let gameTick = 0;
  let particles = [];
  let globalTime = 0;
  let upgradingTower = null;
  let missiles = []; 
  let inUpgradeMenu = false;
  let integrity = 100;
  let supportMode = null;
  let supportPending = false;
  let supportPreviewPos = { x: 0, y: 0 };
  let bigMarkerPos = null; 
  let bigMarkerTimer = 0;    
  let screenFlash = 0;   
  let planeRuns = []; 
  let orbitalImpacts = []; 
  let beams = [];
  let globalEMP = { active: false, expires: 0 }; 
  let DECK = []; 
  const DECK_MAX = 8;
  let isDraggingCard = false;
  let scheduledEvents = [];
  let airBullets = [];
  let autoWave = false;
  let prevWaveReady = 0;

if (!document.getElementById('towerPopup')) {
  const pop = document.createElement('div');
  pop.id = "towerPopup";
  pop.style.position = "absolute";
  pop.style.display = "none";
  pop.style.zIndex = 100;
  pop.style.minWidth = "220px";
  pop.style.maxWidth = "380px";
  pop.style.background = "rgba(20,32,20,0.98)";
  pop.style.border = "2px solid #6cfc91";
  pop.style.borderRadius = "10px";
  pop.style.boxShadow = "0 0 16px #32fa5077";
  pop.style.padding = "14px 12px";
  pop.style.color = "#fff";
  pop.style.pointerEvents = "none";
  pop.style.fontSize = "14px";
  document.body.appendChild(pop);
}
    document.getElementById('playBtn').addEventListener('click', ()=>{
      startScreen.classList.remove('active');
      renderDeckBuilder();
    });

  document.querySelectorAll('.mapBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      activeMap = btn.dataset.map;
      mapSelect.classList.remove('active');
      gameScreen.classList.add('active');
      drawMap(activeMap);
      renderTowerMenu();
      updateUI();
      tryStartLoop();
    });
  });


    const MAPS = {
    desert: [ {x:40,y:100}, {x:340,y:100}, {x:340,y:400}, {x:860,y:400} ],
    forest: [ {x:40,y:300}, {x:240,y:300}, {x:240,y:150}, {x:440,y:150}, {x:440,y:500}, {x:640,y:500}, {x:790,y:500} ,{x:790,y:200}, {x:860,y:200} ],
    city:   [ {x:40,y:200}, {x:440,y:200}, {x:440,y:350}, {x:640,y:350}, {x:640,y:100}, {x:860,y:100} ]
  };


    const TOWER_TYPES = [
      {
        name: "Machine Gun",
        color: "#3af",
        radius: 26,
        desc: "Fast firing, low damage.",
        damage: 4,
        range: 100,
        fireRate: 0.18,
        shotPower: 1,      
        fireType: "bullet",
        cost: 40,
        upgrade: {damage: 2, range: 2, fireRate: -0.01},
        upgradeCost: 35,
        targets: "both"
      },
      {
        name: "Cannon",
        color: "#fa3",
        radius: 30,
        desc: "Slow, high damage.",
        damage: 15,
        range: 150,
        fireRate: 0.9,
        shotPower: 2,
        fireType: "bullet",
        cost: 80,
        upgrade: {damage: 6, range: 5, fireRate: -0.07},
        upgradeCost: 40,
        targets: "ground"
      },
      {
        name: "Sniper",
        color: "#af3",
        radius: 22,
        desc: "Long range, precise.",
        damage: 20,
        range: 400,
        fireRate: 2.1,
        shotPower: 1.2,
        fireType: "bullet",
        cost: 100,
        upgrade: {damage: 8, range: 10, fireRate: -0.13},
        upgradeCost: 50,
        targets: "both"
      },
      {
        name: "Flame Tower",
        color: "#f35",
        radius: 24,
        desc: "Blasts ground enemies in a cone of fire.",
        damage: 2,
        range: 85,
        fireRate: 0.12,
        shotPower: 1.3,
        fireType: "flame",
        cost: 65,
        upgrade: {damage: 2, range: 5, fireRate: -0.012},
        upgradeCost: 40,
        targets: "ground"
      },
      {
        name: "Flak Tower",
        color: "#cff",
        radius: 28,
        desc: "Double autocannon. Pulverizes airborne enemies.",
        damage: 18,
        range: 150,
        fireRate: 0.5,
        shotPower: 2,
        fireType: "flak",
        cost: 110,
        upgrade: {damage: 5, range: 10, fireRate: -0.08},
        upgradeCost: 40,
        targets: "air"
      },
      {
        name: "SAM Missile",
        color: "#ffa",
        radius: 26,
        desc: "Launches missiles. High AOE vs air.",
        damage: 30,
        range: 280,
        fireRate: 1.8,
        shotPower: 2.6,
        fireType: "missile",
        cost: 150,
        upgrade: {damage: 12, range: 15, fireRate: -0.20},
        upgradeCost: 50,
        targets: "air",
        splashRadius: 48
      }
    ];
const MAX_LEVEL = 5;

const SUPPORTS = [
  {
    id: 'icbm',
    name: 'ICBM Strike',
    cost: 400,
    desc: 'Massive single-target ballistic missile. Extreme single-target damage. Medium AOE.',
    type: 'target',
    radius: 120,
  action: (tx, ty, support) => {
    const markerSeconds = support.markerTime ?? 1.6;
    bigMarkerPos = { x: tx, y: ty, r: support.radius };
    bigMarkerTimer = markerSeconds;
    scheduleGameEvent(Math.round(markerSeconds * 1000), () => {
      spawnICBMStrike(tx, ty, support);
    });
  }
  },
  {
    id: 'nuke',
    name: 'Nuke',
    cost: 2000,
    desc: 'Annihilates nearly everything on the map. Massive flash and mushroom cloud. Use wisely.',
    type: 'instant',
    action: () => {
      triggerNuke();
    }
  },
  {
    id: 'hcarpet',
    name: 'Horizontal Carpet Bomb',
    cost: 220,
    desc: 'Line of bombers sweep horizontally, dropping explosive charges across a wide horizontal band.',
    type: 'target',
    radius: 28,
    action: (tx, ty, support) => {
      spawnCarpetBomb(tx, ty, 'horizontal', support);
    }
  },
  {
    id: 'vcarpet',
    name: 'Vertical Carpet Bomb',
    cost: 220,
    desc: 'Vertical sweep of bombers dropping explosives down a deep lane.',
    type: 'target',
    radius: 28,
    action: (tx, ty, support) => {
      spawnCarpetBomb(tx, ty, 'vertical', support);
    }
  },
{
  id: 'airstrike',
  name: 'Airstrike',
  cost: 180,
  desc: 'Fast jets strafe a long, thin rectangle; moderate damage.',
  type: 'target',
  radius: 14, 
  action: (tx, ty, support) => {
    spawnAirstrike(tx, ty, support);
  }
},
{
  id: 'orbital',
  name: 'Orbital Strike',
  cost: 700,
  desc: 'Satellite lasers hit several random enemy locations. Very high damage.',
  type: 'instant',
  action: () => {
    spawnOrbitalStrikeMultiple(5);
  }
},
{
  id: 'empblast',
  name: 'EMP Blast',
  cost: 180,
  desc: 'Global EMP: disables enemy movement & weapons for 6s (utility).',
  type: 'instant',
  action: () => {
    spawnEMPBlastGlobal(6);
  }
},
{
  id: 'nicolldyson',
  name: 'Nicoll-Dyson Beam',
  cost: 1500,
  desc: 'Fires a sweeping continuous orbital beam that melts everything in its path.',
  type: 'target',
  action: (tx, ty, support) => {
    spawnNicollDysonBeam(tx, ty, 6); 
  }
}
];

const CARD_POOL = [];

TOWER_TYPES.forEach(t => {
  CARD_POOL.push({ id: `bastion:${t.name}`, name: t.name, type: 'bastion', ref: t });
});

if (typeof SUPPORTS !== 'undefined') {
  SUPPORTS.forEach(s => {
    CARD_POOL.push({ id: `trump:${s.id}`, name: s.name, type: 'trump card', ref: s });
  });
}

function drawMap(name){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const path = MAPS[name];
    if(!path) return;
    ctx.lineWidth = 40;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(path[0].x,path[0].y);
    for(let i=1;i<path.length;i++) ctx.lineTo(path[i].x,path[i].y);
    ctx.strokeStyle='#1a3d1a';
    ctx.stroke();
    ctx.setLineDash([20,15]);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#4caf50';
    ctx.stroke();
    ctx.setLineDash([]);
    drawCircle(path[0].x,path[0].y,'#ff0','START');
    drawCircle(path[path.length-1].x,path[path.length-1].y,'#f00','END');
    if (upgradingTower) {
  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.arc(upgradingTower.x, upgradingTower.y, upgradingTower.range, 0, 2 * Math.PI);
  ctx.fillStyle = "#aaffaa";
  ctx.fill();
  ctx.restore();
}
    drawTowers();

for (let m of missiles) {
  const e = enemies.find(e => getEnemyUID(e) === m.targetId && !e.done);
  ctx.save();
  ctx.translate(m.x, m.y);
  let missileAngle = (e) ? Math.atan2(e.y - m.y, e.x - m.x) : 0;
  ctx.rotate(missileAngle);
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#f44";
  ctx.beginPath();
  ctx.moveTo(-6,-3);
  ctx.lineTo(8,0);
  ctx.lineTo(-6,3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
    if(buildMode && buildTowerType && buildPreviewPos){
      drawTowerPreview(buildPreviewPos.x, buildPreviewPos.y, buildTowerType);
    }
    drawEnemies();
    drawParticles();
if (supportPending && supportMode && supportMode.type === 'target' && supportPreviewPos) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(supportPreviewPos.x, supportPreviewPos.y, supportMode.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd76b';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = '#ffb36b';
  ctx.stroke();
  ctx.restore();
}
    
if (supportPending && supportMode && supportMode.type === 'target' && supportPreviewPos) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(supportPreviewPos.x, supportPreviewPos.y, supportMode.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffd76b';
  ctx.fill();
  ctx.restore();
}

if (bigMarkerPos && bigMarkerTimer > 0) {
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  ctx.arc(bigMarkerPos.x, bigMarkerPos.y, bigMarkerPos.r, 0, Math.PI*2);
  ctx.fillStyle = '#ff4d4d';
  ctx.fill();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = '#ff2222';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

if (screenFlash && screenFlash > 0) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, screenFlash * 1.6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}

for (let imp of orbitalImpacts) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.18, imp.t / 0.9);
  ctx.beginPath();
  ctx.arc(imp.x, imp.y, 28, 0, Math.PI*2);
  ctx.fillStyle = '#ff4444';
  ctx.fill();
  ctx.restore();
}

for (let run of planeRuns) {
  const elapsed = globalTime - run.start;
  const frac = Math.min(1, elapsed / run.duration);

  if (run.type === 'airstrike' || run.type === 'carpet') {
    const formation = run.formation || [{lead:0},{lead:0.06},{lead:-0.06}];
    for (let pi = 0; pi < formation.length; pi++) {
      const p = formation[pi];
      let px = 0, py = 0, ang = 0;
      if (run.orientation === 'horizontal' || run.type === 'airstrike') {
        px = (run.direction === 'lr') ? (frac * canvas.width) : ((1 - frac) * canvas.width);
        px += (p.lead || 0) * canvas.width * 0.03;
        py = (typeof run.ty === 'number') ? run.ty + (p.lateral || 0) : (canvas.height * 0.3 + p.lateral || 0);
        ang = (run.direction === 'lr') ? 0 : Math.PI;
      } else {
        py = (run.direction === 'tb') ? (frac * canvas.height) : ((1 - frac) * canvas.height);
        py += (p.lead || 0) * canvas.height * 0.03;
        px = (typeof run.tx === 'number') ? run.tx + (p.lateral || 0) : (canvas.width * 0.5 + p.lateral || 0);
        ang = (run.direction === 'tb') ? Math.PI/2 : -Math.PI/2;
      }

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang);
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(12, 0);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
}

for (let b of beams) {
  const age = globalTime - b.start;
  const lifeFrac = b.duration ? Math.max(0, 1 - age / b.duration) : 1;

  if (b.type === 'dyson') {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.angle);
    ctx.globalAlpha = 0.6 * (0.7 + 0.3 * lifeFrac);

    ctx.beginPath();
    ctx.rect(-b.rangeUp, -b.width * 1.6, b.rangeUp * 1.02, b.width * 3.2);
    ctx.fillStyle = 'rgba(255,144,32,0.08)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(-b.rangeUp, -b.width * 0.45, b.rangeUp * 1.02, b.width * 0.9);
    ctx.fillStyle = 'rgba(255,150,64,0.95)';
    ctx.fill();

    ctx.beginPath();
    ctx.rect(-b.rangeUp, -2, b.rangeUp * 1.02, 4);
    ctx.fillStyle = 'rgba(255,220,120,0.95)';
    ctx.fill();

    if (Math.random() < 0.6) {
      particles.push({
        x: b.x + (Math.random() - 0.5) * 12,
        y: b.y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.8,
        life: 0.6 + Math.random() * 0.8,
        maxLife: 0.6 + Math.random() * 0.8,
        size: 6 + Math.random() * 8,
        colorStart: [255, 180, 80],
        colorEnd: [255, 80, 20]
      });
    }

    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = 'rgba(255,120,120,0.18)';
    ctx.lineWidth = b.width;
    ctx.beginPath();
    const dx = Math.cos(b.angle) * b.range, dy = Math.sin(b.angle) * b.range;
    ctx.moveTo(b.x - dx, b.y - dy);
    ctx.lineTo(b.x + dx, b.y + dy);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,200,200,0.85)';
    ctx.lineWidth = Math.max(2, b.width * 0.4);
    ctx.beginPath();
    ctx.moveTo(b.x - dx, b.y - dy);
    ctx.lineTo(b.x + dx, b.y + dy);
    ctx.stroke();
    ctx.restore();
  }
}

if (globalEMP.active && globalEMP.expires > globalTime) {
  const tleft = globalEMP.expires - globalTime;
  const alpha = Math.max(0.12, Math.min(0.9, tleft / 2));
  ctx.save();
  ctx.globalAlpha = alpha * 0.22;
  ctx.fillStyle = '#a7d7ff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.restore();
}
  }
  function drawCircle(x,y,color,label){
    ctx.save();
    ctx.beginPath();
    ctx.arc(x,y,16,0,2*Math.PI);
    ctx.fillStyle=color;
    ctx.shadowColor=color;
    ctx.shadowBlur=12;
    ctx.fill();
    ctx.restore();
    ctx.font = 'bold 14px Orbitron, sans-serif';
    ctx.fillStyle=color;
    ctx.textAlign='center';
    ctx.fillText(label,x,y-22);
  }
    
      
function drawTowers() {
  for(const t of towers){
    let target = null;
    let bestIdx = -1, bestProgress = -1;
for (let e of enemies) {
  if (t.targets === "ground" && e.type.flying) continue;
  if (t.targets === "air" && !e.type.flying) continue;
  let dx = e.x - t.x, dy = e.y - t.y;
  let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < t.range) {
          if (
          e.pathIdx > bestIdx ||
          (e.pathIdx === bestIdx && e.progress > bestProgress)
        ) {
          bestIdx = e.pathIdx;
          bestProgress = e.progress;
          target = e;
        }
      }
    }
    if (target) {
      t.aimAngle = Math.atan2(target.y-t.y, target.x-t.x);
    }
    let angle = t.aimAngle !== undefined ? t.aimAngle : 0;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(angle);

    ctx.save();
    ctx.rotate(-angle);
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, 2*Math.PI);
    ctx.fillStyle = "#555";
    ctx.fill();
    ctx.restore();

    if (t.name === "Machine Gun") {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(t.radius+12, 0);
      ctx.lineWidth = 7;
      ctx.strokeStyle = t.color;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-8, 0, 2*Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    } else if (t.name === "Cannon") {
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(t.radius+14, -4);
      ctx.lineTo(t.radius+14, 4);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-10, 0, 2*Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    } else if (t.name === "Sniper") {
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(t.radius+20, -2);
      ctx.lineTo(t.radius+20, 2);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(t.radius+18, 0, 5, 0, Math.PI*2);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.6;
      ctx.fill();
    } else if (t.name === "Flame Tower") {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(t.radius + 14, -10);
      ctx.lineTo(t.radius + 24, 0);
      ctx.lineTo(t.radius + 14, 10);
      ctx.closePath();
      ctx.fillStyle = "#bbb";
      ctx.globalAlpha = 1.0;
      ctx.fill();
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-5, 0, 2 * Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.65;
      ctx.fill();
    }
    else if (t.name === "Flak Tower") {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(t.radius + 19, -6);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#aaa";
      ctx.stroke();
      ctx.restore();
    
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(t.radius + 19, 6);
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#eee";
      ctx.stroke();
      ctx.restore();
    
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-8, 0, 2 * Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-14, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
    else if (t.name === "SAM Missile") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(t.radius-2, -7, 28, 14);
      ctx.fillStyle = "#aaa";
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    
      ctx.save();
      ctx.beginPath();
      ctx.arc(t.radius+30, 0, 6, 0, 2*Math.PI);
      ctx.fillStyle = "#f33";
      ctx.globalAlpha = 1;
      ctx.fill();
      ctx.restore();
    
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-9, 0, 2 * Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

  }
}
      
function drawTowerPreview(x, y, towerType) {
    let valid = isTowerPlacementValid(x, y, towerType.radius);
    let canAfford = (money >= towerType.cost);
    let target = null;
    let bestIdx = -1, bestProgress = -1;
    for (let e of enemies) {
      let dx = e.x - x, dy = e.y - y;
      let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < towerType.range) {
        if (
          e.pathIdx > bestIdx ||
          (e.pathIdx === bestIdx && e.progress > bestProgress)
        ) {
          bestIdx = e.pathIdx;
          bestProgress = e.progress;
          target = e;
        }
      }
    }
    let angle = target ? Math.atan2(target.y - y, target.x - x) : 0;

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(x, y, towerType.range, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.save();
  ctx.rotate(-angle);
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius, 0, 2 * Math.PI);
  ctx.fillStyle = valid ? "#555" : "#888";
  ctx.fill();
  ctx.restore();

  ctx.globalAlpha = valid ? 0.6 : 0.4;
  if (towerType.name === "Machine Gun") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(towerType.radius + 12, 0);
    ctx.lineWidth = 7;
    ctx.strokeStyle = towerType.color;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, towerType.radius - 8, 0, 2 * Math.PI);
    ctx.fillStyle = towerType.color;
    ctx.globalAlpha *= 0.8;
    ctx.fill();
  } else if (towerType.name === "Cannon") {
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(towerType.radius + 14, -4);
    ctx.lineTo(towerType.radius + 14, 4);
    ctx.lineTo(0, 4);
    ctx.closePath();
    ctx.fillStyle = towerType.color;
    ctx.globalAlpha *= 0.85;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, towerType.radius - 10, 0, 2 * Math.PI);
    ctx.fillStyle = towerType.color;
    ctx.globalAlpha *= 0.5;
    ctx.fill();
  } else if (towerType.name === "Sniper") {
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(towerType.radius + 20, -2);
    ctx.lineTo(towerType.radius + 20, 2);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fillStyle = towerType.color;
    ctx.globalAlpha *= 0.8;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(towerType.radius + 18, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha *= 0.6;
    ctx.fill();
  } else if (towerType.name === "Flame Tower") {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(towerType.radius + 14, -10);
  ctx.lineTo(towerType.radius + 24, 0);
  ctx.lineTo(towerType.radius + 14, 10);
  ctx.closePath();
  ctx.fillStyle = "#bbb";
  ctx.globalAlpha = 1.0;
  ctx.fill();
  ctx.strokeStyle = "#888";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-5, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.65;
  ctx.fill();
}
else if (towerType.name === "Flak Tower") {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(towerType.radius + 19, -6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#aaa";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(towerType.radius + 19, 6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#eee";
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-8, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-14, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}
else if (towerType.name === "SAM Missile") {
  ctx.save();
  ctx.beginPath();
  ctx.rect(towerType.radius-2, -7, 28, 14);
  ctx.fillStyle = "#aaa";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.arc(towerType.radius+30, 0, 6, 0, 2*Math.PI);
  ctx.fillStyle = "#f33";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-9, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, towerType.radius, 0, 2 * Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = valid ? "#fff" : "#f44";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = 'bold 12px Orbitron,sans-serif';
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(towerType.name, x, y - towerType.radius - 8);
  ctx.restore();

if (!canAfford) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#fc3232";
  ctx.font = "bold 15px Orbitron,sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Not enough money!", x, y + towerType.radius + 24);
  ctx.restore();
}
}

function drawParticles() {

  for (let p of particles) {
    const lifeFrac = p.life / p.maxLife;
    const currentSize = p.size * lifeFrac;
    
    const c0 = p.colorStart || [255, 230, 32];
    const c1 = p.colorEnd   || [255, 32, 32];
    const r = Math.round(c0[0] * lifeFrac + c1[0] * (1-lifeFrac));
    const g = Math.round(c0[1] * lifeFrac + c1[1] * (1-lifeFrac));
    const b = Math.round(c0[2] * lifeFrac + c1[2] * (1-lifeFrac));

    const color = `rgb(${r},${g},${b})`;
      
    if (p.plane) {
      ctx.save();
      ctx.translate(p.x, p.y);
      const ang = Math.atan2(p.vy || 0, p.vx || 1);
      ctx.rotate(ang);
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.moveTo(-6, -3); ctx.lineTo(8, 0); ctx.lineTo(-6, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }
      
    ctx.save();
    ctx.globalAlpha = Math.max(0, lifeFrac * 1.10);
    ctx.beginPath();
    ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 13 + 9*lifeFrac;
    ctx.fill();
    ctx.restore();
  }
}

function renderDeckBuilder() {
  startScreen.classList.remove('active');
  mapSelect.classList.remove('active');
  gameScreen.classList.remove('active');
  deckBuilderScreen.classList.add('active');

  const header = deckBuilderScreen.querySelector('h2');
  if (header) header.textContent = 'Build your Deck — 8 Cards (Bastions & Trump Cards)';

  cardsPool.innerHTML = '';
  const availablePool = CARD_POOL.filter(c => !DECK.includes(c.id));
  availablePool.forEach(card=>{
    const el = document.createElement('div');
    el.className = 'deckCard';
    el.dataset.cid = card.id;
    el.draggable = true;
    el._cardRef = card.ref; 
    el.dataset.type = card.type;
    el.dataset.name = card.name;
    el.dataset.cost = card.ref?.cost ?? '';
    el.dataset.desc = card.ref?.desc ?? (card.ref?.description ?? '');

    el.innerHTML = `<div class="title">${card.name}</div>
                    <div style="font-size:13px;color:#9fb">${card.type.toUpperCase()}</div>
                    <div style="font-size:13px;color:#ffd">${card.ref?.cost ? '$'+(card.ref.cost||'') : ''}</div>`;

    el.addEventListener('mouseenter', showTowerPopup);
    el.addEventListener('mouseleave', hideTowerPopup);
    el.addEventListener('mousemove', moveTowerPopup);
    el.addEventListener('pointerdown', (ev) => {
      hideTowerPopup();
    }, {passive: true});

    el.addEventListener('dragstart', (ev)=>{
      isDraggingCard = true;
      hideTowerPopup();
      ev.dataTransfer.setData('application/x-card', card.id);
      ev.dataTransfer.effectAllowed = 'copy';
    });
    el.addEventListener('dragend', (ev)=>{
      isDraggingCard = false;
      setTimeout(()=>{ drawMap(activeMap); }, 10);
    });

    el.addEventListener('click', ()=> {
      addCardToDeck(card.id);
    });

    cardsPool.appendChild(el);
  });

  cardsPool.ondragover = (ev)=>{ ev.preventDefault(); };
  cardsPool.ondrop = (ev)=>{
    ev.preventDefault();
    const deckIdx = ev.dataTransfer.getData('application/x-deck-index');
    if (deckIdx !== '') {
      const idx = parseInt(deckIdx,10);
      if (!Number.isNaN(idx) && DECK[idx]) {
        DECK.splice(idx,1);
        renderDeckBuilder();
        updateDeckCount();
      }
    }
  };

  renderDeckSlots();
  updateDeckCount();
};


function renderDeckSlots() {
  deckSlots.innerHTML = '';

  deckSlots.style.display = 'grid';
  deckSlots.style.gridTemplateColumns = 'repeat(4, 1fr)';
  deckSlots.style.gap = '10px';
  deckSlots.style.justifyItems = 'center';
  deckSlots.style.alignItems = 'start';

  for (let i = 0; i < DECK_MAX; i++) {
    const slot = document.createElement('div');
    slot.className = 'deckSlot' + (DECK[i] ? '' : ' empty');
    slot.dataset.idx = i;
    slot.addEventListener('dragover', (ev)=>{ ev.preventDefault(); });
    slot.addEventListener('drop', (ev)=>{
      ev.preventDefault();
      const cardId = ev.dataTransfer.getData('application/x-card');
      const deckIdx = ev.dataTransfer.getData('application/x-deck-index');

      if (cardId) {
        if (DECK.includes(cardId)) return; 
        if (DECK.length < DECK_MAX) {
          DECK.splice(i, 0, cardId);
        } else {
          DECK[i] = cardId;
        }
        renderDeckBuilder();
        updateDeckCount();
        return;
      }

      if (deckIdx !== '') {
        const from = parseInt(deckIdx,10);
        if (!Number.isNaN(from) && DECK[from]) {
          const item = DECK.splice(from,1)[0];
          DECK.splice(i,0,item);
          renderDeckBuilder();
          updateDeckCount();
        }
      }
    });

    if (DECK[i]) {
      const cardDef = CARD_POOL.find(c=>c.id === DECK[i]);
      const name = cardDef?.name || DECK[i];

      const inner = document.createElement('div');
      inner.className = 'deckCard small';
      inner.style.width = '92px';
      inner.style.height = '116px';
      inner.style.display = 'flex';
      inner.style.alignItems = 'center';
      inner.style.justifyContent = 'center';
      inner.style.textAlign = 'center';
      inner.textContent = name.length > 12 ? name.slice(0,12)+'…' : name;

      inner._cardRef = cardDef?.ref || null;
      inner.dataset.type = cardDef?.type || '';
      inner.dataset.name = name;
      inner.dataset.cost = cardDef?.ref?.cost ?? '';
      inner.dataset.desc = cardDef?.ref?.desc ?? (cardDef?.ref?.description ?? '');

      inner.draggable = true;
      inner.addEventListener('dragstart', (ev)=>{
        isDraggingCard = true;
        hideTowerPopup();
        ev.dataTransfer.setData('application/x-deck-index', String(i));
        ev.dataTransfer.effectAllowed = 'move';
      });
      inner.addEventListener('dragend', (ev)=>{
        isDraggingCard = false;
        setTimeout(()=>{ drawMap(activeMap); }, 10);
      });

      inner.addEventListener('mouseenter', showTowerPopup);
      inner.addEventListener('mouseleave', hideTowerPopup);
      inner.addEventListener('mousemove', moveTowerPopup);
      inner.addEventListener('pointerdown', (ev) => {
        hideTowerPopup();
      }, {passive:true});

      inner.addEventListener('click', ()=>{
        DECK.splice(i,1);
        renderDeckBuilder();
        updateDeckCount();
      });

      slot.appendChild(inner);
    } else {
      slot.textContent = '+';
      slot.classList.add('empty');
    }
    deckSlots.appendChild(slot);
  }
}

function addCardToDeck(cardId) {
  if (DECK.length >= DECK_MAX) {
    spawnFloatingText('Deck full', deckBuilderScreen.offsetLeft + 40, 80, '#ff8888');
    return;
  }
  if (DECK.includes(cardId)) {
    spawnFloatingText('Already in deck', deckBuilderScreen.offsetLeft + 40, 80, '#ff8888');
    return;
  }
  DECK.push(cardId);
  renderDeckBuilder();
  updateDeckCount();
}


deckClearBtn.addEventListener('click', ()=>{
  DECK = [];
  renderDeckBuilder();
  updateDeckCount();
});

function updateDeckCount() {
  deckCountEl.textContent = `${DECK.length}/${DECK_MAX}`;
  deckStartBtn.disabled = (DECK.length !== DECK_MAX);
  deckStartBtn.style.opacity = deckStartBtn.disabled ? 0.55 : 1;
}

deckStartBtn.addEventListener('click', ()=>{
  if (DECK.length !== DECK_MAX) return;
  deckBuilderScreen.classList.remove('active');
  mapSelect.classList.add('active');
});

function renderTowerMenu(){
  if (inUpgradeMenu) return;
  buildMode = false;
  buildTowerType = null;
  sideTitle.textContent = 'Cards';

  const allowedBastions = DECK.filter(id=>id.startsWith('bastion:')).map(id=>id.split(':')[1]);
  const allowedTrumps = DECK.filter(id=>id.startsWith('trump:')).map(id=>id.split(':')[1]);

  const showAllBastions = (DECK.length === 0);
  const showAllTrumps = (DECK.length === 0);

  sideContent.innerHTML = '';  
  sideContent.style.maxHeight = "400px";
  sideContent.style.overflowY = "auto";
  sideContent.style.position = "relative";
  sideContent.style.width = "340px";

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.flexWrap = 'wrap';
  wrap.style.gap = '10px';
  wrap.style.padding = '10px';

  const cardsToShow = CARD_POOL.filter(card => {
    if (card.type === 'bastion') return showAllBastions || allowedBastions.includes(card.name);
    if (card.type && card.type.toString().startsWith('trump')) return showAllTrumps || allowedTrumps.includes(card.ref?.id || card.id.split(':')[1]);
    return true;
  });

  cardsToShow.forEach((card, idx) => {
    const el = document.createElement('div');
    el.className = 'deckCard';
    el.style.width = '112px';
    el.style.height = '132px';
    el.style.padding = '8px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.justifyContent = 'space-between';
    el.dataset.index = String(idx);
    el.dataset.type = card.type; 
    el.dataset.cardId = card.id;
    el.dataset.name = card.name;
    el.dataset.cost = card.ref?.cost ?? '';
    el.dataset.desc = card.ref?.desc ?? (card.ref?.description ?? '');

    el._cardRef = card.ref;

    el.innerHTML = `<div class="title" style="font-size:14px">${card.name}</div>
                    <div style="font-size:11px;color:#9fb">${(card.type || '').toUpperCase()}</div>
                    <div style="font-size:12px;color:#ffd">${card.ref?.cost ? '$'+card.ref.cost : ''}</div>`;

    el.addEventListener('mouseenter', showTowerPopup);
    el.addEventListener('mouseleave', hideTowerPopup);
    el.addEventListener('mousemove', moveTowerPopup);

    el.addEventListener('click', (ev) => {
      if (DECK.length > 0 && !DECK.includes(card.id)) {
        spawnFloatingText('Not in deck', canvas.width - 160, 120, '#ff8888');
        return;
      }

      if (card.type === 'bastion') {
        enterBuildMode(card.ref);
      } else {
        const sup = card.ref;
        if (!sup) return;
        if (money < sup.cost) {
          spawnFloatingText('Not enough $', canvas.width - 160, 120, '#ff8888');
          return;
        }
        money -= sup.cost;
        updateUI();
        if (sup.type === 'target') {
          enterSupportTargetMode(sup);
        } else {
          sup.action();
          drawMap(activeMap);
        }
      }
    });

    wrap.appendChild(el);
  });

  if (cardsToShow.length === 0) {
    const empty = document.createElement('div');
    empty.style.padding = '12px';
    empty.style.color = '#ffb3b3';
    empty.textContent = 'No cards available in your deck. Add Bastions or Trump Cards in Deck Builder.';
    sideContent.appendChild(empty);
    return;
  }

  sideContent.appendChild(wrap);
}

function scheduleGameEvent(delayMs, fn) {
  const delaySecondsGame = (delayMs / 1000);
  scheduledEvents.push({ time: globalTime + delaySecondsGame, fn });
}

function getTowerUpgradeCost(tower, baseCost, multiplier = 1.5) {
  const currentLevel = tower.level || 1;
  return Math.round(baseCost * Math.pow(multiplier, currentLevel - 1));
}

function renderUpgradeMenu(tower) {
console.log('UPGRADE MENU')
  inUpgradeMenu = true;
  buildMode = false;
  buildTowerType = null;
  upgradingTower = tower;
  const level = tower.level || 1;
  const nextLevel = level + 1;
  const upgrade = tower.upgrade || { damage:1, range:4, fireRate:-0.02 };
  const isMax = (level >= MAX_LEVEL);
    const tType = TOWER_TYPES.find(t=>t.name === tower.name);
    const baseUpgradeCost = tType.upgradeCost || 40;

  let next = {
    damage: isMax ? 0 : upgrade.damage,
    range: isMax ? 0 : upgrade.range,
    fireRate: isMax ? 0 : upgrade.fireRate
  };

  sideTitle.textContent = `${tower.name} Upgrade`;
  sideContent.innerHTML =
    `<div>
      <div style="color:#ffe066;font-weight:bold;font-size:16px;margin-bottom:3px;">${tower.name}</div>
      <div style="font-size:14px;color:#ffd700;display:flex;align-items:center;gap:10px;">
        Level ${level}
        <span>${getLevelDots(level)}</span>
      </div>
      <div style="font-size:13px;color:#aaffaa;margin-bottom:10px;">${tower.desc}</div>
      <div style="margin:12px 0;font-size:14px;">
        Damage: <strong>${tower.damage}</strong>
        <span style="color:#9f4;">${next.damage!==0?'(+'+next.damage+')':''}</span><br>
        Range: <strong>${tower.range}</strong>
        <span style="color:#9f4;">${next.range!==0?'(+'+next.range+')':''}</span><br>
        Fire Rate: <strong>${tower.fireRate.toFixed(2)}</strong>
        <span style="color:#9f4;">${next.fireRate!==0?'('+next.fireRate.toFixed(2)+')':''}</span>
      </div>
      <div style="margin:8px 0 16px 0;color:#ffd700;">
      Upgrade Cost: <b>$${getTowerUpgradeCost(tower, baseUpgradeCost)}</b>
    </div>

      <button class="towerBtn" id="upgradeBtn" style="background:#2b7c2b;border-color:#6f6;" ${isMax?'disabled':''}>Upgrade</button>
      <button class="towerBtn" id="exitUpgradeBtn" style="background:#3a1a1a;border-color:#337779;">Back</button>
      ${isMax?'<div style="color:#f55;font-size:14px;font-weight:bold;margin-top:7px;">Max Level</div>':''}
    </div>`;

  document.getElementById('upgradeBtn').onclick = ()=>{
    if (tower.level === undefined) tower.level = 1;
    if (tower.level >= MAX_LEVEL) return;

const upgradeCost = getTowerUpgradeCost(tower, baseUpgradeCost);
if (money < upgradeCost) {
  return;
}
money -= upgradeCost;
    tower.damage += upgrade.damage;
    tower.range  += upgrade.range;
    tower.fireRate += upgrade.fireRate;
    tower.level++;
    renderUpgradeMenu(tower);
    drawMap(activeMap);
    updateUI();
  };
  document.getElementById('exitUpgradeBtn').onclick = ()=>{
    upgradingTower = null;
    inUpgradeMenu = false;
    renderTowerMenu();
    drawMap(activeMap);
  };
  removeCanvasListeners();
  canvas.addEventListener('click', onCanvasClick);
}

function getLevelDots(level) {
  let html = '';
  for(let i=1; i<=MAX_LEVEL; ++i) {
    html += `<span style="display:inline-block;width:13px;height:13px;
      margin:0 2.5px;border-radius:50%;background:${i <= level ? "#ffd700" : "#444"};
      border:1.5px solid #222;vertical-align:middle;"></span>`;
  }
  return html;
}

function formatTargets(targets) {
  if (!targets) return "";
  if (targets === "ground") return "Ground";
  if (targets === "air") return "Air";
  if (targets === "both") return "Ground + Air";
  return targets;
}

function showTowerPopup(e){
  if (isDraggingCard) return; 

  const el = e.currentTarget || e.target;
  const cardEl = el.classList && el.classList.contains('deckCard') ? el : (el.closest ? el.closest('.deckCard') : el);
  if (!cardEl) return;

  const pop = document.getElementById("towerPopup");
  if (!pop) return;
  pop.style.display = "block";

  const type = cardEl.dataset.type || '';
  const name = cardEl.dataset.name || '';
  const cost = cardEl.dataset.cost || '';
  const desc = cardEl.dataset.desc || '';
  const ref = cardEl._cardRef;

  let html = `<div style="font-size:18px;color:#83ffa8;font-weight:bold;margin-bottom:8px;">${name}</div>`;

  if (type && type.toString().startsWith('bastion')) {
    const t = ref || {};
    html += `<div style="color:#ffd700; font-size:15px; margin-bottom:8px;">Cost: $${t.cost || cost || ''}</div>`;
    html += `<div style="color:#aaffaa;margin-bottom:8px;">${t.desc || desc || ''}</div>`;
    html += `<div>
               <span style="color:#ff7777;">Damage:</span> <b>${t.damage ?? '-'}</b><br>
               <span style="color:#ffdf97;">Range:</span> <b>${t.range ?? '-'}</b><br>
               <span style="color:#b2b2ff;">Fire Rate:</span> <b>${t.fireRate ? (1/t.fireRate).toFixed(2) + ' shots/sec' : '-'}</b><br>
               <span style="color:#ffaaff;">Targets:</span> <b>${formatTargets(t.targets)}</b>
             </div>`;
  } else {
    const s = ref || {};
    html += `<div style="color:#ffd700; font-size:15px; margin-bottom:8px;">Cost: $${s.cost || cost || ''}</div>`;
    html += `<div style="color:#aaffaa;margin-bottom:8px;">${s.desc || desc || ''}</div>`;
    if (s.type === 'target' && s.radius) {
      html += `<div style="margin-top:6px;color:#ffdf97;">Area Radius: ${s.radius}px</div>`;
    } else if (s.type) {
      html += `<div style="margin-top:6px;color:#ffdf97;">Type: ${s.type}</div>`;
    }
  }

  pop.innerHTML = html;
  moveTowerPopup(e);
}

function hideTowerPopup(){
  const pop = document.getElementById("towerPopup");
  pop.style.display = "none";
}

function moveTowerPopup(e){
  const pop = document.getElementById("towerPopup");
  let x = e.clientX+18, y = e.clientY-10;
  if (x+pop.offsetWidth > window.innerWidth-15) {
    x = window.innerWidth - pop.offsetWidth - 12;
  }
  pop.style.left = x+"px";
  pop.style.top = y+"px";
}

  function enterBuildMode(towerType){
    hideTowerPopup();
    buildMode = true;
    buildTowerType = towerType;
    sideTitle.textContent = 'Build Mode';
    sideContent.innerHTML =
      `<div class="buildInstruction">Click area to place</div>
       <button class="towerBtn" id="cancelBuildBtn" style="background:#3a1a1a;border-color:#9c2222;">Cancel</button>`;
    document.getElementById('cancelBuildBtn').onclick = ()=>{
      renderTowerMenu();
      drawMap(activeMap);
    };
    addCanvasListeners();
  }

  function isTowerPlacementValid(x, y, radius){
    const path = MAPS[activeMap];
    if(!path) return false;
    for(let i=1;i<path.length;i++){
      if(circleLineCollision(x, y, radius+10, path[i-1], path[i], 40)) return false;
    }
    if(x-radius<0 || y-radius<0 || x+radius>canvas.width || y+radius>canvas.height) return false;
    for(const t of towers){
      let dx = x-t.x, dy = y-t.y;
      if(Math.sqrt(dx*dx + dy*dy) < radius+t.radius+8) return false;
    }
    return true;
  }
      
  function circleLineCollision(cx, cy, cr, p1, p2, lineW){
    let x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y;
    let dx = x2-x1, dy = y2-y1;
    let l2 = dx*dx + dy*dy;
    let t = ((cx-x1)*dx + (cy-y1)*dy)/l2;
    t = Math.max(0, Math.min(1, t));
    let px = x1 + t*dx, py = y1 + t*dy;
    let dist = Math.sqrt((cx-px)**2 + (cy-py)**2);
    return dist < cr + lineW/2;
  }

  function addCanvasListeners(){
    canvas.addEventListener('mousemove', onCanvasMouseMove);
    canvas.addEventListener('click', onCanvasClick);
  }
  function removeCanvasListeners(){
    canvas.removeEventListener('mousemove', onCanvasMouseMove);
    canvas.removeEventListener('click', onCanvasClick);
  }
  function onCanvasMouseMove(e){
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX-rect.left, y = e.clientY-rect.top;
    buildPreviewPos = {x, y};
    drawMap(activeMap);
  }
function onCanvasClick(e) {
  if (supportPending) return;
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX-rect.left, y = e.clientY-rect.top;

  if (!buildMode) {
    let found = null;
    for (let t of towers) {
      let dx = x - t.x, dy = y - t.y;
      if (Math.sqrt(dx*dx + dy*dy) < t.radius) {
        found = t;
        break;
      }
    }
    if (found) {
      upgradingTower = found;
      renderUpgradeMenu(found);
      drawMap(activeMap);
      return;
    } else if (upgradingTower) {
      upgradingTower = null;
      renderTowerMenu();
      inUpgradeMenu = false;     
      drawMap(activeMap);
      return;
    }
  }

if(buildMode && buildTowerType && isTowerPlacementValid(x, y, buildTowerType.radius)){
  if (money < buildTowerType.cost) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y, buildTowerType.radius+14, 0, 2*Math.PI);
    ctx.fillStyle = "#fa0";
    ctx.fill();
    ctx.font = "bold 18px Orbitron,sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("Not enough $", x, y);
    ctx.restore();
    setTimeout(()=>drawMap(activeMap), 420);
    return;
  }
  money -= buildTowerType.cost;
  towers.push({
    x, y,
    ...buildTowerType,
    lastShot: 0,
    level: 1,
    aimAngle: 0,
    flakAlternator: buildTowerType.name === "Flak Tower" ? 0 : undefined
  });
  renderTowerMenu();
  drawMap(activeMap);
  updateUI();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, buildTowerType.radius+12, 0, 2*Math.PI);
      ctx.fillStyle = "#f44";
      ctx.fill();
      ctx.restore();
      setTimeout(()=>drawMap(activeMap), 180);
    }
  }

  window.addEventListener('resize', ()=>{
    if(activeMap) drawMap(activeMap);
  });

function supportMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  supportPreviewPos.x = e.clientX - rect.left;
  supportPreviewPos.y = e.clientY - rect.top;
  drawMap(activeMap);
}

function enterSupportTargetMode(support) {
  hideTowerPopup();
  buildMode = false;
  buildTowerType = null;
  upgradingTower = null;
  inUpgradeMenu = false;

  supportMode = support;
  supportPending = true;
  canvas.addEventListener('mousemove', supportMouseMove);
  sideTitle.textContent = `Targeting: ${support.name} — click map`;
  canvas.addEventListener('click', supportCanvasClick);
}

function supportCanvasClick(e) {
  if (!supportPending || !supportMode) return;
  let rect = canvas.getBoundingClientRect();
  let tx = e.clientX - rect.left, ty = e.clientY - rect.top;
  try {
    supportMode.action(tx, ty, supportMode);
  } catch (err) { console.error(err); }
  supportMode = null;
  supportPending = false;
  canvas.removeEventListener('mousemove', supportMouseMove);
  canvas.removeEventListener('click', supportCanvasClick);
  renderTowerMenu();
  drawMap(activeMap);  
}



function _spawnExplosionAt(tx, ty, radius, damage, countParticles = 28) {
  for (let e of enemies) {
    const dx = e.x - tx, dy = e.y - ty;
    if (Math.sqrt(dx*dx + dy*dy) <= radius) {
      dmgTarget(e, damage, { }); 
      if (e.hp <= 0) { e.done = true; money += e.type.reward; }
    }
  }
  for (let k = 0; k < countParticles; k++) {
    particles.push({
      x: tx + (Math.random()-0.5) * radius * 0.7,
      y: ty + (Math.random()-0.5) * radius * 0.7,
      vx: (Math.random()-0.5)*6,
      vy: (Math.random()-0.5)*6,
      life: 0.18 + Math.random()*0.2,
      maxLife: 0.22 + Math.random()*0.24,
      size: 10 + Math.random()*22,
      colorStart: [255,220,80],
      colorEnd:   [255,40,32]
    });
  }
}


// Nuke: schedule its main effect using game-time
function triggerNuke() {
  // Visual delay before nuke happens (was setTimeout 180ms)
  const delayMs = 180;
  scheduleGameEvent(delayMs, () => {
    screenFlash = 0.6;
    // instant-kill everything
    let killed = 0;
    for (let e of enemies) {
      if (!e.done) { e.done = true; money += e.type.reward; killed++; }
    }
    enemies = enemies.filter(e => !e.done);
    const cx = canvas.width / 2, cy = canvas.height / 2 - 40;
    // big white flash particles
    for (let i = 0; i < 160; i++) {
      particles.push({
        x: cx + (Math.random() - 0.5) * 180,
        y: cy + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -Math.abs(Math.random()) * 1.8 - 0.6,
        life: 1.6 + Math.random() * 1.8,
        maxLife: 1.6 + Math.random() * 1.8,
        size: 18 + Math.random() * 40,
        colorStart: [255, 255, 255],
        colorEnd: [120, 100, 88]
      });
    }
    for (let i = 0; i < 220; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        vx: (Math.random() - 0.5) * 0.8,
        vy: 0.6 + Math.random() * 1.6,
        life: 2.2 + Math.random() * 2.0,
        maxLife: 2.2 + Math.random() * 2.0,
        size: 4 + Math.random() * 6,
        colorStart: [200, 200, 200],
        colorEnd: [80, 80, 80]
      });
    }
    spawnFloatingText('NUKE!', canvas.width / 2, canvas.height / 2 - 80, '#ffffff');
    drawMap(activeMap);
    updateUI();
  });
}

function spawnICBMStrike(tx, ty, support) {
  const DAMAGE = 1200;
  const R = support.radius || 140;

  _spawnExplosionAt(tx, ty, R, DAMAGE, 120);

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: tx + (Math.random() - 0.5) * R * 0.9,
      y: ty + (Math.random() - 0.5) * R * 0.9,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -Math.abs(Math.random()) * 2.6,
      life: 1.0 + Math.random() * 1.8,
      maxLife: 1.0 + Math.random() * 1.8,
      size: 10 + Math.random() * 36,
      colorStart: [255, 220, 120],
      colorEnd: [120, 70, 50]
    });
  }

  drawMap(activeMap);
  updateUI();
}

function spawnCarpetBomb(tx, ty, orientation, support) {
  const direction = (orientation === 'horizontal') ? (Math.random() < 0.5 ? 'lr' : 'rl') :
                    (Math.random() < 0.5 ? 'tb' : 'bt');

  const formation = [
    { lead: 0.00, lateral: 0 },       
    { lead: -0.6, lateral: -12 },    
    { lead: -0.6, lateral: 12 }      
  ];

  const run = {
    type: 'carpet',
    orientation,
    direction,
    tx,       
    ty,       
    support,
    start: globalTime,
    duration: 2.2,
    formation,
    drops: [],               
    pendingExplosions: []  
  };

  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const frac = i / (steps - 1);
    const planeIdx = i % formation.length;
    const p = formation[planeIdx];
    run.drops.push({ frac, planeIdx, triggered: false, lead: p.lead, lateral: p.lateral });
  }

  planeRuns.push(run);


  spawnFloatingText('CARPET', tx, ty - 36, '#ffb36b');
}

function _spawnExplosionAt(tx, ty, radius, damage, countParticles = 22) {
  for (let e of enemies) {
    const dx = e.x - tx, dy = e.y - ty;
    if (Math.sqrt(dx*dx + dy*dy) <= radius) {
      dmgTarget(e, damage, {});
      if (e.hp <= 0) { e.done = true; money += e.type.reward; }
    }
  }
  for (let k = 0; k < countParticles; k++) {
    particles.push({
      x: tx + (Math.random()-0.5)*radius*0.6,
      y: ty + (Math.random()-0.5)*radius*0.6,
      vx: (Math.random()-0.5)*5,
      vy: (Math.random()-0.5)*5,
      life: 0.18 + Math.random()*0.22,
      maxLife: 0.22 + Math.random()*0.28,
      size: 8 + Math.random()*18,
      colorStart: [255,220,80],
      colorEnd:   [255,48,32],
    });
  }
}

function spawnAirstrike(tx, ty, support) {
  const direction = Math.random() < 0.5 ? 'lr' : 'rl';
  const run = {
    type: 'airstrike',
    tx, ty,
    direction,
    start: globalTime,
    duration: 1.8,
    lastBullet: globalTime - 0.1,   
    bulletInterval: 0.06,          
    bulletDamage: 50,            
    support
  };
  planeRuns.push(run);
  spawnFloatingText('AIRSTRIKE', tx, ty - 36, '#ffd76b');
}

function spawnOrbitalStrikeMultiple(count = 5) {
  for (let i = 0; i < count; i++) {
    const target = enemies.length ? enemies[Math.floor(Math.random()*enemies.length)] : null;
    const tx = target ? target.x : (Math.random()*canvas.width);
    const ty = target ? target.y : (Math.random()*canvas.height);
    setTimeout(()=> {
      orbitalImpacts.push({ x: tx, y: ty, t: 0.9 });
      _spawnExplosionAt(tx, ty, 48, 260, 40);
    }, i * 260);
  }
  spawnFloatingText('ORBITAL STRIKE', canvas.width/2, 60, '#ff6666');
}

function spawnEMPBlastGlobal(durationSeconds = 6) {
  for (let e of enemies) {
    e.disabledUntil = globalTime + durationSeconds; 
    e.weaponsDisabledUntil = globalTime + durationSeconds; 
  }

  for (let k = 0; k < 32; k++) {
    particles.push({
      x: canvas.width/2 + (Math.random()-0.5)*200,
      y: canvas.height/2 + (Math.random()-0.5)*120,
      vx: (Math.random()-0.5)*2.5,
      vy: (Math.random()-0.5)*2.5,
      life: 0.6 + Math.random()*0.8,
      maxLife: 0.6 + Math.random()*0.8,
      size: 6 + Math.random()*14,
      colorStart: [160,200,255],
      colorEnd:   [60,120,180]
    });
  }

  spawnFloatingText('EMP BLAST', canvas.width/2, 40, '#a7d7ff');
}

function spawnNicollDysonBeam(tx, ty, duration = 6) {
  const angle = Math.PI / 2; 
  const rangeUp = ty + 80;  

  const beam = {
    type: 'dyson',
    x: tx, y: ty,
    angle,
    start: globalTime,
    duration,
    width: 44,                 
    damagePerSecond: 1000,     
    rangeUp                  
  };
  beams.push(beam);
  spawnFloatingText('NICOLL-DYSON', tx, ty - 40, '#ffb3b3');
}

function updateUI() {
  waveDisplay.textContent = `Wave ${waveNumber}`;
  moneyDisplay.textContent = `$${money}`;
  document.getElementById('integrityDisplay').textContent = `Integrity: ${integrity}`;
}

function spawnWave() {
  if (!activeMap) return;
  if (waveNumber >= WAVES.length) {
    alert("All waves complete! You win.");
    return;
  }
  waveNumber++;
  updateUI();

  let wave = WAVES[waveNumber-1];
  let groups = wave.groups;
  let spawnQueue = [];
  for (let group of groups) {
    let time = 0;
    for (let i = 0; i < group.count; i++) {
      spawnQueue.push({ type: ENEMY_TYPES[group.type], spawnTime: time });
      time += group.spawnDelay;
    }
  }

  spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);

  currentWaveQueue = spawnQueue;
  currentWaveQueueIdx = 0;
  waveElapsedTime = 0;
}

function startWaveCountdown() {
  waveReadyTimeRemaining = 10; 
  nextWaveBtn.disabled = true;
  nextWaveBtn.textContent = `Next wave in (${Math.ceil(waveReadyTimeRemaining)})`;
}

nextWaveBtn.addEventListener('click', () => {
  if (waveReadyTimeRemaining <= 0 && activeMap) {
    spawnWave();
    startWaveCountdown();
  }
});

autoWaveBtn.addEventListener('click', () => {
  autoWave = !autoWave;
  autoWaveBtn.textContent = autoWave ? 'Auto: ON' : 'Auto: OFF';
  if (autoWave) autoWaveBtn.classList.add('active'); else autoWaveBtn.classList.remove('active');
});

  let currentWaveQueue = [];
  let currentWaveQueueIdx = 0;
      
let waveElapsedTime = 0;

function getEnemyUID(e) {
  if (!e._uid) e._uid = Math.random().toString(36).slice(2);
  return e._uid;
}

function dmgTarget(e, damage, t) {
  const armor = e.type.armor || 0;
  let effectiveDamage = damage - armor;
  if (effectiveDamage < 1) effectiveDamage = 0.1;
  e.hp -= effectiveDamage;
}

function spawnFlameParticles(x, y, angle, range, coneWidth, shotPower) {
  let num = Math.floor(12 * shotPower);
  for (let i = 0; i < num; ++i) {
    const randAng = angle + (Math.random()-0.5)*coneWidth*0.94;
    const dist = Math.random() * range * (0.6+0.25*Math.random());
    particles.push({
      x: x + Math.cos(randAng)*dist,
      y: y + Math.sin(randAng)*dist,
      vx: 0.6*Math.cos(randAng) + (Math.random()-0.5)*1.4,
      vy: 0.6*Math.sin(randAng) + (Math.random()-0.5)*1.4,
      life: 0.12 + Math.random()*0.12,
      maxLife: 0.16 + Math.random()*0.10,
      size: 9+Math.random()*9,
      color: `rgba(255,${48+Math.round(Math.random()*100)},0,1)`,
    });
  }
}

function spawnSAMMissile(tower, target, splashRadius) {
  missiles.push({
    x: tower.x,
    y: tower.y,
    targetId: getEnemyUID(target),
    speed: 8,
    range: tower.range,
    splashRadius,
    damage: tower.damage,
    tower
  });
}

function tickGame() {
  waveElapsedTime += (gameSpeed / 60);
  globalTime += (gameSpeed / 60);

    if (waveReadyTimeRemaining > 0) {
  waveReadyTimeRemaining -= (gameSpeed / 60);
  if (waveReadyTimeRemaining > 0) {
    nextWaveBtn.textContent = `Next wave in (${Math.ceil(waveReadyTimeRemaining)})`;
    nextWaveBtn.disabled = true;
  } else {
    waveReadyTimeRemaining = 0;
    nextWaveBtn.disabled = false;
    nextWaveBtn.textContent = "Start Next Wave";
  }
}
    
for (let si = scheduledEvents.length - 1; si >= 0; si--) {
  const ev = scheduledEvents[si];
  if (globalTime >= ev.time) {
    try {
      ev.fn();
    } catch (err) {
      console.error('Scheduled event error:', err);
    }
    scheduledEvents.splice(si, 1);
  }
}
 
if (prevWaveReady > 0 && waveReadyTimeRemaining === 0 && autoWave && activeMap) {
  spawnWave();
  startWaveCountdown();
}
prevWaveReady = waveReadyTimeRemaining;
    
if (bigMarkerTimer > 0) {
  bigMarkerTimer -= (gameSpeed / 60);
  if (bigMarkerTimer <= 0) bigMarkerPos = null;
}
if (screenFlash > 0) {
  screenFlash -= (gameSpeed / 60);
}

for (let i = orbitalImpacts.length - 1; i >= 0; i--) {
  orbitalImpacts[i].t -= (gameSpeed / 60);
  if (orbitalImpacts[i].t <= 0) orbitalImpacts.splice(i,1);
}

for (let ri = planeRuns.length - 1; ri >= 0; ri--) {
  const run = planeRuns[ri];
  const elapsed = globalTime - run.start;
  const frac = Math.min(1, Math.max(0, elapsed / run.duration));
  if (run.type === 'airstrike') {
    const fracPos = Math.min(1, Math.max(0, frac));
    const px = (run.direction === 'lr') ? (fracPos * canvas.width) : ((1 - fracPos) * canvas.width);
    const py = run.ty;
    while (globalTime - run.lastBullet >= run.bulletInterval) {
      run.lastBullet += run.bulletInterval;
      airBullets.push({
        x: px + (Math.random()-0.5) * 8,
        y: py + (Math.random()-0.5) * 6,
        vx: (run.direction === 'lr') ? 18 : -18,
        vy: (Math.random()-0.5) * 1.2,
        life: 1.8, 
        maxLife: 1.8,
        damage: run.bulletDamage
      });
    }
  }
  if (run.drops && run.drops.length) {
    for (let d of run.drops) {
      if (d.triggered) continue;
      if (frac >= d.frac) {
        d.triggered = true;

        let px = run.tx, py = run.ty;
        if (run.orientation === 'horizontal') {
          px = (run.direction === 'lr') ? (d.frac * canvas.width) : ((1 - d.frac) * canvas.width);
          py = run.ty;
          px += (d.lead || 0) * canvas.width * 0.03;
          py += (d.lateral || 0);
        } else {
          py = (run.direction === 'tb') ? (d.frac * canvas.height) : ((1 - d.frac) * canvas.height);
          px = run.tx;
          py += (d.lead || 0) * canvas.height * 0.03;
          px += (d.lateral || 0);
        }

        const fallMs = 420 + Math.random() * 220;
        const fallSecondsGame = (fallMs / 1000) / Math.max(0.0001, gameSpeed); 

        for (let k = 0; k < 6; k++) {
          particles.push({
            x: px + (Math.random() - 0.5) * 6,
            y: py + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: 1.6 + Math.random() * 1.6,
            life: fallSecondsGame * (0.8 + Math.random() * 0.4),
            maxLife: fallSecondsGame * (0.8 + Math.random() * 0.4),
            size: 6 + Math.random() * 6,
            colorStart: [220, 220, 220],
            colorEnd: [200, 120, 100]
          });
        }

        const ex = px + (Math.random() - 0.5) * 18;
        const ey = py + (Math.random() - 0.5) * 18;
        const eventTime = globalTime + fallSecondsGame;
        run.pendingExplosions = run.pendingExplosions || [];
        run.pendingExplosions.push({
          time: eventTime,
          x: ex,
          y: ey,
          radius: run.support?.radius || 28,
          damage: 110,
          countParticles: 18
        });
      }
    }
  }

  if (run.pendingExplosions && run.pendingExplosions.length) {
    for (let pi = run.pendingExplosions.length - 1; pi >= 0; pi--) {
      const ev = run.pendingExplosions[pi];
      if (globalTime >= ev.time) {
        _spawnExplosionAt(ev.x, ev.y, ev.radius, ev.damage, ev.countParticles);
        run.pendingExplosions.splice(pi, 1);
      }
    }
  }

if (elapsed > run.duration + 0.25 && (!run.pendingExplosions || run.pendingExplosions.length === 0)) {
    planeRuns.splice(ri, 1);
  }
}
  for (let i = airBullets.length - 1; i >= 0; i--) {
    const b = airBullets[i];
    b.x += b.vx * gameSpeed;
    b.y += b.vy * gameSpeed;
    b.life -= (gameSpeed / 60);
    // trail particles along the bullet path (cosmetic)
    if (Math.random() < 0.4) {
      particles.push({
        x: b.x + (Math.random()-0.5) * 4,
        y: b.y + (Math.random()-0.5) * 4,
        vx: 0,
        vy: 0,
        life: 0.12 + Math.random() * 0.12,
        maxLife: 0.12 + Math.random() * 0.12,
        size: 2 + Math.random() * 3,
        colorStart: [255,220,120],
        colorEnd: [255,120,60]
      });
    }

    // collision with enemies
    let hit = false;
    for (let e of enemies) {
      if (e.done) continue;
      const dx = e.x - b.x, dy = e.y - b.y;
      if (Math.hypot(dx,dy) < 16) {
        dmgTarget(e, b.damage, {});
        // small hit particle burst
        for (let k = 0; k < 8; k++) {
          particles.push({
            x: b.x + (Math.random() - 0.5) * 6,
            y: b.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 0.12 + Math.random()*0.16,
            maxLife: 0.12 + Math.random()*0.16,
            size: 4 + Math.random()*6,
            colorStart: [255,210,80],
            colorEnd: [255,60,40]
          });
        }
        hit = true;
        if (e.hp <= 0) { e.done = true; money += e.type.reward; }
        break;
      }
    }

    if (hit || b.life <= 0 || b.x < -40 || b.x > canvas.width + 40 || b.y < -40 || b.y > canvas.height + 40) {
      airBullets.splice(i, 1);
    }
  }

  for (let bi = beams.length - 1; bi >= 0; bi--) {
    const b = beams[bi];
    const age = globalTime - b.start;

    if (b.type === 'dyson') {
      const dps = b.damagePerSecond || 1000;
      const delta = (gameSpeed / 60); 
      const damageThisTick = dps * delta;
      const lx = Math.cos(b.angle), ly = Math.sin(b.angle);
      for (let e of enemies) {
        if (e.done) continue;
        const dx = e.x - b.x, dy = e.y - b.y;
        const proj = dx * lx + dy * ly;
        const closestX = b.x + proj * lx;
        const closestY = b.y + proj * ly;
        const dist = Math.hypot(e.x - closestX, e.y - closestY);
        if (dist < b.width) {
          dmgTarget(e, damageThisTick, b);
          particles.push({
            x: e.x + (Math.random() - 0.5) * 8,
            y: e.y + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.6,
            vy: (Math.random() - 0.5) * 1.6,
            life: 0.12 + Math.random() * 0.18,
            maxLife: 0.12 + Math.random() * 0.18,
            size: 6 + Math.random() * 6,
            colorStart: [255, 180, 80],
            colorEnd: [255, 60, 20]
          });
          if (e.hp <= 0) { e.done = true; money += e.type.reward; }
        }
      }
      if (age > b.duration) beams.splice(bi, 1);
    } else {
      const age = globalTime - b.start;
      b.angle += 0.005 * (b.sweepSpeed || 0.7) * (Math.sin(age + (b.phase || 0)));
      for (let e of enemies) {
        const dx = e.x - b.x, dy = e.y - b.y;
        const lx = Math.cos(b.angle), ly = Math.sin(b.angle);
        const proj = dx * lx + dy * ly;
        const closestX = b.x + proj * lx;
        const closestY = b.y + proj * ly;
        const dist = Math.hypot(e.x - closestX, e.y - closestY);
        if (dist < (b.width || 6) + 6) {
          dmgTarget(e, 12 * (gameSpeed));
          particles.push({
            x: e.x + (Math.random() - 0.5) * 6,
            y: e.y + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.8,
            vy: (Math.random() - 0.5) * 1.8,
            life: 0.12 + Math.random() * 0.16,
            maxLife: 0.18 + Math.random() * 0.2,
            size: 6 + Math.random() * 10,
            colorStart: [255, 210, 80],
            colorEnd: [255, 40, 40]
          });
          if (e.hp <= 0) { e.done = true; money += e.type.reward; }
        }
      }
      if (age > (b.duration || 1.0)) beams.splice(bi, 1);
    }
  }
    
  while (
    currentWaveQueue &&
    currentWaveQueueIdx < currentWaveQueue.length &&
    currentWaveQueue[currentWaveQueueIdx].spawnTime <= waveElapsedTime
  ) {
    spawnEnemy(currentWaveQueue[currentWaveQueueIdx].type);
    currentWaveQueueIdx++;
  }
    
    gameTick++;
    for (let enemy of enemies) {
      moveEnemy(enemy);
    }
    
for (const t of towers) {
  let target = null;
  let bestIdx = -1, bestProgress = -1;
  for (let e of enemies) {
  if (t.targets === "ground" && e.type.flying) continue;
  if (t.targets === "air" && !e.type.flying) continue;
    let dx = e.x - t.x, dy = e.y - t.y;
    let dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < t.range) {
      if (e.pathIdx > bestIdx || (e.pathIdx === bestIdx && e.progress > bestProgress)) {
        bestIdx = e.pathIdx;
        bestProgress = e.progress;
        target = e;
      }
    }
  }

if (target) {
  if (!t.lastShot) t.lastShot = 0;
  if (globalTime - t.lastShot >= t.fireRate) {
      switch(t.fireType) {
        case "bullet":
          dmgTarget(target, t.damage, t);
          if (target) t.aimAngle = Math.atan2(target.y-t.y, target.x-t.x);
          let angle = t.aimAngle !== undefined ? t.aimAngle : 0;
          let barrelLength = t.radius + (t.name === "Sniper" ? 20 : t.name === "Cannon" ? 14 : t.name === "Flak" ? 19 : 12);
          let px = t.x + Math.cos(angle) * barrelLength;
          let py = t.y + Math.sin(angle) * barrelLength;
          let count = 7 + Math.floor(3 * t.shotPower);
          for (let i = 0; i < count; i++) {
            let spread = (Math.random() - 0.5) * Math.PI / 4;
            let speed = 3 + Math.random() * 2 + t.shotPower;
            let pAngle = angle + spread;
              particles.push({
                x: px,
                y: py,
                vx: Math.cos(pAngle) * speed,
                vy: Math.sin(pAngle) * speed,
                size: 7 + Math.random() * 5 * t.shotPower,
                life: 0.16 + Math.random() * 0.13,
                maxLife: 0.18 + Math.random() * 0.11,
                colorStart: [255, 230, 32],
                colorEnd: [255, 32, 32],
              });
          }
        break;

        case "flame":
          if (target) t.aimAngle = Math.atan2(target.y-t.y, target.x-t.x);
          let flameAngle = t.aimAngle !== undefined ? t.aimAngle : 0;
          let coneWidth = Math.PI / 3;
          for(let e of enemies) {
            if (e.type.flying) continue;
            let ex = e.x - t.x, ey = e.y - t.y;
            let dist = Math.sqrt(ex*ex + ey*ey);
            if (dist > t.range) continue;
            let ang = Math.atan2(ey, ex);
            let dA = Math.abs(((ang - flameAngle + Math.PI*3) % (Math.PI*2)) - Math.PI);
            if (dA > coneWidth/2) continue;
            dmgTarget(e, t.damage, t);
          }
          spawnFlameParticles(t.x, t.y, flameAngle, t.range, coneWidth, t.shotPower);
        break;

        case "flak":
          if (!target.type.flying) break;
          dmgTarget(target, t.damage, t);
          if (t.flakAlternator === undefined) t.flakAlternator = 0;
          const muzzleSide = t.flakAlternator % 2 === 0 ? -1 : 1;
          t.flakAlternator++;
          const flakAngle = (target) ? Math.atan2(target.y - t.y, target.x - t.x) : 0;
          const barrelLengthFlak = t.radius + 19;
          const barrelOffsetFlak = 6;
          const fpx = t.x + Math.cos(flakAngle) * barrelLengthFlak - Math.sin(flakAngle) * barrelOffsetFlak * muzzleSide;
          const fpy = t.y + Math.sin(flakAngle) * barrelLengthFlak + Math.cos(flakAngle) * barrelOffsetFlak * muzzleSide;
          const flakCount = 7 + Math.floor(3 * t.shotPower);
          for (let i = 0; i < flakCount; i++) {
            const spread = (Math.random() - 0.5) * Math.PI / 6;
            const speed = 2.5 + Math.random() * 2.5;
            const pAngle = flakAngle + spread;
              particles.push({
                x: fpx,
                y: fpy,
                vx: Math.cos(pAngle) * speed,
                vy: Math.sin(pAngle) * speed,
                size: 7 + Math.random() * 5 * t.shotPower,
                life: 0.16 + Math.random() * 0.13,
                maxLife: 0.18 + Math.random() * 0.11,
                colorStart: [255, 230, 32],
                colorEnd: [255, 32, 32],
              });
          }
          break;

        case "missile":
          if (!target.type.flying) break;
          spawnSAMMissile(t, target, t.splashRadius);
        break;
      }
      t.lastShot = globalTime;
      if (target.hp <= 0) {
        target.done = true;
        money += target.type.reward;
      }
  }
}
}
for (let i = particles.length - 1; i >= 0; i--) {
  let p = particles[i];
  p.x += p.vx * gameSpeed;
  p.y += p.vy * gameSpeed;
  p.life -= (gameSpeed / 60);
  if (p.life <= 0) particles.splice(i, 1);
}
for (let m of missiles) {
  const e = enemies.find(e => getEnemyUID(e) === m.targetId && !e.done);
  if (!e) { m.done = true; continue; }
  const dx = e.x - m.x, dy = e.y - m.y;
  const dist = Math.sqrt(dx*dx + dy*dy);
  if (dist < 14) {
    for (let e2 of enemies) {
      if (!e2.type.flying) continue;
      const dx2 = e2.x - m.x, dy2 = e2.y - m.y;
      if (Math.sqrt(dx2*dx2 + dy2*dy2) < m.splashRadius) {
        dmgTarget(e2, m.damage, m.tower);
      }
    }
    for(let k=0;k<18;++k) {
      particles.push({
        x: m.x,
        y: m.y,
        vx: (Math.random()-0.5)*6,
        vy: (Math.random()-0.5)*6,
        life: 0.14 + Math.random()*0.16,
        maxLife: 0.14 + Math.random()*0.16,
        size: 9+Math.random()*10,
        color: "#ffee88"
      });
    }
    m.done = true;
    continue;
  }
  const norm = dist > 0.001 ? 1/dist : 0;
  m.x += dx * norm * m.speed * gameSpeed;
  m.y += dy * norm * m.speed * gameSpeed;
}
missiles = missiles.filter(m=>!m.done);
    
    enemies = enemies.filter(e => !e.done);
    drawMap(activeMap);
    updateUI();
    requestAnimationFrame(tickGame);


}

  function spawnEnemy(type) {
    const path = MAPS[activeMap];
    if (!path) return;
    enemies.push({
      type: type,
      hp: type.hp,
      x: path[0].x,
      y: path[0].y,
      pathIdx: 0,
      progress: 0,
      done: false
    });
  }

  function moveEnemy(enemy) {
    if (enemy.disabledUntil && globalTime < enemy.disabledUntil) {
  return;
}
    const path = MAPS[activeMap];
    if (!path || enemy.done) return;
    let idx = enemy.pathIdx;
    if (idx >= path.length - 1) {
      enemy.done = true;
      integrity -= Math.max(1, enemy.hp | 0); 
      updateUI();
      if (integrity <= 0) {
        integrity = 0;
        alert("You have been defeated! Integrity lost.");
      }
      return;
    }
    let p0 = path[idx], p1 = path[idx+1];
    let dx = p1.x - p0.x, dy = p1.y - p0.y;
    let dist = Math.sqrt(dx*dx+dy*dy);
    let speed = (enemy.type.speed * gameSpeed) / 60;
    let dp = speed / dist;
    enemy.progress += dp;
if (enemy.progress >= 1) {
  enemy.pathIdx++;
  enemy.progress = 0;
  if (enemy.pathIdx >= path.length - 1) {
    enemy.done = true;
    integrity -= Math.max(1, enemy.hp | 0);
    updateUI();
    if (integrity <= 0) {
      integrity = 0;
      alert("You have been defeated! Integrity lost.");
    }
    return;
  }

      p0 = path[enemy.pathIdx];
      p1 = path[enemy.pathIdx+1];
    }
    enemy.x = p0.x + (p1.x-p0.x)*enemy.progress;
    enemy.y = p0.y + (p1.y-p0.y)*enemy.progress;
  }

  function updateSpeedUI(){
    speedToggleBtn.textContent = gameSpeed + "x";
    speedToggleBtn.classList.add('active');
  }
  speedToggleBtn.addEventListener('click',()=>{
    gameSpeedIndex = (gameSpeedIndex + 1) % gameSpeedStates.length;
    gameSpeed = gameSpeedStates[gameSpeedIndex];
    updateSpeedUI();
  });
  updateSpeedUI();

  function startGameLoop() {
    requestAnimationFrame(tickGame);
  }
      
let startedLoop = false;

  function tryStartLoop() {
    if (!startedLoop && activeMap) {
      startedLoop = true;
      startGameLoop();
    }
  }

  function spawnEnemy(type) {
    const path = MAPS[activeMap];
    if (!path) return;
    enemies.push({
      type: type,
      hp: type.hp,
      x: path[0].x,
      y: path[0].y,
      pathIdx: 0,
      progress: 0,
      done: false
    });
  }

const fireCanvas = document.getElementById('fireCanvas');
const fireCtx = fireCanvas.getContext('2d');
let fireParticles = [];

function screensWithFireActive() {
  const startActive = document.getElementById('startScreen')?.classList.contains('active');
  const deckActive  = document.getElementById('deckBuilder')?.classList.contains('active');
  const selectActive = document.getElementById('mapSelect')?.classList.contains('active');
  return !!(startActive || deckActive || selectActive);
}

function resizeFireCanvas() {
  fireCanvas.width = window.innerWidth;
  fireCanvas.height = Math.max(170, Math.floor(window.innerHeight * 0.35));
}

resizeFireCanvas();
window.addEventListener('resize',resizeFireCanvas);

function spawnFireParticle() {
  const W = fireCanvas.width;
  const H = fireCanvas.height;
  const x = Math.random() * W;
  const y = H + 8 * Math.random();
  const colorR = 220 + Math.random()*30;
  const colorG = 60 + Math.random()*140;
  const color = `rgba(${colorR},${colorG},16,1)`;

  fireParticles.push({
    x,
    y,
    vx: (Math.random()-0.5) * 1.1,
    vy: -2.2 - Math.random()*1.5,
    life: 0.7 + Math.random()*0.8,
    maxLife: 0.7 + Math.random()*0.8,
    size:16 + Math.random()*18,
    color,
    glow: Math.random()*0.8+0.2
  });
}

function drawFireParticles() {
  fireCtx.clearRect(0,0,fireCanvas.width,fireCanvas.height);
  for (let p of fireParticles) {
    const lifeFrac = p.life/p.maxLife;
    fireCtx.save();
    fireCtx.globalAlpha = Math.max(0, Math.min(1, lifeFrac*1.18));
    fireCtx.beginPath();
    fireCtx.arc(p.x, p.y, p.size*lifeFrac*0.95, 0, 2*Math.PI);
    fireCtx.fillStyle = p.color;
    fireCtx.shadowColor = '#fa3';
    fireCtx.shadowBlur = 25*p.glow*lifeFrac;
    fireCtx.fill();
    fireCtx.restore();
  }
}

function tickFireParticles() {
  for (let p of fireParticles) {
    p.x += p.vx;
    p.y += p.vy + Math.sin(Date.now()/220+p.x/80)*0.22;
    p.life -= 0.02;
    p.size *= 0.995;
  }
  fireParticles = fireParticles.filter(p=>p.life>0 && p.y > -60);
}

function fireLoop() {
  if (screensWithFireActive()) {
    for (let i=0;i<8;++i) spawnFireParticle();
  }
  tickFireParticles();
  drawFireParticles();
  if (screensWithFireActive() || fireParticles.length > 0) {
    requestAnimationFrame(fireLoop);
  } else {
    fireCtx.clearRect(0,0,fireCanvas.width,fireCanvas.height);
  }
}
setTimeout(fireLoop, 150);

  updateUI();