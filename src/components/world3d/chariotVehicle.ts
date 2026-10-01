import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface ChariotControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  boost: boolean;
  horn: boolean;
}

export class ChariotVehicle {
  public mesh: THREE.Group;
  public body: CANNON.Body;
  public wheelMeshes: THREE.Mesh[] = [];
  public wheelBodies: CANNON.Body[] = [];
  public speed: number = 0;
  public steeringAngle: number = 0;
  public maxSteering: number = 0.55;
  public maxSpeed: number = 28;
  public acceleration: number = 42;
  public reverseSpeed: number = 14;
  public brakeForce: number = 30;
  public trailParticles: THREE.Points;
  private particlePositions: Float32Array;
  private particleCount: number = 80;
  private particleIndex: number = 0;

  constructor(scene: THREE.Scene, world: CANNON.World) {
    this.mesh = new THREE.Group();

    // 1. MAIN CHARIOT CHASSIS MESH (Golden Chariot of Fire)
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.8, 3.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Rich gold-amber
      roughness: 0.3,
      metalness: 0.8,
    });
    const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
    mainBody.position.y = 0.5;
    mainBody.castShadow = true;
    mainBody.receiveShadow = true;
    this.mesh.add(mainBody);

    // Chariot cabin / golden rim
    const rimGeo = new THREE.BoxGeometry(1.9, 0.6, 1.8);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.2,
      metalness: 0.9,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set(0, 0.9, -0.4);
    rimMesh.castShadow = true;
    this.mesh.add(rimMesh);

    // Front Grill & Holy Emblem
    const grillGeo = new THREE.BoxGeometry(1.2, 0.5, 0.2);
    const grillMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.9,
    });
    const grillMesh = new THREE.Mesh(grillGeo, grillMat);
    grillMesh.position.set(0, 0.5, 1.62);
    this.mesh.add(grillMesh);

    // Holy Ark / Covenant Chest on back
    const arkGeo = new THREE.BoxGeometry(1.2, 0.7, 1.0);
    const arkMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.1,
      metalness: 0.95,
    });
    const arkMesh = new THREE.Mesh(arkGeo, arkMat);
    arkMesh.position.set(0, 1.0, -0.7);
    arkMesh.castShadow = true;
    this.mesh.add(arkMesh);

    // Glowing Cherub wings on Ark
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const leftWing = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), wingMat);
    leftWing.rotation.z = Math.PI / 4;
    leftWing.rotation.x = -Math.PI / 6;
    leftWing.position.set(-0.5, 1.5, -0.7);
    this.mesh.add(leftWing);

    const rightWing = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.8, 4), wingMat);
    rightWing.rotation.z = -Math.PI / 4;
    rightWing.rotation.x = -Math.PI / 6;
    rightWing.position.set(0.5, 1.5, -0.7);
    this.mesh.add(rightWing);

    // Glowing Headlights
    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef08a,
      emissiveIntensity: 2.5,
    });
    const leftHeadlight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), lightMat);
    leftHeadlight.rotation.x = Math.PI / 2;
    leftHeadlight.position.set(-0.6, 0.5, 1.65);
    this.mesh.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.x = 0.6;
    this.mesh.add(rightHeadlight);

    // Chariot Point Light illuminating road
    const chariotLight = new THREE.PointLight(0xfef08a, 1.8, 18);
    chariotLight.position.set(0, 0.8, 2.5);
    this.mesh.add(chariotLight);

    // 2. FOUR 3D WHEELS (Ancient Spoked Golden Wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 20);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Dark rubber/bronze
      roughness: 0.7,
      metalness: 0.3,
    });
    const spokeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2,
    });

    const wheelPositions = [
      { x: -1.05, y: 0.0, z: 1.0, isFront: true },  // Front Left
      { x: 1.05, y: 0.0, z: 1.0, isFront: true },   // Front Right
      { x: -1.05, y: 0.0, z: -1.0, isFront: false }, // Rear Left
      { x: 1.05, y: 0.0, z: -1.0, isFront: false },  // Rear Right
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      wheelGroup.add(wheel);

      // Golden wheel cap / hub
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.38, 12), spokeMat);
      cap.rotation.z = Math.PI / 2;
      wheelGroup.add(cap);

      wheelGroup.position.set(pos.x, pos.y + 0.5, pos.z);
      this.mesh.add(wheelGroup);
      this.wheelMeshes.push(wheelGroup as any);
    });

    // 3. EXHAUST PARTICLE DUST / FIRE TRAIL
    const particleGeo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);
    for (let i = 0; i < this.particleCount * 3; i++) {
      this.particlePositions[i] = 0;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.35,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.trailParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(this.trailParticles);

    // 4. CANNON.JS PHYSICS BODY
    const chassisShape = new CANNON.Box(new CANNON.Vec3(0.9, 0.45, 1.6));
    this.body = new CANNON.Body({
      mass: 150,
      shape: chassisShape,
      position: new CANNON.Vec3(0, 2, 0),
      material: new CANNON.Material({ friction: 0.3, restitution: 0.1 }),
      linearDamping: 0.1,
      angularDamping: 0.4,
    });
    world.addBody(this.body);

    scene.add(this.mesh);
  }

  public update(controls: ChariotControls, delta: number) {
    // 1. Controls processing & Arcade Physics
    const euler = new THREE.Euler();
    euler.setFromQuaternion(
      new THREE.Quaternion(
        this.body.quaternion.x,
        this.body.quaternion.y,
        this.body.quaternion.z,
        this.body.quaternion.w
      ),
      'YXZ'
    );
    const yaw = euler.y;

    // Forward direction unit vector on XZ plane
    const forwardX = -Math.sin(yaw);
    const forwardZ = -Math.cos(yaw);

    // Current linear speed along forward direction
    this.speed = -(this.body.velocity.x * forwardX + this.body.velocity.z * forwardZ);

    // Steering smooth lerp
    let targetSteer = 0;
    if (controls.left) targetSteer += this.maxSteering;
    if (controls.right) targetSteer -= this.maxSteering;
    this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, targetSteer, delta * 12);

    // Acceleration & Braking forces
    const boostMultiplier = controls.boost ? 1.7 : 1.0;
    let targetSpeed = 0;

    if (controls.forward) {
      targetSpeed = this.maxSpeed * boostMultiplier;
    } else if (controls.backward) {
      targetSpeed = -this.reverseSpeed;
    }

    // Snappy velocity acceleration
    if (controls.forward || controls.backward) {
      const accelRate = delta * this.acceleration;
      const vx = forwardX * targetSpeed;
      const vz = forwardZ * targetSpeed;

      this.body.velocity.x = THREE.MathUtils.lerp(this.body.velocity.x, vx, accelRate);
      this.body.velocity.z = THREE.MathUtils.lerp(this.body.velocity.z, vz, accelRate);
    } else {
      // Natural rolling friction
      this.body.velocity.x *= 0.94;
      this.body.velocity.z *= 0.94;
    }

    if (controls.brake) {
      this.body.velocity.x *= 0.85;
      this.body.velocity.z *= 0.85;
    }

    // Turn yaw rotation
    if (Math.abs(this.steeringAngle) > 0.01) {
      const isMoving = Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.z) > 0.2;
      if (isMoving || controls.forward || controls.backward) {
        const turnSpeed = controls.backward ? -2.8 : 2.8;
        this.body.angularVelocity.y = this.steeringAngle * turnSpeed;
      }
    } else {
      this.body.angularVelocity.y *= 0.8;
    }

    // Keep vehicle upright (prevent flipping over)
    this.body.quaternion.x *= 0.9;
    this.body.quaternion.z *= 0.9;
    this.body.angularVelocity.x *= 0.85;
    this.body.angularVelocity.z *= 0.85;

    // Clamp bottom Y so car doesn't fall below ground
    if (this.body.position.y < 0.6) {
      this.body.position.y = 0.6;
      if (this.body.velocity.y < 0) this.body.velocity.y = 0;
    }

    // 2. Sync Three.js Mesh with Cannon.js Physics Body
    this.mesh.position.set(
      this.body.position.x,
      this.body.position.y - 0.2,
      this.body.position.z
    );
    this.mesh.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );

    // 3. Animate Wheels (Spin + Steer front wheels)
    const wheelRotDelta = (this.speed * delta * 2.5);
    this.wheelMeshes.forEach((wheel, idx) => {
      // Rotate around X (spinning)
      wheel.children[0].rotation.x += wheelRotDelta;
      wheel.children[1].rotation.x += wheelRotDelta;

      // Steer front wheels (indices 0 and 1)
      if (idx === 0 || idx === 1) {
        wheel.rotation.y = this.steeringAngle;
      }
    });

    // 4. Update Dust / Holy Fire Particles behind wheels
    if (Math.abs(this.speed) > 2 || controls.boost) {
      const backPos = new THREE.Vector3(0, 0.2, -1.5).applyMatrix4(this.mesh.matrixWorld);
      const pIdx = this.particleIndex * 3;
      this.particlePositions[pIdx] = backPos.x + (Math.random() - 0.5) * 0.8;
      this.particlePositions[pIdx + 1] = backPos.y + Math.random() * 0.3;
      this.particlePositions[pIdx + 2] = backPos.z + (Math.random() - 0.5) * 0.8;

      this.particleIndex = (this.particleIndex + 1) % this.particleCount;
      (this.trailParticles.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
  }

  public resetPosition(x: number = 0, y: number = 2, z: number = 0) {
    this.body.position.set(x, y, z);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.quaternion.set(0, 0, 0, 1);
  }

  public blastShockwave(world: CANNON.World) {
    // Shockwave pulse that throws physics objects away
    const chariotPos = this.body.position;
    const blastRadius = 15;
    const blastStrength = 800;

    world.bodies.forEach((otherBody) => {
      if (otherBody === this.body) return;
      const dx = otherBody.position.x - chariotPos.x;
      const dy = otherBody.position.y - chariotPos.y;
      const dz = otherBody.position.z - chariotPos.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < blastRadius && dist > 0.1 && otherBody.mass > 0) {
        const factor = (1 - dist / blastRadius) * blastStrength;
        const impulse = new CANNON.Vec3(
          (dx / dist) * factor,
          (dy / dist + 0.5) * factor * 0.8,
          (dz / dist) * factor
        );
        otherBody.applyImpulse(impulse, otherBody.position);
      }
    });
  }
}
