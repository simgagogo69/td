const WAVES = [
  // 1-5: Basic (Infantry, Bike, Armored)
  {groups:[{type:0,count:8,spawnDelay:1.8}]},
  {groups:[{type:0,count:10,spawnDelay:1.7},{type:2,count:2,spawnDelay:3.5}]},
  {groups:[{type:1,count:2,spawnDelay:3.8},{type:0,count:7,spawnDelay:1.7}]},
  {groups:[{type:2,count:5,spawnDelay:2.5},{type:0,count:6,spawnDelay:1.7}]},
  {groups:[{type:1,count:3,spawnDelay:3.5},{type:2,count:3,spawnDelay:2.8},{type:0,count:4,spawnDelay:1.7}]},

  // 6-10: Introduce Riot Squad, Sniper, Helicopter
  {groups:[{type:4,count:4,spawnDelay:2.2},{type:0,count:5,spawnDelay:1.5}]},
  {groups:[{type:5,count:2,spawnDelay:3.5},{type:2,count:4,spawnDelay:2.0},{type:0,count:4,spawnDelay:1.5}]},
  {groups:[{type:3,count:2,spawnDelay:5.5},{type:1,count:2,spawnDelay:3.0},{type:0,count:5,spawnDelay:1.4}]},
  {groups:[{type:3,count:3,spawnDelay:4.5},{type:4,count:3,spawnDelay:2.2},{type:2,count:4,spawnDelay:1.7}]},
  {groups:[{type:5,count:3,spawnDelay:3.2},{type:1,count:3,spawnDelay:2.8},{type:3,count:2,spawnDelay:5.0}]},

  // 11-15: Light APC, Rocket Truck, more mix
  {groups:[{type:6,count:3,spawnDelay:4.0},{type:0,count:5,spawnDelay:1.7}]},
  {groups:[{type:7,count:2,spawnDelay:7.0},{type:6,count:2,spawnDelay:3.8},{type:2,count:4,spawnDelay:1.5}]},
  {groups:[{type:7,count:3,spawnDelay:5.2},{type:1,count:2,spawnDelay:2.5},{type:4,count:2,spawnDelay:1.9}]},
  {groups:[{type:4,count:4,spawnDelay:2.2},{type:3,count:2,spawnDelay:4.5},{type:6,count:2,spawnDelay:3.0}]},
  {groups:[{type:5,count:4,spawnDelay:2.9},{type:2,count:6,spawnDelay:1.2},{type:0,count:6,spawnDelay:1.2}]},

  // 16-20: Drone Swarm, Attack Gunship, EMP Drone
  {groups:[{type:8,count:10,spawnDelay:0.9},{type:0,count:5,spawnDelay:1.7}]},
  {groups:[{type:9,count:1,spawnDelay:12},{type:3,count:2,spawnDelay:6.0},{type:8,count:8,spawnDelay:1.2}]},
  {groups:[{type:10,count:2,spawnDelay:6.5},{type:1,count:3,spawnDelay:3.9},{type:6,count:2,spawnDelay:3.7}]},
  {groups:[{type:8,count:12,spawnDelay:1.0},{type:4,count:3,spawnDelay:2.0},{type:2,count:6,spawnDelay:1.5}]},
  {groups:[{type:9,count:2,spawnDelay:11},{type:10,count:2,spawnDelay:6.5},{type:3,count:2,spawnDelay:4.5}]},

  // 21-25: More complex mixes and increased numbers
  {groups:[{type:4,count:5,spawnDelay:2.2},{type:8,count:10,spawnDelay:0.9},{type:6,count:3,spawnDelay:3.1}]},
  {groups:[{type:3,count:2,spawnDelay:5.5},{type:5,count:3,spawnDelay:3.2},{type:0,count:7,spawnDelay:1.4}]},
  {groups:[{type:7,count:3,spawnDelay:5.2},{type:1,count:3,spawnDelay:3.9},{type:8,count:14,spawnDelay:0.8}]},
  {groups:[{type:2,count:8,spawnDelay:1.3},{type:10,count:3,spawnDelay:4.5},{type:9,count:1,spawnDelay:9.5}]},
  {groups:[{type:6,count:4,spawnDelay:2.9},{type:4,count:4,spawnDelay:1.5},{type:3,count:3,spawnDelay:4.0}]},

  // 26-30: Rocket Trucks & Drones, higher mix
  {groups:[{type:7,count:4,spawnDelay:4},{type:8,count:16,spawnDelay:0.7},{type:5,count:2,spawnDelay:3.5}]},
  {groups:[{type:9,count:2,spawnDelay:9},{type:3,count:2,spawnDelay:3.5},{type:1,count:5,spawnDelay:2.1}]},
  {groups:[{type:10,count:3,spawnDelay:9},{type:6,count:3,spawnDelay:3.8},{type:4,count:5,spawnDelay:1.7}]},
  {groups:[{type:8,count:18,spawnDelay:6},{type:2,count:9,spawnDelay:1.1},{type:5,count:3,spawnDelay:2.7}]},
  {groups:[{type:11,count:1,spawnDelay:0.5},{type:9,count:1,spawnDelay:11},{type:3,count:4,spawnDelay:3.2}]},

  // 31-35: Bosses and swarms ramp up
  {groups:[{type:11,count:1,spawnDelay:0.5},{type:8,count:20,spawnDelay:0.6},{type:6,count:5,spawnDelay:2.4}]},
  {groups:[{type:9,count:2,spawnDelay:9.5},{type:10,count:3,spawnDelay:5.2},{type:1,count:6,spawnDelay:1.4}]},
  {groups:[{type:3,count:5,spawnDelay:3.2},{type:4,count:6,spawnDelay:1.2},{type:2,count:10,spawnDelay:1}]},
  {groups:[{type:7,count:5,spawnDelay:3.6},{type:8,count:22,spawnDelay:0.5},{type:5,count:5,spawnDelay:1.9}]},
  {groups:[{type:9,count:3,spawnDelay:10},{type:10,count:3,spawnDelay:6},{type:11,count:1,spawnDelay:0.5}]},

  // 36-40: Mix of all with Siege Mech
  {groups:[{type:11,count:1,spawnDelay:0.5},{type:3,count:5,spawnDelay:2.8},{type:1,count:7,spawnDelay:0.8}]},
  {groups:[{type:8,count:24,spawnDelay:0.4},{type:2,count:11,spawnDelay:0.8},{type:5,count:6,spawnDelay:1.8}]},
  {groups:[{type:7,count:6,spawnDelay:3.2},{type:6,count:6,spawnDelay:2.2},{type:4,count:6,spawnDelay:1.2}]},
  {groups:[{type:9,count:4,spawnDelay:8},{type:10,count:4,spawnDelay:4.8},{type:11,count:2,spawnDelay:0.5}]},
  {groups:[{type:11,count:2,spawnDelay:0.5},{type:8,count:26,spawnDelay:0.3},{type:3,count:6,spawnDelay:2.2}]},

  // 41-45: Swarm + Boss + Everything
  {groups:[{type:11,count:2,spawnDelay:0.5},{type:7,count:7,spawnDelay:2.7},{type:9,count:3,spawnDelay:7}]},
  {groups:[{type:10,count:5,spawnDelay:3.8},{type:8,count:28,spawnDelay:0.2},{type:4,count:7,spawnDelay:1.1}]},
  {groups:[{type:6,count:8,spawnDelay:1.8},{type:2,count:13,spawnDelay:0.6},{type:3,count:7,spawnDelay:1.8}]},
  {groups:[{type:1,count:9,spawnDelay:0.6},{type:5,count:7,spawnDelay:1.4},{type:8,count:30,spawnDelay:0.2}]},
  {groups:[{type:11,count:3,spawnDelay:0.5},{type:9,count:4,spawnDelay:6},{type:10,count:6,spawnDelay:3.5}]},

  // 46-50: Final challenge waves
  {groups:[{type:11,count:4,spawnDelay:0.5},{type:8,count:34,spawnDelay:0.1},{type:7,count:10,spawnDelay:1.2}]},
  {groups:[{type:9,count:5,spawnDelay:5},{type:3,count:8,spawnDelay:1.6},{type:1,count:12,spawnDelay:0.4}]},
  {groups:[{type:10,count:8,spawnDelay:2},{type:4,count:10,spawnDelay:0.7},{type:6,count:12,spawnDelay:0.7}]},
  {groups:[{type:11,count:5,spawnDelay:0.5},{type:9,count:7,spawnDelay:3.5},{type:8,count:36,spawnDelay:0.1}]},
  {groups:[{type:11,count:6,spawnDelay:0.5},{type:10,count:10,spawnDelay:1.8},{type:8,count:40,spawnDelay:0.1}]}
];