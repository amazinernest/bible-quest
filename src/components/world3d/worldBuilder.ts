import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface HolyWaypoint {
  id: string;
  name: string;
  subtitle: string;
  position: THREE.Vector3;
  color: number;
  icon: string;
  mode: string;
  levelNumber?: number;
  stageNumber?: number;
  bossStage?: boolean;
  specialAction?: 'wheel' | 'relics' | 'codex' | 'arcade' | 'shop' | 'leaderboard';
}

export interface CoinPickup {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  collected: boolean;
  type: 'coin' | 'manna';
  value: number;
}

export interface WorldObjects {
  waypoints: HolyWaypoint[];
  coins: CoinPickup[];
  destructibleBodies: { mesh: THREE.Mesh; body: CANNON.Body }[];
  wheelMesh?: THREE.Mesh;
  update: (delta: number) => void;
}

// Create floating glowing 3D canvas billboard text
function createFloatingTextSprite(text: string, subtext: string, colorHex: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background pill
    ctx.fillStyle = 'rgba(11, 18, 36, 0.85)';
    ctx.roundRect(10, 10, 492, 140, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = colorHex;
    ctx.stroke();

    // Main Title
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 68);

    // Subtext
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = colorHex;
    ctx.fillText(subtext, 256, 112);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(10, 3.2, 1);
  return sprite;
}

export function buildBiblicalWorld(scene: THREE.Scene, world: CANNON.World): WorldObjects {
  const waypoints: HolyWaypoint[] = [];
  const coins: CoinPickup[] = [];
  const destructibleBodies: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

  // ==========================================
  // 1. GROUND PLANE & PHYSICS
  // ==========================================
  const groundGeo = new THREE.PlaneGeometry(300, 300, 32, 32);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Deep desert dusk slate
    roughness: 0.8,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Decorative sand/stone path crossroads
  const pathGeo = new THREE.PlaneGeometry(16, 260);
  const pathMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Golden sand stone path
    roughness: 0.7,
  });
  const pathX = new THREE.Mesh(pathGeo, pathMat);
  pathX.rotation.x = -Math.PI / 2;
  pathX.position.y = 0.02;
  pathX.receiveShadow = true;
  scene.add(pathX);

  const pathZ = new THREE.Mesh(new THREE.PlaneGeometry(260, 16), pathMat);
  pathZ.rotation.x = -Math.PI / 2;
  pathZ.position.y = 0.02;
  pathZ.receiveShadow = true;
  scene.add(pathZ);

  // Cannon Ground
  const groundBody = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Plane(),
    material: new CANNON.Material({ friction: 0.4, restitution: 0.1 }),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Helper for adding static boxes
  const addStaticBox = (
    w: number,
    h: number,
    d: number,
    pos: THREE.Vector3,
    color: number,
    rotY = 0,
    rotX = 0,
    rotZ = 0
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
    const body = new CANNON.Body({
      mass: 0, // static
      shape,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
    });
    body.quaternion.setFromEuler(rotX, rotY, rotZ);
    world.addBody(body);
    return mesh;
  };

  // Helper for adding destructible dynamic physics blocks
  const addDestructibleBlock = (
    w: number,
    h: number,
    d: number,
    pos: THREE.Vector3,
    color: number,
    mass = 12
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
    const body = new CANNON.Body({
      mass,
      shape,
      position: new CANNON.Vec3(pos.x, pos.y, pos.z),
      material: new CANNON.Material({ friction: 0.5, restitution: 0.2 }),
    });
    world.addBody(body);
    destructibleBodies.push({ mesh, body });
    return { mesh, body };
  };

  // ==========================================
  // 2. BIOME 1: GARDEN OF EDEN (North-East: X: +45, Z: -45)
  // ==========================================
  // Green Oasis Island
  const edenFloor = addStaticBox(45, 0.4, 45, new THREE.Vector3(45, 0.2, -45), 0x15803d);

  // Tree of Life in Center of Eden
  const trunkGeo = new THREE.CylinderGeometry(0.8, 1.2, 5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(45, 2.7, -45);
  trunk.castShadow = true;
  scene.add(trunk);

  // Glowing golden leaves
  const foliageGeo = new THREE.DodecahedronGeometry(3.5, 1);
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    emissive: 0x22c55e,
    emissiveIntensity: 0.3,
    roughness: 0.4,
  });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.set(45, 6, -45);
  foliage.castShadow = true;
  scene.add(foliage);

  // Surrounding palm trees in Eden
  const treePositions = [
    [32, -35], [58, -35], [35, -55], [55, -55], [45, -30]
  ];
  treePositions.forEach(([tx, tz]) => {
    const tMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3.5, 6), trunkMat);
    tMesh.position.set(tx, 1.95, tz);
    tMesh.castShadow = true;
    scene.add(tMesh);

    const fMesh = new THREE.Mesh(new THREE.ConeGeometry(2, 3, 5), foliageMat);
    fMesh.position.set(tx, 4.5, tz);
    fMesh.castShadow = true;
    scene.add(fMesh);
  });

  // Eden Waypoint Shrine & Sign
  const edenPos = new THREE.Vector3(45, 0.5, -36);
  waypoints.push({
    id: 'eden',
    name: 'Garden of Eden',
    subtitle: 'Creation & Tree of Life',
    position: edenPos,
    color: 0x22c55e,
    icon: '🌿',
    mode: 'who_am_i',
    levelNumber: 1,
    stageNumber: 1,
  });
  const edenSign = createFloatingTextSprite('🌿 GARDEN OF EDEN', 'Creation & Character Mystery', '#4ade80');
  edenSign.position.set(45, 6, -36);
  scene.add(edenSign);

  // Jericho Waypoint Shrine & Sign
  const jerichoPos = new THREE.Vector3(43, 0.5, 55);
  waypoints.push({
    id: 'jericho',
    name: 'Walls of Jericho',
    subtitle: 'The March of Faith & Collapsing Fortress',
    position: jerichoPos,
    color: 0xf59e0b,
    icon: '🎺',
    mode: 'blitz',
    levelNumber: 3,
    stageNumber: 8,
    bossStage: true,
  });
  const jerichoSign = createFloatingTextSprite('🎺 WALLS OF JERICHO', 'Ram Wall to Demolish • Boss Arena', '#fbbf24');
  jerichoSign.position.set(43, 8, 55);
  scene.add(jerichoSign);

  // Sinai Waypoint Shrine & Sign
  const sinaiPos = new THREE.Vector3(-45, 0.5, -15);
  waypoints.push({
    id: 'sinai',
    name: 'Mount Sinai',
    subtitle: 'The Ten Commandments & Holy Fire',
    position: sinaiPos,
    color: 0xef4444,
    icon: '📜',
    mode: 'timeline',
    levelNumber: 2,
    stageNumber: 8,
    bossStage: true,
  });
  const sinaiSign = createFloatingTextSprite('📜 MOUNT SINAI', '10 Commandments • Timeline Trial', '#f87171');
  sinaiSign.position.set(-45, 8, -15);
  scene.add(sinaiSign);

  // Red Sea Waypoint Shrine & Sign
  const redSeaPos = new THREE.Vector3(-45, 0.5, 60);
  waypoints.push({
    id: 'red_sea',
    name: 'Parting of the Red Sea',
    subtitle: 'The Great Exodus of Deliverance',
    position: redSeaPos,
    color: 0x06b6d4,
    icon: '🌊',
    mode: 'verse_match',
    levelNumber: 2,
    stageNumber: 4,
  });
  const redSeaSign = createFloatingTextSprite('🌊 PARTING OF RED SEA', 'Exodus • Verse Match Stunt Jump', '#38bdf8');
  redSeaSign.position.set(-45, 7, 60);
  scene.add(redSeaSign);

  // Solomon's Temple Shrine & Sign
  const templePos = new THREE.Vector3(0, 0.5, -55);
  waypoints.push({
    id: 'temple',
    name: 'Solomon’s Temple',
    subtitle: 'House of Wisdom & Sacred Glory',
    position: templePos,
    color: 0xeab308,
    icon: '🏛️',
    mode: 'who_said_it',
    levelNumber: 4,
    stageNumber: 8,
    bossStage: true,
  });
  const templeSign = createFloatingTextSprite('🏛️ SOLOMON’S TEMPLE', 'Wisdom Trial • Who Said It?', '#fde047');
  templeSign.position.set(0, 10, -55);
  scene.add(templeSign);

  // Goliath Shrine & Sign
  const goliathPos = new THREE.Vector3(0, 0.5, 90);
  waypoints.push({
    id: 'goliath',
    name: 'Valley of Elah',
    subtitle: 'David vs. Goliath — 5 Smooth Stones',
    position: goliathPos,
    color: 0x8b5cf6,
    icon: '⚔️',
    mode: 'bible_or_not',
    levelNumber: 4,
    stageNumber: 2,
  });
  const goliathSign = createFloatingTextSprite('⚔️ VALLEY OF ELAH', 'David vs Goliath • Bible or Not?', '#c084fc');
  goliathSign.position.set(0, 8, 90);
  scene.add(goliathSign);

  // ==========================================
  // 3D SPECIAL HUBS AROUND CENTRAL PLAZA
  // ==========================================

  // HUB 1: 3D WHEEL OF PROVIDENCE (East: X: 22, Z: 0)
  const wheelStand = addStaticBox(6, 1.5, 6, new THREE.Vector3(22, 0.75, 0), 0xd97706);
  const wheelGeo = new THREE.CylinderGeometry(3.5, 3.5, 0.4, 24);
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.4,
  });
  const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
  wheelMesh.rotation.x = Math.PI / 2;
  wheelMesh.position.set(22, 5, 0);
  scene.add(wheelMesh);

  waypoints.push({
    id: 'hub_wheel',
    name: 'Wheel of Providence',
    subtitle: 'Spin daily for holy blessings, XP & coins!',
    position: new THREE.Vector3(22, 0.5, 0),
    color: 0xf59e0b,
    icon: '🎡',
    mode: 'blitz',
    specialAction: 'wheel',
  });
  const wheelSign = createFloatingTextSprite('🎡 WHEEL OF PROVIDENCE', 'Daily Free Blessing Spin', '#fbbf24');
  wheelSign.position.set(22, 8.5, 0);
  scene.add(wheelSign);

  // HUB 2: 3D DIVINE RELICS SANCTUARY (West: X: -22, Z: 0)
  const relicsStand = addStaticBox(6, 1.5, 6, new THREE.Vector3(-22, 0.75, 0), 0x7c3aed);
  const shieldGeo = new THREE.BoxGeometry(2, 3, 0.4);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0xa855f7,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0x6b21a8,
    emissiveIntensity: 0.5,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.set(-22, 3.5, 0);
  scene.add(shieldMesh);

  waypoints.push({
    id: 'hub_relics',
    name: 'Divine Relics Sanctuary',
    subtitle: 'Consecrate and equip biblical artifacts with passive battle perks',
    position: new THREE.Vector3(-22, 0.5, 0),
    color: 0xa855f7,
    icon: '🛡️',
    mode: 'blitz',
    specialAction: 'relics',
  });
  const relicsSign = createFloatingTextSprite('🛡️ RELICS SANCTUARY', 'Equip Sacred Battle Perks', '#c084fc');
  relicsSign.position.set(-22, 7.5, 0);
  scene.add(relicsSign);

  // HUB 3: 3D SPEED RUSH GAUNTLET (South: X: 0, Z: 22)
  const rushPortalGeo = new THREE.TorusGeometry(3.5, 0.6, 16, 32);
  const rushPortalMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    metalness: 0.7,
    roughness: 0.2,
    emissive: 0xea580c,
    emissiveIntensity: 0.8,
  });
  const rushPortal = new THREE.Mesh(rushPortalGeo, rushPortalMat);
  rushPortal.position.set(0, 4, 22);
  scene.add(rushPortal);

  waypoints.push({
    id: 'hub_arcade',
    name: 'Speed Rush Gauntlet',
    subtitle: '60-second adrenaline trial! +3s correct, -5s penalty',
    position: new THREE.Vector3(0, 0.5, 22),
    color: 0xf97316,
    icon: '⚡',
    mode: 'blitz',
    specialAction: 'arcade',
  });
  const rushSign = createFloatingTextSprite('⚡ SPEED RUSH GAUNTLET', '60-Second Adrenaline Blitz', '#fb923c');
  rushSign.position.set(0, 8.5, 22);
  scene.add(rushSign);

  // HUB 4: 3D SCRIPTURE CODEX ARCHIVE (North: X: 0, Z: -22)
  const codexStand = addStaticBox(6, 1.5, 6, new THREE.Vector3(0, 0.75, -22), 0x059669);
  const bookGeo = new THREE.BoxGeometry(2.5, 0.6, 3.2);
  const bookMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0x059669,
    emissiveIntensity: 0.4,
  });
  const bookMesh = new THREE.Mesh(bookGeo, bookMat);
  bookMesh.position.set(0, 2.5, -22);
  scene.add(bookMesh);

  waypoints.push({
    id: 'hub_codex',
    name: 'Scripture Lore Codex',
    subtitle: 'Manuscripts, Greek & Hebrew roots, and archaeology facts',
    position: new THREE.Vector3(0, 0.5, -22),
    color: 0x10b981,
    icon: '📜',
    mode: 'who_said_it',
    specialAction: 'codex',
  });
  const codexSign = createFloatingTextSprite('📜 SCRIPTURE CODEX', 'Ancient Manuscripts & Archaeology', '#6ee7b7');
  codexSign.position.set(0, 6.5, -22);
  scene.add(codexSign);

  // ==========================================
  // SCATTERED COLLECTIBLE COINS & MANNA
  // ==========================================
  const coinGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xd97706,
    emissiveIntensity: 0.5,
  });

  const mannaGeo = new THREE.OctahedronGeometry(0.6, 0);
  const mannaMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.5,
    roughness: 0.1,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
  });

  // 35 Coin positions along paths and atop jump ramps
  const coinCoords = [
    [0, 1.5, 10], [0, 1.5, 15], [0, 1.5, 30], [0, 5.0, 65], [0, 1.5, 80],
    [0, 1.5, -10], [0, 1.5, -15], [0, 1.5, -30], [0, 1.5, -45],
    [10, 1.5, 0], [15, 1.5, 0], [30, 1.5, 0], [40, 1.5, 0], [50, 1.5, 0],
    [-10, 1.5, 0], [-15, 1.5, 0], [-30, 1.5, 0], [-40, 1.5, 0], [-50, 1.5, 0],
    [45, 1.5, -20], [45, 1.5, -30], [45, 1.5, -40], [45, 1.5, -50],
    [43, 3.5, 32], [43, 1.5, 40], [43, 1.5, 50],
    [-45, 3.5, -30], [-45, 6.0, -40], [-45, 9.0, -45],
    [-45, 3.5, 35], [-45, 1.5, 45], [-45, 1.5, 55],
  ];

  coinCoords.forEach(([cx, cy, cz], idx) => {
    const isManna = idx % 3 === 0;
    const mesh = new THREE.Mesh(isManna ? mannaGeo : coinGeo, isManna ? mannaMat : coinMat);
    mesh.position.set(cx, cy, cz);
    if (!isManna) mesh.rotation.x = Math.PI / 2;
    mesh.castShadow = true;
    scene.add(mesh);

    coins.push({
      mesh,
      position: new THREE.Vector3(cx, cy, cz),
      collected: false,
      type: isManna ? 'manna' : 'coin',
      value: isManna ? 50 : 25,
    });
  });

  // ==========================================
  // WAYPOINT VISUAL BEACONS (Rings + Beams)
  // ==========================================
  waypoints.forEach((wp) => {
    // Glowing ground ring
    const ringGeo = new THREE.RingGeometry(2.5, 3.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: wp.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(wp.position.x, 0.1, wp.position.z);
    scene.add(ring);

    // Glowing vertical light beam
    const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, 25, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: wp.color,
      transparent: true,
      opacity: 0.35,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(wp.position.x, 12.5, wp.position.z);
    scene.add(beam);

    // Point light
    const pLight = new THREE.PointLight(wp.color, 2.0, 15);
    pLight.position.set(wp.position.x, 3, wp.position.z);
    scene.add(pLight);
  });

  // Central Plaza Golden Portal
  const plazaGeo = new THREE.CylinderGeometry(8, 8, 0.4, 32);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.7,
    roughness: 0.2,
  });
  const plaza = new THREE.Mesh(plazaGeo, plazaMat);
  plaza.position.set(0, 0.1, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);

  const centralSign = createFloatingTextSprite('👑 CENTRAL PILGRIMAGE PLAZA', 'Explore 3D Holy Sites & Drive Around', '#f59e0b');
  centralSign.position.set(0, 5, 0);
  scene.add(centralSign);

  // Return update loop hook
  return {
    waypoints,
    coins,
    destructibleBodies,
    wheelMesh,
    update: (delta: number) => {
      // Rotate coins and manna
      coins.forEach((c) => {
        if (!c.collected) {
          c.mesh.rotation.y += delta * 2.5;
          c.mesh.position.y = c.position.y + Math.sin(Date.now() * 0.004 + c.position.x) * 0.2;
        }
      });

      // Rotate wheel mesh & portal
      if (wheelMesh) {
        wheelMesh.rotation.z += delta * 0.5;
      }
      rushPortal.rotation.z += delta * 1.2;

      // Sync destructible bodies to Three.js meshes
      destructibleBodies.forEach(({ mesh, body }) => {
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      });
    },
  };
}
