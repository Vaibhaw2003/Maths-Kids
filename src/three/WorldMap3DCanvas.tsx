import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WORLDS_CATALOG, WorldId } from '../types/game';
import {
  Shared3DResources,
  buildAppleTree,
  buildMathRobot,
  buildRaceCar,
  buildRocket,
  buildStarTrophy,
  buildToyTrain,
} from './modelBuilders';
import {
  createBrushedGrainTexture,
  createContactShadowTexture,
} from './proceduralTextures';

interface WorldMap3DCanvasProps {
  selectedWorldId: WorldId;
  unlockedWorlds: WorldId[];
  onSelectWorld: (worldId: WorldId) => void;
}

const ISLAND_COORDS: Record<WorldId, [number, number, number]> = {
  fruit_island: [-6.4, 0, 2.2],
  robot_city: [-2.4, 0, -2.5],
  racing_valley: [2.2, 0, 2.4],
  space_galaxy: [6.2, 0.35, -2.2],
  animal_kingdom: [-3.0, 0, 5.4],
  treasure_island: [4.8, 0.2, 4.9],
};

export const WorldMap3DCanvas: React.FC<WorldMap3DCanvasProps> = ({
  selectedWorldId,
  unlockedWorlds,
  onSelectWorld,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<WorldId>(selectedWorldId);
  const unlockedRef = useRef<WorldId[]>(unlockedWorlds);
  const onSelectRef = useRef(onSelectWorld);

  selectedRef.current = selectedWorldId;
  unlockedRef.current = unlockedWorlds;
  onSelectRef.current = onSelectWorld;

  const targetGlideRef = useRef<THREE.Vector3 | null>(null);
  const ringsMapRef = useRef<Map<WorldId, THREE.Mesh>>(new Map());
  const lockMarkersMapRef = useRef<Map<WorldId, THREE.Group>>(new Map());

  useEffect(() => {
    const coords = ISLAND_COORDS[selectedWorldId];
    if (coords) {
      targetGlideRef.current = new THREE.Vector3(coords[0], 0.4, coords[2]);
    }
    ringsMapRef.current.forEach((ring, id) => {
      const mat = ring.material as THREE.MeshStandardMaterial;
      const isSelected = id === selectedWorldId;
      mat.emissiveIntensity = isSelected ? 0.95 : 0.22;
      mat.opacity = isSelected ? 1 : 0.55;
      ring.scale.setScalar(isSelected ? 1.1 : 0.96);
    });
  }, [selectedWorldId]);

  useEffect(() => {
    lockMarkersMapRef.current.forEach((lockGrp, id) => {
      lockGrp.visible = !unlockedRef.current.includes(id);
    });
  }, [unlockedWorlds]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(280, container.clientWidth || 640);
    const height = Math.max(240, container.clientHeight || 340);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    const isSoftwareGl =
      typeof navigator !== 'undefined' &&
      /SwiftShader|llvmpipe|Software/i.test(navigator.userAgent);
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
    );
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x52c4ff);
    scene.fog = new THREE.Fog(0x52c4ff, 22, 46);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(0, 10.5, 14.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 7;
    controls.maxDistance = 24;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.3;
    const initCoords = ISLAND_COORDS[selectedRef.current] || [0, 0, 1];
    controls.target.set(initCoords[0] * 0.4, 0.3, initCoords[2] * 0.4);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x1693c9, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff7dd, 1.45);
    sun.position.set(9, 14, 8);
    if (!isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -12;
      sun.shadow.camera.right = 12;
      sun.shadow.camera.top = 12;
      sun.shadow.camera.bottom = -12;
    }
    scene.add(sun);

    const res: Shared3DResources = {
      geometries: [],
      materials: [],
      shadowTexture: createContactShadowTexture(),
      bumpTexture: createBrushedGrainTexture(renderer.capabilities.getMaxAnisotropy()),
    };

    // Bright turquoise adventure ocean
    const oceanGeo = new THREE.CircleGeometry(32, 48);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x1ca7ec,
      roughness: 0.32,
      metalness: 0.08,
    });
    res.geometries.push(oceanGeo);
    res.materials.push(oceanMat);
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = -0.32;
    ocean.receiveShadow = true;
    scene.add(ocean);

    // Dotted stepping stones connecting worlds along the sea
    const dotGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.08, 12);
    const dotMat = new THREE.MeshStandardMaterial({
      color: 0xffd43b,
      emissive: 0xffd43b,
      emissiveIntensity: 0.25,
      roughness: 0.4,
    });
    res.geometries.push(dotGeo);
    res.materials.push(dotMat);
    for (let i = 0; i < WORLDS_CATALOG.length - 1; i++) {
      const a = ISLAND_COORDS[WORLDS_CATALOG[i].id];
      const b = ISLAND_COORDS[WORLDS_CATALOG[i + 1].id];
      for (let step = 1; step <= 4; step++) {
        const t = step / 5;
        const dot = new THREE.Mesh(dotGeo, dotMat);
        dot.position.set(
          THREE.MathUtils.lerp(a[0], b[0], t),
          -0.25,
          THREE.MathUtils.lerp(a[2], b[2], t)
        );
        scene.add(dot);
      }
    }

    const islandHitTargets: THREE.Object3D[] = [];
    const islandGroups: THREE.Group[] = [];
    ringsMapRef.current.clear();
    lockMarkersMapRef.current.clear();

    const islandTopColors: Record<WorldId, number> = {
      fruit_island: 0x43e890,
      robot_city: 0x7c3aed,
      racing_valley: 0xff963c,
      space_galaxy: 0x287bff,
      animal_kingdom: 0x35d982,
      treasure_island: 0xffd43b,
    };

    WORLDS_CATALOG.forEach((world, idx) => {
      const [ix, iy, iz] = ISLAND_COORDS[world.id];
      const grp = new THREE.Group();
      grp.position.set(ix, iy, iz);
      grp.userData.worldId = world.id;
      grp.userData.baseY = iy;
      grp.userData.phase = idx * 0.9;

      // Sandy beach rim
      const beachGeo = new THREE.CylinderGeometry(2.15, 2.35, 0.28, 28);
      const beachMat = new THREE.MeshStandardMaterial({
        color: 0xfbe094,
        roughness: 0.85,
      });
      res.geometries.push(beachGeo);
      res.materials.push(beachMat);
      const beach = new THREE.Mesh(beachGeo, beachMat);
      beach.position.y = -0.14;
      beach.receiveShadow = true;
      beach.userData.worldId = world.id;
      grp.add(beach);

      // Colorful top plateau
      const topGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.34, 28);
      const topMat = new THREE.MeshStandardMaterial({
        color: islandTopColors[world.id],
        roughness: 0.6,
      });
      res.geometries.push(topGeo);
      res.materials.push(topMat);
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 0.08;
      top.castShadow = true;
      top.receiveShadow = true;
      top.userData.worldId = world.id;
      grp.add(top);

      // Glowing Selection Ring
      const ringGeo = new THREE.TorusGeometry(2.28, 0.09, 12, 48);
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(world.accentHex),
        emissive: new THREE.Color(world.accentHex),
        emissiveIntensity: world.id === selectedRef.current ? 0.95 : 0.22,
        transparent: true,
        opacity: world.id === selectedRef.current ? 1 : 0.55,
      });
      res.geometries.push(ringGeo);
      res.materials.push(ringMat);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.02;
      grp.add(ring);
      ringsMapRef.current.set(world.id, ring);

      // Miniature 3D landmark per island
      let prop: THREE.Group;
      if (world.toyboxModel === 'apple_tree') {
        prop = buildAppleTree(res);
        prop.scale.setScalar(0.55);
      } else if (world.toyboxModel === 'math_robot') {
        prop = buildMathRobot(res);
        prop.scale.setScalar(0.6);
      } else if (world.toyboxModel === 'race_car') {
        prop = buildRaceCar(res);
        prop.scale.setScalar(0.65);
      } else if (world.toyboxModel === 'rocket') {
        prop = buildRocket(res);
        prop.scale.setScalar(0.6);
      } else if (world.toyboxModel === 'toy_train') {
        prop = buildToyTrain(res);
        prop.scale.setScalar(0.52);
      } else {
        prop = buildStarTrophy(res);
        prop.scale.setScalar(0.7);
      }
      prop.position.set(0, 0.25, 0);
      prop.traverse((child) => {
        child.userData.worldId = world.id;
      });
      grp.add(prop);

      // Visual lock indicator floating crystal for locked islands
      const lockGrp = new THREE.Group();
      const lockBaseGeo = new THREE.BoxGeometry(0.55, 0.45, 0.28);
      const lockBaseMat = new THREE.MeshStandardMaterial({
        color: 0xffd43b,
        emissive: 0xff963c,
        emissiveIntensity: 0.35,
        metalness: 0.5,
        roughness: 0.3,
      });
      const lockLoopGeo = new THREE.TorusGeometry(0.18, 0.055, 10, 20, Math.PI);
      res.geometries.push(lockBaseGeo, lockLoopGeo);
      res.materials.push(lockBaseMat);
      const lb = new THREE.Mesh(lockBaseGeo, lockBaseMat);
      const ll = new THREE.Mesh(lockLoopGeo, lockBaseMat);
      ll.position.y = 0.25;
      lockGrp.add(lb, ll);
      lockGrp.position.set(0, 2.35, 0);
      lockGrp.visible = !unlockedRef.current.includes(world.id);
      grp.add(lockGrp);
      lockMarkersMapRef.current.set(world.id, lockGrp);

      scene.add(grp);
      islandGroups.push(grp);
      islandHitTargets.push(grp);
    });

    // Raycast tap detection without misfiring on OrbitControls drags
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(islandHitTargets, true);
      if (hits.length > 0) {
        const wId = hits[0].object.userData.worldId as WorldId | undefined;
        if (wId) {
          onSelectRef.current(wId);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(280, container.clientWidth);
      const h = Math.max(240, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let elapsed = 0;

    const afterDraw = () => {
      if (disposed) return;
      if (isSoftwareGl) {
        const gl = renderer.getContext();
        if (gl) gl.finish();
        setTimeout(() => {
          if (!disposed) rafId = requestAnimationFrame(tick);
        }, 0);
      } else {
        rafId = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      islandGroups.forEach((grp) => {
        grp.position.y = grp.userData.baseY + Math.sin(elapsed * 1.3 + grp.userData.phase) * 0.08;
        const wId = grp.userData.worldId as WorldId;
        const lockGrp = lockMarkersMapRef.current.get(wId);
        if (lockGrp && lockGrp.visible) {
          lockGrp.rotation.y += dt * 1.4;
        }
      });

      if (targetGlideRef.current) {
        controls.target.lerp(targetGlideRef.current, Math.min(1, dt * 4.5));
        if (controls.target.distanceTo(targetGlideRef.current) < 0.08) {
          targetGlideRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      afterDraw();
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      res.geometries.forEach((g) => g.dispose());
      res.materials.forEach((m) => m.dispose());
      res.shadowTexture.dispose();
      res.bumpTexture.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-[250px] sm:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
};
