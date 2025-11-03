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
        damage: 3,
        range: 100,
        fireRate: 0.18,
        shotPower: 1,      
        fireType: "bullet",
        cost: 40
      },
      {
        name: "Cannon",
        color: "#fa3",
        radius: 30,
        desc: "Slow, high damage.",
        damage: 12,
        range: 150,
        fireRate: 0.9,
        shotPower: 2,
        fireType: "bullet",
        cost: 80
      },
      {
        name: "Sniper",
        color: "#af3",
        radius: 22,
        desc: "Long range, precise.",
        damage: 24,
        range: 400,
        fireRate: 2.1,
        shotPower: 1.2,
        fireType: "bullet",
        cost: 100
      }
    ];

  // Draw the map path
  function drawMap(name){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawParticles();
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
    drawTowers();
    // If in build mode, draw preview
    if(buildMode && buildTowerType && buildPreviewPos){
      drawTowerPreview(buildPreviewPos.x, buildPreviewPos.y, buildTowerType);
    }
    // Draw enemies
    drawEnemies();
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
    let angle = target ? Math.atan2(target.y-t.y, target.x-t.x) : 0;

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
    }

    ctx.restore();

  }
}
      
function drawTowerPreview(x, y, towerType) {
  let valid = isTowerPlacementValid(x, y, towerType.radius);

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
}

function drawParticles() {
  for (let p of particles) {
    ctx.save();
    // Fade out by remaining life
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, 2 * Math.PI);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }
}

  // Tower menu
  function renderTowerMenu(){
    buildMode = false;
    buildTowerType = null;
    sideTitle.textContent = 'Towers';
    sideContent.innerHTML = TOWER_TYPES.map((t, idx)=>
      `<button class="towerBtn" data-tidx="${idx}">
        <strong>${t.name}</strong><br>
        <span style="font-size:13px;color:#aaffaa">${t.desc}</span><br>
        <span style="font-size:13px;color:#ffd700">Cost: $${t.cost}</span>
      </button>`
    ).join('');
    // Add listeners for tower buttons
    document.querySelectorAll('.towerBtn').forEach(btn=>{
      btn.onclick = ()=>{
        enterBuildMode(TOWER_TYPES[btn.dataset.tidx]);
      };
    });
    // Remove canvas listeners
    removeCanvasListeners();
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
  function onCanvasClick(e){
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX-rect.left, y = e.clientY-rect.top;
if(isTowerPlacementValid(x, y, buildTowerType.radius)){
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
    lastShot: 0
  });
  renderTowerMenu();
  drawMap(activeMap);
  updateUI();
    } else {
      ctx.save();
      ctx.globalAlpha = 0.4;
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
      target.hp -= t.damage;
      t.lastShot = globalTime;
      if (target.hp <= 0) {
        target.done = true;
        money += target.type.reward;
      }

      // --- PARTICLE BURST: Only emit here! ---
      if (t.fireType === "bullet") {
        let angle = Math.atan2(target.y - t.y, target.x - t.x);
        let barrelLength = t.radius + (t.name === "Sniper" ? 20 : t.name === "Cannon" ? 14 : 12);
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
            size: 6 + Math.random() * 5 * t.shotPower,
            life: 0.15 + Math.random() * 0.13,
            maxLife: 0.17 + Math.random() * 0.12,
            color: `rgba(255,${220+Math.floor(Math.random()*35)},${20+Math.floor(Math.random()*40)},1.0)`
          });
        }
      }
      // ---------------------------------------
    }
  }
}

    for (let i = particles.length - 1; i >= 0; i--) {
  let p = particles[i];
  p.x += p.vx;
  p.y += p.vy;
  p.life -= (gameSpeed / 60);
  if (p.life <= 0) particles.splice(i, 1);
}
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
  updateUI();
