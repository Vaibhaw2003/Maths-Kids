import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MascotId } from '../types/game';
import {
  Shared3DResources,
  buildAppleTree,
  buildCelebrationStarMesh,
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

interface HeroMascot3DCanvasProps {
  mascotId: MascotId;
  carSkin?: string;
  robotSkin?: string;
  envTheme?: string;
}

export const HeroMascot3DCanvas: React.FC<HeroMascot3DCanvasProps> = ({
  mascotId,
  carSkin = 'default',
  robotSkin = 'default',
  envTheme = 'default',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef(mascotId);
  const carSkinRef = useRef(carSkin);
  const robotSkinRef = useRef(robotSkin);
  const envThemeRef = useRef(envTheme);

  mascotRef.current = mascotId;
  carSkinRef.current = carSkin;
  robotSkinRef.current = robotSkin;
  envThemeRef.current = envTheme;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(260, container.clientWidth || 420);
    const height = Math.max(220, container.clientHeight || 280);

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
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const skyHex =
      envThemeRef.current === 'theme_cosmic'
        ? 0x2b3a8c
        : envThemeRef.current === 'theme_aurora'
        ? 0x2980b9
        : 0x56b9ff;
    scene.background = new THREE.Color(skyHex);
    scene.fog = new THREE.Fog(skyHex, 14, 34);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 60);
    camera.position.set(4.5, 3.3, 5.4);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;
    controls.minPolarAngle = Math.PI / 5;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.target.set(0, 1.0, 0);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x35d982, 0.85);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff6dc, 1.45);
    sunLight.position.set(5, 8, 5);
    if (!isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 20;
      sunLight.shadow.camera.left = -4;
      sunLight.shadow.camera.right = 4;
      sunLight.shadow.camera.top = 4;
      sunLight.shadow.camera.bottom = -4;
    }
    scene.add(sunLight);

    const res: Shared3DResources = {
      geometries: [],
      materials: [],
      shadowTexture: createContactShadowTexture(),
      bumpTexture: createBrushedGrainTexture(renderer.capabilities.getMaxAnisotropy()),
    };

    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    // Colorful floating cartoon adventure island base
    const grassGeo = new THREE.CylinderGeometry(2.65, 2.55, 0.42, 32);
    const grassMat = new THREE.MeshStandardMaterial({
      color: 0x43e890,
      roughness: 0.65,
      metalness: 0.02,
    });
    res.geometries.push(grassGeo);
    res.materials.push(grassMat);
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = -0.18;
    grass.receiveShadow = true;
    islandGroup.add(grass);

    const earthGeo = new THREE.ConeGeometry(2.55, 1.85, 24);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xd9864e,
      roughness: 0.8,
      metalness: 0.0,
    });
    res.geometries.push(earthGeo);
    res.materials.push(earthMat);
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.rotation.x = Math.PI;
    earth.position.y = -1.28;
    islandGroup.add(earth);

    // Decorative glowing cyan ring on pedestal
    const ringGeo = new THREE.TorusGeometry(2.25, 0.06, 12, 48);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    });
    res.geometries.push(ringGeo);
    res.materials.push(ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.04;
    islandGroup.add(ring);

    // Centerpiece 3D Hero Model matching the active mascot adventure vibe
    let heroModel: THREE.Group;
    if (mascotRef.current === 'coco') {
      heroModel = buildRaceCar(res);
      heroModel.scale.setScalar(0.95);
    } else if (mascotRef.current === 'bella') {
      heroModel = buildMathRobot(res);
      heroModel.scale.setScalar(0.92);
    } else {
      heroModel = buildAppleTree(res);
      heroModel.scale.setScalar(0.85);
    }
    heroModel.position.set(0, 0.03, 0);
    islandGroup.add(heroModel);

    // Apply equipped skin accents subtly if selected
    if (mascotRef.current === 'coco' && carSkinRef.current !== 'default') {
      const skinColor = carSkinRef.current === 'car_emerald' ? 0x35d982 : 0xa855f7;
      heroModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.color && mat.color.getHex() === 0x287bff) {
            mat.color.setHex(skinColor);
          }
        }
      });
    }
    if (mascotRef.current === 'bella' && robotSkinRef.current !== 'default') {
      const rColor = robotSkinRef.current === 'robot_gold' ? 0xffd43b : 0x287bff;
      heroModel.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.isMesh && mesh.material && !Array.isArray(mesh.material)) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          if (mat.color && (mat.color.getHex() === 0x9755f5 || mat.color.getHex() === 0x7c3aed)) {
            mat.color.setHex(rColor);
          }
        }
      });
    }

    // Companion mini props around the island
    const miniTrophy = buildStarTrophy(res);
    miniTrophy.scale.setScalar(0.45);
    miniTrophy.position.set(-1.55, 0.03, 0.95);
    islandGroup.add(miniTrophy);

    const miniTrain = buildToyTrain(res);
    miniTrain.scale.setScalar(0.36);
    miniTrain.position.set(1.45, 0.03, 0.85);
    miniTrain.rotation.y = -0.6;
    islandGroup.add(miniTrain);

    const miniRocket = buildRocket(res);
    miniRocket.scale.setScalar(0.4);
    miniRocket.position.set(1.2, 0.15, -1.25);
    islandGroup.add(miniRocket);

    // Orbiting golden stars
    const orbitingStars: THREE.Mesh[] = [];
    const starColors = [0xffd43b, 0x22d3ee, 0xff5b6e, 0x35d982];
    for (let i = 0; i < 4; i++) {
      const s = buildCelebrationStarMesh(res, starColors[i]);
      s.scale.setScalar(0.85);
      scene.add(s);
      orbitingStars.push(s);
    }

    // Fluffy stylized cartoon clouds in sky
    const cloudGeo = new THREE.SphereGeometry(0.45, 14, 14);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0,
    });
    res.geometries.push(cloudGeo);
    res.materials.push(cloudMat);
    const clouds: THREE.Group[] = [];
    [
      [-3.8, 3.2, -3.5],
      [3.9, 3.6, -4.2],
      [0.4, 4.1, -5.0],
    ].forEach(([cx, cy, cz], idx) => {
      const cg = new THREE.Group();
      const c1 = new THREE.Mesh(cloudGeo, cloudMat);
      const c2 = new THREE.Mesh(cloudGeo, cloudMat);
      c2.position.set(0.42, -0.06, 0);
      c2.scale.setScalar(0.75);
      const c3 = new THREE.Mesh(cloudGeo, cloudMat);
      c3.position.set(-0.42, -0.08, 0);
      c3.scale.setScalar(0.72);
      cg.add(c1, c2, c3);
      cg.position.set(cx, cy, cz);
      cg.userData.baseX = cx;
      cg.userData.phase = idx * 1.4;
      scene.add(cg);
      clouds.push(cg);
    });

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(260, container.clientWidth);
      const h = Math.max(220, container.clientHeight);
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

      islandGroup.position.y = Math.sin(elapsed * 1.4) * 0.08;
      miniRocket.position.y = 0.24 + Math.sin(elapsed * 2.3) * 0.1;

      orbitingStars.forEach((st, idx) => {
        const angle = elapsed * 0.9 + (idx * Math.PI * 2) / orbitingStars.length;
        st.position.set(
          Math.cos(angle) * 2.55,
          1.45 + Math.sin(elapsed * 2.1 + idx) * 0.28,
          Math.sin(angle) * 2.55
        );
        st.rotation.y += dt * 1.6;
      });

      clouds.forEach((cg) => {
        cg.position.x = cg.userData.baseX + Math.sin(elapsed * 0.35 + cg.userData.phase) * 0.45;
      });

      controls.update();
      renderer.render(scene, camera);
      afterDraw();
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
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
  }, [mascotId, carSkin, robotSkin, envTheme]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[240px] sm:min-h-[290px] rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
};
