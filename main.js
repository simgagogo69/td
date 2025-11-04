  // DOM refs
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

  // --- Game state ---
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

  document.getElementById('playBtn').addEventListener('click', ()=>{
    startScreen.classList.remove('active');
    mapSelect.classList.add('active');
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

  // Path coordinates
  const MAPS = {
    desert: [ {x:40,y:100}, {x:340,y:100}, {x:340,y:400}, {x:860,y:400} ],
    forest: [ {x:40,y:300}, {x:240,y:300}, {x:240,y:150}, {x:440,y:150}, {x:440,y:500}, {x:640,y:500}, {x:790,y:500} ,{x:790,y:200}, {x:860,y:200} ],
    city:   [ {x:40,y:200}, {x:440,y:200}, {x:440,y:350}, {x:640,y:350}, {x:640,y:100}, {x:860,y:100} ]
  };

  // Tower types
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
        splashRadius: 48  // example splash size in px
      }
    ];
const MAX_LEVEL = 5;

const upgradeAmounts = {
  damage: +4,
  range: +18,
  fireRate: -0.08, // faster (less is better)
}
  // Draw the map path
  function drawMap(name){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const path = MAPS[name];
    if(!path) return;
    // Draw main path (wide dark)
    ctx.lineWidth = 40;
    ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(path[0].x,path[0].y);
    for(let i=1;i<path.length;i++) ctx.lineTo(path[i].x,path[i].y);
    ctx.strokeStyle='#1a3d1a';
    ctx.stroke();
    // Draw dotted path (thin green)
    ctx.setLineDash([20,15]);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#4caf50';
    ctx.stroke();
    ctx.setLineDash([]);
    // Draw start/end indicators
    drawCircle(path[0].x,path[0].y,'#ff0','START');
    drawCircle(path[path.length-1].x,path[path.length-1].y,'#f00','END');
    // Draw towers
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
    // Draw selected tower's range if a tower is selected for upgrade
// Draw missiles (after towers, before particles)
for (let m of missiles) {
  // Find target for orientation
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
    // If in build mode, draw preview
    if(buildMode && buildTowerType && buildPreviewPos){
      drawTowerPreview(buildPreviewPos.x, buildPreviewPos.y, buildTowerType);
    }
    // Draw enemies
    drawEnemies();
    drawParticles();
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
    // Find nearest enemy in range for aiming
    let target = null;
    let bestIdx = -1, bestProgress = -1;
for (let e of enemies) {
  // Skip untargetable types
  if (t.targets === "ground" && e.type.flying) continue;
  if (t.targets === "air" && !e.type.flying) continue;
  let dx = e.x - t.x, dy = e.y - t.y;
  let dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < t.range) {
        // Is this enemy further along the path?
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

    // Draw base
    ctx.save();
    ctx.rotate(-angle);
    ctx.beginPath();
    ctx.arc(0, 0, t.radius, 0, 2*Math.PI);
    ctx.fillStyle = "#555";
    ctx.fill();
    ctx.restore();

    // Draw tower barrel by type
    if (t.name === "Machine Gun") {
      // Short barrel
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(t.radius+12, 0);
      ctx.lineWidth = 7;
      ctx.strokeStyle = t.color;
      ctx.stroke();
      // Body accent
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-8, 0, 2*Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
    } else if (t.name === "Cannon") {
      // Big barrel
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(t.radius+14, -4);
      ctx.lineTo(t.radius+14, 4);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      // Body accent
      ctx.beginPath();
      ctx.arc(0, 0, t.radius-10, 0, 2*Math.PI);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    } else if (t.name === "Sniper") {
      // Thin barrel & scope
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(t.radius+20, -2);
      ctx.lineTo(t.radius+20, 2);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fillStyle = t.color;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      // Scope
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

  // Draw base
  ctx.beginPath();
  ctx.arc(0, 0, t.radius-5, 0, 2 * Math.PI);
  ctx.fillStyle = t.color;
  ctx.globalAlpha = 0.65;
  ctx.fill();
}
else if (t.name === "Flak Tower") {
  // Draw two parallel barrels
  ctx.save();
  // Left barrel
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(t.radius + 19, -6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#aaa";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  // Right barrel
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(t.radius + 19, 6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#eee";
  ctx.stroke();
  ctx.restore();

  // Draw base
  ctx.beginPath();
  ctx.arc(0, 0, t.radius-8, 0, 2 * Math.PI);
  ctx.fillStyle = t.color;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  // Flak radome/cap
  ctx.beginPath();
  ctx.arc(0, 0, t.radius-14, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}
else if (t.name === "SAM Missile") {
  // Missile tube/barrel
  ctx.save();
  ctx.beginPath();
  ctx.rect(t.radius-2, -7, 28, 14); // missile pod
  ctx.fillStyle = "#aaa";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Missile tip
  ctx.save();
  ctx.beginPath();
  ctx.arc(t.radius+30, 0, 6, 0, 2*Math.PI);
  ctx.fillStyle = "#f33";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();

  // Base
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
    
// Find first enemy in range from preview position
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

  // Draw range circle
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.arc(x, y, towerType.range, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.fill();
  ctx.restore();

  // Draw tower base and barrel
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Draw base
  ctx.save();
  ctx.rotate(-angle);
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius, 0, 2 * Math.PI);
  ctx.fillStyle = valid ? "#555" : "#888";
  ctx.fill();
  ctx.restore();

  // Draw barrel by type
  ctx.globalAlpha = valid ? 0.6 : 0.4;
  if (towerType.name === "Machine Gun") {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(towerType.radius + 12, 0);
    ctx.lineWidth = 7;
    ctx.strokeStyle = towerType.color;
    ctx.stroke();
    // Body accent
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
    // Body accent
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
    // Scope
    ctx.beginPath();
    ctx.arc(towerType.radius + 18, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.globalAlpha *= 0.6;
    ctx.fill();
  } else if (towerType.name === "Flame Tower") {
  // Barrel: cone
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

  // Draw base
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-5, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.65;
  ctx.fill();
}
else if (towerType.name === "Flak Tower") {
  // Draw two parallel barrels
  ctx.save();
  // Left barrel
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(towerType.radius + 19, -6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#aaa";
  ctx.stroke();
  ctx.restore();

  ctx.save();
  // Right barrel
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(towerType.radius + 19, 6);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#eee";
  ctx.stroke();
  ctx.restore();

  // Draw base
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-8, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.8;
  ctx.fill();
  ctx.globalAlpha = 1.0;
  // Flak radome/cap
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-14, 0, 2 * Math.PI);
  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.25;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}
else if (towerType.name === "SAM Missile") {
  // Missile tube/barrel
  ctx.save();
  ctx.beginPath();
  ctx.rect(towerType.radius-2, -7, 28, 14); // missile pod
  ctx.fillStyle = "#aaa";
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Missile tip
  ctx.save();
  ctx.beginPath();
  ctx.arc(towerType.radius+30, 0, 6, 0, 2*Math.PI);
  ctx.fillStyle = "#f33";
  ctx.globalAlpha = 1;
  ctx.fill();
  ctx.restore();

  // Base
  ctx.beginPath();
  ctx.arc(0, 0, towerType.radius-9, 0, 2 * Math.PI);
  ctx.fillStyle = towerType.color;
  ctx.globalAlpha = 0.85;
  ctx.fill();
  ctx.globalAlpha = 1.0;
}

  ctx.restore();

  // Draw outline
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, towerType.radius, 0, 2 * Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = valid ? "#fff" : "#f44";
  ctx.stroke();
  ctx.restore();

  // Draw tower name
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

function renderTowerMenu(){
    console.log('BUILD MENU');
  if (inUpgradeMenu) return;
  buildMode = false;
  buildTowerType = null;
  sideTitle.textContent = 'Towers';

  // Ensure popup exists
  if (!document.getElementById("towerPopup")) {
    const pop = document.createElement("div");
    pop.id = "towerPopup";
    pop.style.position = "absolute";
    pop.style.display = "none";
    pop.style.zIndex = 100;
    pop.style.minWidth = "220px";
    pop.style.maxWidth = "360px";
    pop.style.background = "rgba(20,32,20,0.98)";
    pop.style.border = "2px solid #6cfc91";
    pop.style.borderRadius = "10px";
    pop.style.boxShadow = "0 0 16px #32fa5077";
    pop.style.padding = "19px 18px 17px 18px";
    pop.style.color = "#fff";
    pop.style.pointerEvents = "none";
    pop.style.fontSize = "14px";
    document.body.appendChild(pop);
  }

  // Make sideContent wider and scrollable (edit width!)
  sideContent.style.maxHeight = "400px";
  sideContent.style.overflowY = "auto";
  sideContent.style.position = "relative";
  sideContent.style.width = "320px";    // wider!

  sideContent.innerHTML = TOWER_TYPES.map((t, idx) =>
    `<button class="towerBtn buildBtn"
        data-tidx="${idx}"
        data-desc="${t.desc}"
        data-cost="${t.cost}"
        data-damage="${t.damage}"
        data-range="${t.range}"
        data-fire-rate="${t.fireRate}"
        data-type="${t.fireType}"
        data-targets="${t.targets}"
        data-shot-power="${t.shotPower || 1}">
      <span class="towerName">${t.name}</span>
      <span class="towerCost" style="color:#ffd700;float:right;font-size:17px;">$${t.cost}</span>
    </button>`
  ).join('') +
  `<div style="height:52px"></div>`;  // just a spacer for the next wave button overlap

  // Wider/taller tower buttons
  document.querySelectorAll('.buildBtn').forEach(btn=>{
    btn.style.width = "98%";     // use most of the content width
    btn.style.maxWidth = "450px";
    btn.style.minWidth = "210px";
    btn.style.height = "73px";
    btn.style.margin = "0 0 14px 0";
    btn.style.justifyContent = "space-between";
    btn.style.fontSize = "20px";
    btn.style.padding = "12px 22px";
    btn.style.display = "flex";
    btn.style.flexDirection = "row";
    btn.style.alignItems = "center";
    btn.style.cursor = "pointer";
  });

  // Add all events
  document.querySelectorAll('.towerBtn').forEach(btn=>{
    btn.onclick = ()=>{
      hideTowerPopup();
      enterBuildMode(TOWER_TYPES[btn.dataset.tidx]);
    };
    btn.onmouseenter = showTowerPopup;
    btn.onmouseleave = hideTowerPopup;
    btn.onmousemove = moveTowerPopup;
  });

  removeCanvasListeners();
  canvas.addEventListener('click', onCanvasClick);
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

  // Calculate what the next upgrade provides (if not at max)
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

  // UPGRADE BUTTON: Only upgrade if not at max
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
  const pop = document.getElementById("towerPopup");
  pop.style.display = "block";
  const t = e.target.dataset;

  // You may show more stats, icons, etc. here
  pop.innerHTML = `
    <div style="font-size:20px;color:#83ffa8;font-weight:bold;margin-bottom:8px;">${t.towerName || this.querySelector('.towerName').textContent}</div>
    <div style="color:#ffd700; font-size:16px; margin-bottom:7px;">Cost: $${t.cost}</div>
    <div style="color:#aaffaa; margin-bottom:9px;">${t.desc}</div>
    <div>
      <span style="color:#ff7777;">Damage:</span> <b>${t.damage}</b><br>
      <span style="color:#ffdf97;">Range:</span> <b>${t.range}</b><br>
      <span style="color:#b2b2ff;">Fire Rate:</span> <b>${(1/parseFloat(t.fireRate)).toFixed(2)}</b> shots/sec<br>
      <span style="color:#ffaaff;">Targets:</span> <b>${formatTargets(t.targets)}</b>
</div>
  `;
  moveTowerPopup(e);
}

function hideTowerPopup(){
  const pop = document.getElementById("towerPopup");
  pop.style.display = "none";
}

function moveTowerPopup(e){
  const pop = document.getElementById("towerPopup");
  // Offset to the right/below mouse
  let x = e.clientX+18, y = e.clientY-10;
  // Prevent overflow at edge of viewport
  if (x+pop.offsetWidth > window.innerWidth-15) {
    x = window.innerWidth - pop.offsetWidth - 12;
  }
  pop.style.left = x+"px";
  pop.style.top = y+"px";
}

  function enterBuildMode(towerType){
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

  // Placement validation
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

  // Canvas listeners for build mode
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
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX-rect.left, y = e.clientY-rect.top;

  // Only allow upgrade menu if NOT in build mode
  if (!buildMode) {
    // Check if a tower was clicked
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
      return; // Stop; don't run placement logic while not in build mode
    } else if (upgradingTower) {
      // Clicked elsewhere: close upgrade menu
      upgradingTower = null;
      renderTowerMenu();
      inUpgradeMenu = false;     
      drawMap(activeMap);
      return;
    }
  }

if(buildMode && buildTowerType && isTowerPlacementValid(x, y, buildTowerType.radius)){
  if (money < buildTowerType.cost) {
    // Show quick warning visual at mouse (optional)
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
  // Deduct $ and place tower
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

  // Build a spawn queue with correct timings for each group
  let spawnQueue = [];
  for (let group of groups) {
    let time = 0;
    for (let i = 0; i < group.count; i++) {
      spawnQueue.push({ type: ENEMY_TYPES[group.type], spawnTime: time });
      time += group.spawnDelay;
    }
  }

  // Sort the queue by spawnTime so they appear in order
  spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);

  currentWaveQueue = spawnQueue;
  currentWaveQueueIdx = 0;
  waveElapsedTime = 0;
}

function startWaveCountdown() {
  waveReadyTimeRemaining = 10; // seconds
  nextWaveBtn.disabled = true;
  nextWaveBtn.textContent = `Next wave in (${Math.ceil(waveReadyTimeRemaining)})`;
}

nextWaveBtn.addEventListener('click', () => {
  if (waveReadyTimeRemaining <= 0 && activeMap) {
    spawnWave();
    startWaveCountdown();
  }
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
  // Advance real time, scaling by gameSpeed
  waveElapsedTime += (gameSpeed / 60);
  globalTime += (gameSpeed / 60);

    if (waveReadyTimeRemaining > 0) {
  // frame time = 1/60 seconds; scale by gameSpeed
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
  // Spawn enemies whose spawnTime has elapsed
  while (
    currentWaveQueue &&
    currentWaveQueueIdx < currentWaveQueue.length &&
    currentWaveQueue[currentWaveQueueIdx].spawnTime <= waveElapsedTime
  ) {
    spawnEnemy(currentWaveQueue[currentWaveQueueIdx].type);
    currentWaveQueueIdx++;
  }
    
    gameTick++;
    // Move enemies
    for (let enemy of enemies) {
      moveEnemy(enemy);
    }
    
for (const t of towers) {
  // Find first enemy in range (your targeting logic)
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

  // Only shoot if target found and cooldown is ready
if (target) {
  if (!t.lastShot) t.lastShot = 0;
  if (globalTime - t.lastShot >= t.fireRate) {
      // Shoot!
      // ----REPLACE what is below with the following:
      switch(t.fireType) {
        case "bullet":
          // single-target, normal bullet
          dmgTarget(target, t.damage, t);
          // ...existing muzzle flash code...
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
          // Flame cone: damages all ground enemies in cone
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

    // ADD THIS HERE:
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
  // Returns true if start or mapSelect is active
  const startActive = document.getElementById('startScreen').classList.contains('active');
  const selectActive = document.getElementById('mapSelect').classList.contains('active');
  return startActive || selectActive;
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
