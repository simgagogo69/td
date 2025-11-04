const ENEMY_TYPES = [
  {
    name: "Infantry",
    hp: 30,
    armor: 0,
    speed: 30,
    reward: 5,
    color: "#5af",
  },
  {
    name: "Armored Vehicle",
    hp: 80,
    armor: 5,
    speed: 15,
    reward: 15,
    color: "#888",
  },
  {
    name: "Recon Bike",
    hp: 15,
    armor: 2,
    speed: 45,
    reward: 7,
    color: "#f5a",
  },
  {
    name: "Helicopter",
    hp: 75,
    armor: 4,
    speed: 37.5,
    reward: 15,
    color: "#6f6",
    flying: true,
  },
  // NEW ENEMIES
  {
    name: "Riot Squad",
    hp: 30,
    armor: 12,
    speed: 22.5,
    reward: 8,
    color: "#faa", // infantry variant, high barricade damage
  },
  {
    name: "Sniper",
    hp: 20,
    armor: 0,
    speed: 27,
    reward: 10,
    color: "#2af", // targets towers preferentially
  },
  {
    name: "Light APC",
    hp: 75,
    armor: 2,
    speed: 33,
    reward: 12,
    color: "#ccc", // fast vehicle, low hp
  },
  {
    name: "Rocket Truck",
    hp: 200,
    armor: 4,
    speed: 18,
    reward: 18,
    color: "#f90", // deals splash to barricades/towers
  },
  {
    name: "Drone Swarm",
    hp: 100,
    armor: 0,
    speed: 52.5,
    reward: 6,
    color: "#6ff", // low hp but many, ignores barricades
    flying: true,
  },
  {
    name: "Attack Gunship",
    hp: 500,
    armor: 10,
    speed: 30,
    reward: 25,
    color: "#3c6", // slower, high HP, fires in bursts
    flying: true,
  },
  {
    name: "EMP Drone",
    hp: 125,
    armor: 0,
    speed: 37.5,
    reward: 20,
    color: "#f0f", // disables towers temporarily
    flying: true,
  },
  {
    name: "Siege Mech",
    hp: 1000,
    armor: 20,
    speed: 12,
    reward: 50,
    color: "#444", // mini-boss, plows through barricades
  }
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
      case "Helicopter":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        // Rotating rotor
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(Date.now() / 200 % (2 * Math.PI));
        ctx.strokeStyle = "#a03669";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-16, 0); ctx.lineTo(16, 0);
        ctx.stroke();
        ctx.restore();
        drawHealthBar(e.x - 13, e.y - 19, 26, 6, e.hp / e.type.hp);
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
      case "Attack Gunship":
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        // Twin rotors
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(Date.now() / 180 % (2 * Math.PI));
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-18, -4); ctx.lineTo(18, -4);
        ctx.moveTo(-18, 4); ctx.lineTo(18, 4);
        ctx.stroke();
        ctx.restore();
        drawHealthBar(e.x - 16, e.y - 22, 32, 7, e.hp / e.type.hp);
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
      case "Siege Mech":
        // Large rectangle, legs
        ctx.fillStyle = e.type.color;
        ctx.fillRect(e.x - 17, e.y - 13, 34, 26);
        // Legs
        ctx.strokeStyle = "#222";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(e.x - 12, e.y + 13); ctx.lineTo(e.x - 17, e.y + 21);
        ctx.moveTo(e.x + 12, e.y + 13); ctx.lineTo(e.x + 17, e.y + 21);
        ctx.stroke();
        drawHealthBar(e.x - 20, e.y - 24, 40, 8, e.hp / e.type.hp);
        break;
      default:
        // Fallback: colored circle
        ctx.beginPath();
        ctx.arc(e.x, e.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = e.type.color;
        ctx.fill();
        drawHealthBar(e.x - 10, e.y - 15, 20, 5, e.hp / e.type.hp);
    }
    ctx.restore();
  }
}
