    const ENEMY_TYPES = [
    { name: "Infantry", hp: 30, armor: 0, speed: 30, reward: 5, color: "#5af" },
    { name: "Armored Vehicle", hp: 80, armor: 5, speed: 15, reward: 15, color: "#888" },
    { name: "Recon Bike", hp: 15, armor: 2, speed: 45, reward: 7, color: "#f5a" },
    {
    name: "Helicopter",
    hp: 75,
    armor: 4,
    speed: 37.5,
    reward: 15,
    color: "#6f6",
    flying: true,
    },
    { name: "Riot Squad", hp: 30, armor: 12, speed: 22.5, reward: 8, color: "#faa" },
    { name: "Sniper", hp: 20, armor: 0, speed: 27, reward: 10, color: "#2af" },
    { name: "Light APC", hp: 75, armor: 2, speed: 33, reward: 12, color: "#ccc" },
    { name: "Rocket Truck", hp: 200, armor: 4, speed: 18, reward: 18, color: "#f90" },
    {
    name: "Drone Swarm",
    hp: 100,
    armor: 0,
    speed: 52.5,
    reward: 6,
    color: "#6ff",
    flying: true,
    },
    {
    name: "Attack Gunship",
    hp: 500,
    armor: 10,
    speed: 30,
    reward: 25,
    color: "#3c6",
    flying: true,
    },
    {
    name: "EMP Drone",
    hp: 125,
    armor: 0,
    speed: 37.5,
    reward: 20,
    color: "#f0f",
    flying: true,
    },
    {
    name: "Siege Mech",
    hp: 1000,
    armor: 20,
    speed: 12,
    reward: 50,
    color: "#444",
    },
    
    {
    name: "Battle Tank",
    hp: 2000,
    armor: 35,
    speed: 10,
    reward: 80,
    color: "#555",
    },
    {
    name: "Jet",
    hp: 300,
    armor: 5,
    speed: 90,
    reward: 40,
    color: "#39f",
    flying: true,
    },
    {
    name: "Heavy Mech",
    hp: 5000,
    armor: 40,
    speed: 9,
    reward: 200,
    color: "#b22",
    },
    {
    name: "Project GOLIATH",
    hp: 15000,
    armor: 50,
    speed: 7,
    reward: 1000,
    color: "#ff6",
    },
    ];
function drawEnemies() {
  for (let e of enemies) {
    ctx.save();

    // Health bar helper
    function drawHealthBar(x, y, w, h, percent) {
      ctx.fillStyle = "#222";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(x, y, w * percent, h);
    }

    switch (e.type.name) {
      case "Infantry":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 8, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        drawHealthBar(e.x - 13, e.y - 19, 26, 6, e.hp / e.type.hp);
        break;
      case "Armored Vehicle":
        ctx.fillStyle = e.type.color;
        ctx.fillRect(e.x - 15, e.y - 9, 30, 18);
        // Tread marks for vehicle
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x - 12, e.y + 9); ctx.lineTo(e.x + 12, e.y + 9);
        ctx.stroke();
        drawHealthBar(e.x - 14, e.y - 20, 28, 6, e.hp / e.type.hp);
        break;
      case "Recon Bike":
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.fillStyle = e.type.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 6, 0, 0, 2 * Math.PI);
        ctx.fill();
        // Wheels
        ctx.fillStyle = "#222";
        ctx.beginPath(); ctx.arc(-6, 5, 3, 0, 2 * Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(6, 5, 3, 0, 2 * Math.PI); ctx.fill();
        ctx.restore();
        drawHealthBar(e.x - 10, e.y - 16, 20, 5, e.hp / e.type.hp);
        break;
      case "Riot Squad":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        // Riot shield
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 8, Math.PI * 1.6, Math.PI * 2.4);
        ctx.stroke();
        drawHealthBar(e.x - 12, e.y - 18, 24, 5, e.hp / e.type.hp);
        break;
      case "Sniper":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 7, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        // Rifle
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + 12, e.y - 6);
        ctx.stroke();
        drawHealthBar(e.x - 10, e.y - 15, 20, 4, e.hp / e.type.hp);
        break;
      case "Light APC":
        ctx.fillStyle = e.type.color;
        ctx.fillRect(e.x - 13, e.y - 8, 26, 16);
        // Antenna
        ctx.strokeStyle = "#888";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x + 10, e.y - 8); ctx.lineTo(e.x + 16, e.y - 18);
        ctx.stroke();
        drawHealthBar(e.x - 12, e.y - 18, 24, 5, e.hp / e.type.hp);
        break;
      case "Rocket Truck":
        ctx.fillStyle = e.type.color;
        ctx.fillRect(e.x - 14, e.y - 7, 28, 14);
        // Rocket pod
        ctx.fillStyle = "#f33";
        ctx.beginPath();
        ctx.arc(e.x + 12, e.y - 7, 4, 0, 2 * Math.PI);
        ctx.fill();
        drawHealthBar(e.x - 12, e.y - 18, 24, 5, e.hp / e.type.hp);
        break;
      case "Drone Swarm":
        // Multiple little dots
        for (let i = 0; i < 3; i++) {
          let angle = (Date.now() / 200 + i * 2) % (2 * Math.PI);
          let dx = Math.cos(angle) * 6, dy = Math.sin(angle) * 6;
          ctx.beginPath();
          ctx.arc(e.x + dx, e.y + dy, 4, 0, 2 * Math.PI);
          ctx.fillStyle = e.type.color;
          ctx.globalAlpha = 0.8;
          ctx.fill();
        }
        drawHealthBar(e.x - 8, e.y - 13, 16, 3, e.hp / e.type.hp);
        ctx.globalAlpha = 1.0;
        break;

      case "EMP Drone":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 9, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(Date.now()/500));
        ctx.fill();
        ctx.globalAlpha = 1.0;
        // EMP pulses
        ctx.save();
        ctx.beginPath();
        ctx.arc(e.x, e.y, 12 + 3*Math.abs(Math.sin(Date.now()/300)), 0, 2 * Math.PI);
        ctx.strokeStyle = "#f0f";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.restore();
        drawHealthBar(e.x - 11, e.y - 16, 22, 5, e.hp / e.type.hp);
        break;
              case "Helicopter": {
    const rot = Date.now() / 120 % (2 * Math.PI);
    ctx.translate(e.x, e.y);
    ctx.fillStyle = e.type.color;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // 4 rotor blades
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = rot + (Math.PI / 2) * i;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 16, Math.sin(angle) * 16);
      ctx.stroke();
    }

    // Tail boom
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    // Tail rotor
    ctx.save();
    ctx.translate(22, 0);
    ctx.rotate(rot * 1.8);
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(5 * Math.cos((Math.PI / 2) * i), 5 * Math.sin((Math.PI / 2) * i));
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
    drawHealthBar(e.x - 13, e.y - 20, 26, 5, e.hp / e.type.hp);
    break;
  }

  case "Attack Gunship": {
    const rot = Date.now() / 150 % (2 * Math.PI);
    ctx.translate(e.x, e.y);
    ctx.fillStyle = e.type.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Twin 4-blade rotors (8 blades total)
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    for (let side of [-14, 14]) {
      ctx.save();
      ctx.translate(side, 0);
      ctx.rotate(rot);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos((Math.PI / 2) * i) * 12, Math.sin((Math.PI / 2) * i) * 12);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
    drawHealthBar(e.x - 16, e.y - 22, 32, 6, e.hp / e.type.hp);
    break;
  }

  case "Siege Mech": {
    const walkCycle = Math.sin(Date.now() / 300);
    ctx.fillStyle = e.type.color;
    ctx.fillRect(e.x - 20, e.y - 16, 40, 30);

    // Legs
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(e.x - 14, e.y + 14);
    ctx.lineTo(e.x - 14 + walkCycle * 4, e.y + 22);
    ctx.moveTo(e.x + 14, e.y + 14);
    ctx.lineTo(e.x + 14 - walkCycle * 4, e.y + 22);
    ctx.stroke();

    // Cannon
    ctx.fillStyle = "#666";
    ctx.fillRect(e.x + 14, e.y - 6, 18, 6);

    ctx.fillStyle = "#900";
    ctx.fillRect(e.x - 8, e.y - 14, 16, 6); // cockpit
    drawHealthBar(e.x - 20, e.y - 25, 40, 6, e.hp / e.type.hp);
    break;
  }

  case "Battle Tank": {
    ctx.fillStyle = e.type.color;
    ctx.fillRect(e.x - 20, e.y - 10, 40, 20);

    // Treads
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(e.x - 20, e.y + 10);
    ctx.lineTo(e.x + 20, e.y + 10);
    ctx.stroke();

    // Turret
    ctx.fillStyle = "#777";
    ctx.beginPath();
    ctx.arc(e.x, e.y - 4, 10, 0, Math.PI * 2);
    ctx.fill();

    // Cannon
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y - 4);
    ctx.lineTo(e.x + 20, e.y - 8);
    ctx.stroke();

    drawHealthBar(e.x - 22, e.y - 24, 44, 7, e.hp / e.type.hp);
    break;
  }

  case "Jet": {
    const flame = 3 + Math.sin(Date.now() / 100) * 2;
    ctx.translate(e.x, e.y);
    ctx.rotate(Math.PI / 12);

    // Body
    ctx.fillStyle = e.type.color;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, -5);
    ctx.lineTo(15, 5);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();

    // Jet flame
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-15 - flame, -2);
    ctx.lineTo(-15 - flame, 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    drawHealthBar(e.x - 12, e.y - 18, 24, 5, e.hp / e.type.hp);
    break;
  }

  case "Heavy Mech": {
    const pulse = Math.abs(Math.sin(Date.now() / 600));
    ctx.fillStyle = "#800";
    ctx.fillRect(e.x - 25, e.y - 20, 50, 40);

    // Arms
    ctx.strokeStyle = "#b33";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(e.x - 25, e.y);
    ctx.lineTo(e.x - 40, e.y + 6);
    ctx.moveTo(e.x + 25, e.y);
    ctx.lineTo(e.x + 40, e.y - 6);
    ctx.stroke();

    // Core
    ctx.fillStyle = `rgba(255,100,100,${0.5 + pulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 6 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();

    drawHealthBar(e.x - 28, e.y - 30, 56, 8, e.hp / e.type.hp);
    break;
  }

  case "Project GOLIATH": {
    const glow = 0.4 + 0.3 * Math.sin(Date.now() / 500);
    ctx.fillStyle = "#666";
    ctx.fillRect(e.x - 35, e.y - 25, 70, 50);

    // Legs
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 8;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(e.x + i * 20, e.y + 25);
      ctx.lineTo(e.x + i * 25, e.y + 40);
      ctx.stroke();
    }

    // Core glow
    ctx.fillStyle = `rgba(255,255,100,${glow})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // Cannons
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(e.x - 35, e.y - 10);
    ctx.lineTo(e.x - 55, e.y - 14);
    ctx.moveTo(e.x + 35, e.y - 10);
    ctx.lineTo(e.x + 55, e.y - 14);
    ctx.stroke();

    drawHealthBar(e.x - 40, e.y - 38, 80, 10, e.hp / e.type.hp);
    break;
  }
            }
      }
    }



