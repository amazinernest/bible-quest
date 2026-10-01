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
  update: (delta: number) => void;
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

  // Eden Waypoint Shrine
  waypoints.push({
    id: 'eden',
    name: 'Garden of Eden',
    subtitle: 'Creation & The Tree of Life',
    position: new THREE.Vector3(45, 0.5, -36),
    color: 0x22c55e,
    icon: '🌿',
    mode: 'who_am_i',
    levelNumber: 1,
    stageNumber: 1,
  });

  // ==========================================
  // 3. BIOME 2: WALLS OF JERICHO (South-East: X: +45, Z: +45)
  // ==========================================
  // Destructible brick fortress you can ram!
  for (let layer = 0; layer < 4; layer++) {
    for (let col = 0; col < 6; col++) {
      const bx = 38 + col * 2.2;
      const by = 0.6 + layer * 1.1;
      const bz = 45;
      addDestructibleBlock(2.0, 1.0, 1.2, new THREE.Vector3(bx, by, bz), 0xd97706, 15);
    }
  }

  // Jericho Jump Ramp leading toward the wall!
  addStaticBox(8, 2.5, 12, new THREE.Vector3(43, 0.8, 28), 0xb45309, 0, -Math.PI / 10, 0);

  // Jericho Waypoint Shrine
  waypoints.push({
    id: 'jericho',
    name: 'Walls of Jericho',
    subtitle: 'The March of Faith & Collapsing Fortress',
    position: new THREE.Vector3(43, 0.5, 55),
    color: 0xf59e0b,
    icon: '🎺',
    mode: 'blitz',
    levelNumber: 3,
    stageNumber: 8,
    bossStage: true,
  });

  // ==========================================
  // 4. BIOME 3: MOUNT SINAI & 10 COMMANDMENTS (North-West: X: -45, Z: -45)
  // ==========================================
  // Terraced Mountain Slopes
  addStaticBox(35, 3, 35, new THREE.Vector3(-45, 1.5, -45), 0x78350f);
  addStaticBox(25, 3, 25, new THREE.Vector3(-45, 4.5, -45), 0x92400e);
  addStaticBox(15, 3, 15, new THREE.Vector3(-45, 7.5, -45), 0xb45309);

  // Mountain Ascent Ramp
  addStaticBox(7, 4, 24, new THREE.Vector3(-45, 2.0, -26), 0x92400e, 0, -Math.PI / 8, 0);

  // Giant Stone Tablets of Law atop Sinai
  const tabletMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.3,
    metalness: 0.2,
  });
  const tabletLeft = new THREE.Mesh(new THREE.BoxGeometry(2, 3.5, 0.6), tabletMat);
  tabletLeft.position.set(-46.5, 10.5, -45);
  tabletLeft.castShadow = true;
  scene.add(tabletLeft);

  const tabletRight = tabletLeft.clone();
  tabletRight.position.x = -43.5;
  scene.add(tabletRight);

  // Sinai Waypoint Shrine
  waypoints.push({
    id: 'sinai',
    name: 'Mount Sinai',
    subtitle: 'The Ten Commandments & Holy Fire',
    position: new THREE.Vector3(-45, 0.5, -15),
    color: 0xef4444,
    icon: '📜',
    mode: 'timeline',
    levelNumber: 2,
    stageNumber: 8,
    bossStage: true,
  });

  // ==========================================
  // 5. BIOME 4: RED SEA CANYON (South-West: X: -45, Z: +45)
  // ==========================================
  // Parted Water Walls (Translucent Blue)
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.75,
  });
  const leftWater = new THREE.Mesh(new THREE.BoxGeometry(5, 8, 40), waterMat);
  leftWater.position.set(-52, 4, 45);
  scene.add(leftWater);

  const rightWater = new THREE.Mesh(new THREE.BoxGeometry(5, 8, 40), waterMat);
  rightWater.position.set(-38, 4, 45);
  scene.add(rightWater);

  // Dry Seabed Road & Stunt Launch Ramp
  addStaticBox(7, 3, 10, new THREE.Vector3(-45, 1.2, 32), 0x0ea5e9, 0, -Math.PI / 7, 0);

  // Red Sea Waypoint Shrine
  waypoints.push({
    id: 'red_sea',
    name: 'Parting of the Red Sea',
    subtitle: 'The Great Exodus of Deliverance',
    position: new THREE.Vector3(-45, 0.5, 60),
    color: 0x06b6d4,
    icon: '🌊',
    mode: 'verse_match',
    levelNumber: 2,
    stageNumber: 4,
  });

  // ==========================================
  // 6. BIOME 5: SOLOMON’S GOLDEN TEMPLE (Far North: X: 0, Z: -75)
  // ==========================================
  // Grand Temple Foundation
  addStaticBox(36, 2, 28, new THREE.Vector3(0, 1, -75), 0xf59e0b);
  // Temple Roof
  addStaticBox(32, 2, 24, new THREE.Vector3(0, 7.5, -75), 0xfbbf24);

  // Golden Columns (Jachin & Boaz)
  const colMat = new THREE.MeshStandardMaterial({ color: 0xfde047, metalness: 0.8, roughness: 0.2 });
  const colPositions = [
    [-12, -65], [-6, -65], [6, -65], [12, -65],
    [-12, -85], [-6, -85], [6, -85], [12, -85],
  ];
  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 6, 16), colMat);
    col.position.set(cx, 4.5, cz);
    col.castShadow = true;
    scene.add(col);
  });

  // Solomon's Temple Shrine
  waypoints.push({
    id: 'temple',
    name: 'Solomon’s Temple',
    subtitle: 'House of Wisdom & Sacred Glory',
    position: new THREE.Vector3(0, 0.5, -55),
    color: 0xeab308,
    icon: '🏛️',
    mode: 'who_said_it',
    levelNumber: 4,
    stageNumber: 8,
    bossStage: true,
  });

  // ==========================================
  // 7. BIOME 6: VALLEY OF ELAH / GOLIATH’S STUNT ARENA (Far South: X: 0, Z: +75)
  // ==========================================
  // Giant toppleable stone obelisks & mega stunt ramps
  for (let i = 0; i < 6; i++) {
    const ox = (i - 2.5) * 6;
    const oz = 75 + (i % 2) * 6;
    addDestructibleBlock(1.8, 6.0, 1.8, new THREE.Vector3(ox, 3, oz), 0x64748b, 40);
  }

  // Mega Stunt Jump Ramp!
  addStaticBox(12, 4.5, 14, new THREE.Vector3(0, 2.0, 60), 0xd97706, 0, -Math.PI / 6, 0);

  // Goliath Shrine
  waypoints.push({
    id: 'goliath',
    name: 'Valley of Elah',
    subtitle: 'David vs. Goliath — 5 Smooth Stones',
    position: new THREE.Vector3(0, 0.5, 90),
    color: 0x8b5cf6,
    icon: '⚔️',
    mode: 'bible_or_not',
    levelNumber: 4,
    stageNumber: 2,
  });

  // ==========================================
  // 8. SCATTERED COLLECTIBLE COINS & MANNA
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
    [0, 1.5, 10], [0, 1.5, 20], [0, 1.5, 30], [0, 5.0, 65], [0, 1.5, 80],
    [0, 1.5, -10], [0, 1.5, -20], [0, 1.5, -30], [0, 1.5, -45],
    [10, 1.5, 0], [20, 1.5, 0], [30, 1.5, 0], [40, 1.5, 0], [50, 1.5, 0],
    [-10, 1.5, 0], [-20, 1.5, 0], [-30, 1.5, 0], [-40, 1.5, 0], [-50, 1.5, 0],
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
  // 9. WAYPOINT VISUAL BEACONS (Rings + Beams)
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

  // Return update loop hook
  return {
    waypoints,
    coins,
    destructibleBodies,
    update: (delta: number) => {
      // Rotate coins and manna
      coins.forEach((c) => {
        if (!c.collected) {
          c.mesh.rotation.y += delta * 2.5;
          c.mesh.position.y = c.position.y + Math.sin(Date.now() * 0.004 + c.position.x) * 0.2;
        }
      });

      // Sync destructible bodies to Three.js meshes
      destructibleBodies.forEach(({ mesh, body }) => {
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);
      });
    },
  };
}
