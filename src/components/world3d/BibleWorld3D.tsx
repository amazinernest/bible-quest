'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ChariotVehicle, ChariotControls } from './chariotVehicle';
import { buildBiblicalWorld, HolyWaypoint, WorldObjects } from './worldBuilder';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import InteractiveWaypointModal from './InteractiveWaypointModal';
import {
  Compass,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Shield,
  Layers,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameMode } from '@/types/game';

interface BibleWorld3DProps {
  onStartMode: (mode: GameMode) => void;
  onStartStage: (level: number, stage: number, isBoss: boolean) => void;
  onSwitchTo2D: () => void;
}

export default function BibleWorld3D({ onStartMode, onStartStage, onSwitchTo2D }: BibleWorld3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { profile, updateProfile } = useGame();

  const [speedMph, setSpeedMph] = useState<number>(0);
  const [coinsCollectedCount, setCoinsCollectedCount] = useState<number>(0);
  const [activeWaypoint, setActiveWaypoint] = useState<HolyWaypoint | null>(null);
  const [nearbyWaypoint, setNearbyWaypoint] = useState<HolyWaypoint | null>(null);
  const [controlsState, setControlsState] = useState<ChariotControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    boost: false,
    horn: false,
  });

  const controlsRef = useRef<ChariotControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    boost: false,
    horn: false,
  });

  // Keep ref synced
  useEffect(() => {
    controlsRef.current = controlsState;
  }, [controlsState]);

  const chariotRef = useRef<ChariotVehicle | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. THREE.JS SCENE & RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.009);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(0, 30, -35);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 2. LIGHTING & ATMOSPHERE
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x78350f, 0.6);
    scene.add(hemiLight);

    // Golden Sun Directional Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    sunLight.position.set(60, 90, 60);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    const d = 90;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 3. CANNON-ES PHYSICS WORLD
    const physicsWorld = new CANNON.World();
    physicsWorld.gravity.set(0, -22, 0); // Crisp game gravity
    worldRef.current = physicsWorld;

    // 4. BUILD BIBLICAL WORLD OBJECTS
    const worldObjects: WorldObjects = buildBiblicalWorld(scene, physicsWorld);

    // 5. SPAWN CHARIOT OF FIRE VEHICLE
    const chariot = new ChariotVehicle(scene, physicsWorld);
    chariotRef.current = chariot;

    // 6. KEYBOARD EVENT LISTENERS
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') controlsRef.current.forward = true;
      if (k === 's' || k === 'arrowdown') controlsRef.current.backward = true;
      if (k === 'a' || k === 'arrowleft') controlsRef.current.left = true;
      if (k === 'd' || k === 'arrowright') controlsRef.current.right = true;
      if (k === ' ') controlsRef.current.brake = true;
      if (k === 'shift') controlsRef.current.boost = true;
      if (k === 'b' || k === 'h') {
        audioEngine.playLevelComplete();
        chariot.blastShockwave(physicsWorld);
      }
      if (k === 'r') {
        chariot.resetPosition(0, 2, 0);
      }
      if (k === 'enter' && nearbyWaypoint) {
        setActiveWaypoint(nearbyWaypoint);
      }
      setControlsState({ ...controlsRef.current });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') controlsRef.current.forward = false;
      if (k === 's' || k === 'arrowdown') controlsRef.current.backward = false;
      if (k === 'a' || k === 'arrowleft') controlsRef.current.left = false;
      if (k === 'd' || k === 'arrowright') controlsRef.current.right = false;
      if (k === ' ') controlsRef.current.brake = false;
      if (k === 'shift') controlsRef.current.boost = false;
      setControlsState({ ...controlsRef.current });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 7. RESIZE LISTENER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. GAME LOOP
    let lastTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Physics step (fixed 60Hz)
      physicsWorld.step(1 / 60, delta, 3);

      // Chariot update
      chariot.update(controlsRef.current, delta);
      setSpeedMph(Math.round(Math.abs(chariot.speed) * 2.2));

      // World objects update (rotating coins, syncing destructibles)
      worldObjects.update(delta);

      // Smooth Isometric Following Camera
      const chariotPos = chariot.mesh.position;
      const targetCamPos = new THREE.Vector3(
        chariotPos.x,
        chariotPos.y + 22,
        chariotPos.z - 28
      );
      camera.position.lerp(targetCamPos, delta * 4);
      camera.lookAt(chariotPos.x, chariotPos.y + 1, chariotPos.z + 5);

      // Check Coin Pickups
      worldObjects.coins.forEach((c) => {
        if (!c.collected) {
          const dist = chariotPos.distanceTo(c.position);
          if (dist < 2.5) {
            c.collected = true;
            scene.remove(c.mesh);
            audioEngine.playWheelTick();
            setCoinsCollectedCount((prev) => prev + 1);

            // Update real player profile wisdom coins!
            updateProfile({
              wisdomCoins: profile.wisdomCoins + c.value,
            });
          }
        }
      });

      // Check Waypoint Proximity
      let foundNearby: HolyWaypoint | null = null;
      worldObjects.waypoints.forEach((wp) => {
        const dist = chariotPos.distanceTo(wp.position);
        if (dist < 6.0) {
          foundNearby = wp;
        }
      });
      setNearbyWaypoint(foundNearby);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleEnterChallenge = (wp: HolyWaypoint) => {
    setActiveWaypoint(null);
    if (wp.levelNumber && wp.stageNumber) {
      onStartStage(wp.levelNumber, wp.stageNumber, !!wp.bossStage);
    } else {
      onStartMode(wp.mode as GameMode);
    }
  };

  const handleResetCar = () => {
    chariotRef.current?.resetPosition(0, 2, 0);
  };

  const handleBlastHorn = () => {
    if (worldRef.current && chariotRef.current) {
      audioEngine.playLevelComplete();
      chariotRef.current.blastShockwave(worldRef.current);
    }
  };

  return (
    <div className="relative w-full h-[88vh] sm:h-[92vh] overflow-hidden bg-slate-950 select-none">
      {/* 3D WEBGL CANVAS CONTAINER */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HUD BAR */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {/* BRAND & SPEEDOMETER */}
        <div className="flex items-center gap-3 bg-[#0B1224]/85 backdrop-blur-md border border-amber-500/40 p-2.5 px-4 rounded-2xl shadow-xl pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-md">
            🔥
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">
              Chariot of Fire
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-mono font-black text-white">{speedMph}</span>
              <span className="text-[10px] font-bold text-slate-400">MPH</span>
            </div>
          </div>
        </div>

        {/* COIN COUNTER & TOGGLE TO 2D VIEW */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-[#0B1224]/85 backdrop-blur-md border border-amber-500/40 p-2 px-3.5 rounded-2xl shadow-xl">
            <span className="text-sm">🪙</span>
            <span className="text-xs font-black text-amber-300">
              {profile.wisdomCoins.toLocaleString()}
            </span>
            {coinsCollectedCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-400">
                (+{coinsCollectedCount})
              </span>
            )}
          </div>

          <button
            onClick={onSwitchTo2D}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">2D Mode</span>
          </button>
        </div>
      </div>

      {/* NEARBY SACRED WAYPOINT PROMPT POPUP */}
      {nearbyWaypoint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-bounce pointer-events-auto">
          <button
            onClick={() => setActiveWaypoint(nearbyWaypoint)}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl border-2 border-yellow-200 flex items-center gap-2 hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>ENTER {nearbyWaypoint.name.toUpperCase()} (PRESS ENTER)</span>
          </button>
        </div>
      )}

      {/* CONTROLS HINT (DESKTOP) */}
      <div className="hidden md:flex absolute bottom-4 left-4 bg-[#0B1224]/85 backdrop-blur-md border border-slate-800 p-3 rounded-2xl text-[11px] text-slate-300 gap-4 pointer-events-none z-10">
        <div>
          <span className="font-bold text-amber-400 uppercase block">Drive:</span>
          <span>W, A, S, D or Arrows</span>
        </div>
        <div>
          <span className="font-bold text-amber-400 uppercase block">Brake:</span>
          <span>SPACE</span>
        </div>
        <div>
          <span className="font-bold text-amber-400 uppercase block">Boost:</span>
          <span>SHIFT</span>
        </div>
        <div>
          <span className="font-bold text-amber-400 uppercase block">Horn Shockwave:</span>
          <span>B</span>
        </div>
        <div>
          <span className="font-bold text-amber-400 uppercase block">Reset:</span>
          <span>R</span>
        </div>
      </div>

      {/* MOBILE TOUCH CONTROLS OVERLAY */}
      <div className="md:hidden absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-auto z-10">
        {/* D-PAD / STEERING BUTTONS */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            onTouchStart={() => (controlsRef.current.forward = true)}
            onTouchEnd={() => (controlsRef.current.forward = false)}
            onMouseDown={() => (controlsRef.current.forward = true)}
            onMouseUp={() => (controlsRef.current.forward = false)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />

          <button
            onTouchStart={() => (controlsRef.current.left = true)}
            onTouchEnd={() => (controlsRef.current.left = false)}
            onMouseDown={() => (controlsRef.current.left = true)}
            onMouseUp={() => (controlsRef.current.left = false)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onTouchStart={() => (controlsRef.current.backward = true)}
            onTouchEnd={() => (controlsRef.current.backward = false)}
            onMouseDown={() => (controlsRef.current.backward = true)}
            onMouseUp={() => (controlsRef.current.backward = false)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white"
          >
            <ArrowDown className="w-5 h-5" />
          </button>

          <button
            onTouchStart={() => (controlsRef.current.right = true)}
            onTouchEnd={() => (controlsRef.current.right = false)}
            onMouseDown={() => (controlsRef.current.right = true)}
            onMouseUp={() => (controlsRef.current.right = false)}
            className="w-11 h-11 rounded-xl bg-slate-900/90 active:bg-amber-500 border border-slate-700 flex items-center justify-center text-white"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* ACTION BUTTONS (Boost, Brake, Horn, Reset) */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleBlastHorn}
              className="p-3 rounded-xl bg-purple-900/80 active:bg-purple-600 border border-purple-500 text-purple-200 text-xs font-bold"
            >
              🎺 Blast
            </button>
            <button
              onClick={handleResetCar}
              className="p-3 rounded-xl bg-slate-800 active:bg-slate-700 border border-slate-700 text-slate-300"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onTouchStart={() => (controlsRef.current.brake = true)}
              onTouchEnd={() => (controlsRef.current.brake = false)}
              onMouseDown={() => (controlsRef.current.brake = true)}
              onMouseUp={() => (controlsRef.current.brake = false)}
              className="py-3 px-4 rounded-xl bg-red-950/80 active:bg-red-600 border border-red-500 text-red-300 font-bold text-xs"
            >
              🛑 BRAKE
            </button>

            <button
              onTouchStart={() => (controlsRef.current.boost = true)}
              onTouchEnd={() => (controlsRef.current.boost = false)}
              onMouseDown={() => (controlsRef.current.boost = true)}
              onMouseUp={() => (controlsRef.current.boost = false)}
              className="py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg"
            >
              ⚡ BOOST
            </button>
          </div>
        </div>
      </div>

      {/* SACRED WAYPOINT INTERACTIVE MODAL */}
      <InteractiveWaypointModal
        waypoint={activeWaypoint}
        onClose={() => setActiveWaypoint(null)}
        onEnterChallenge={handleEnterChallenge}
      />
    </div>
  );
}
